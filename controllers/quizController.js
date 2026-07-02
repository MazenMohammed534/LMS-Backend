import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import QuizSubmission from "../models/QuizSubmission.js";
import Course from "../models/Course.js";

// @desc    Create a new quiz (with questions)
// @route   POST /api/quizzes
// @access  Private/Teacher
export const createQuiz = async (req, res) => {
  try {
    const { courseId, title, dueDate, timeLimit, questions, questionsCount, questionsNumber } = req.body;

    if (!courseId || !title || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "Please provide courseId, title, and questions array" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify course ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to add a quiz to this course" });
    }

    const finalQuestionsCount = (questionsCount !== undefined && questionsCount !== null)
      ? Number(questionsCount)
      : ((questionsNumber !== undefined && questionsNumber !== null)
        ? Number(questionsNumber)
        : questions.length);

    const quiz = await Quiz.create({
      courseId,
      title,
      dueDate,
      timeLimit: timeLimit || 0,
      questionsCount: finalQuestionsCount,
      createdBy: req.user._id,
    });

    const questionsWithQuizId = questions.map((q) => ({
      ...q,
      quizId: quiz._id,
    }));

    const createdQuestions = await Question.insertMany(questionsWithQuizId);

    res.status(201).json({ success: true, quiz, questions: createdQuestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify user is teacher or enrolled student
    const isTeacher = course.createdBy.toString() === req.user._id.toString();
    const isStudent = course.students.includes(req.user._id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ success: false, message: "Not authorized to access quizzes for this course" });
    }

    const quizzes = await Quiz.find({ courseId }).sort({ createdAt: -1 });

    // If student, populate submission status and score
    if (req.user.role === "student") {
      const quizzesWithStatus = await Promise.all(
        quizzes.map(async (quiz) => {
          const submission = await QuizSubmission.findOne({
            quizId: quiz._id,
            studentId: req.user._id,
          });

          return {
            ...quiz.toObject(),
            completionStatus: submission ? submission.completionStatus : "not completed",
            score: submission ? submission.score : null,
          };
        })
      );
      return res.json({ success: true, quizzes: quizzesWithStatus });
    }

    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quiz details (for teachers - includes correct answers)
// @route   GET /api/quizzes/:id
// @access  Private/Teacher
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view this quiz" });
    }

    const questions = await Question.find({ quizId: quiz._id });
    res.json({ success: true, quiz, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get quiz for taking (for students - excludes correct answers)
// @route   GET /api/quizzes/:id/take
// @access  Private/Student
export const getQuizForTaking = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || !course.students.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized or not enrolled in this course" });
    }

    if (quiz.status === "closed") {
      return res.status(400).json({ success: false, message: "This quiz is closed" });
    }

    // Check if student already submitted
    const existingSubmission = await QuizSubmission.findOne({
      quizId: quiz._id,
      studentId: req.user._id,
      completionStatus: "completed",
    });

    if (existingSubmission) {
      return res.status(400).json({ success: false, message: "You have already completed this quiz" });
    }

    // Exclude correctAnswer field
    const questions = await Question.find({ quizId: quiz._id }).select("-correctAnswer");
    res.json({ success: true, quiz, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit quiz answers and autograde
// @route   POST /api/quizzes/:id/submit
// @access  Private/Student
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // array of { questionId, answer }
    const quizId = req.params.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "Answers array is required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || !course.students.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized or not enrolled in this course" });
    }

    if (quiz.status === "closed") {
      return res.status(400).json({ success: false, message: "This quiz is closed" });
    }

    // Check for previous completed submission
    const existingSubmission = await QuizSubmission.findOne({
      quizId,
      studentId: req.user._id,
      completionStatus: "completed",
    });
    if (existingSubmission) {
      return res.status(400).json({ success: false, message: "Quiz already submitted" });
    }

    // Autograding logic
    const questions = await Question.find({ quizId });
    let score = 0;

    const gradedAnswers = answers.map((ans) => {
      const q = questions.find((quest) => quest._id.toString() === ans.questionId);
      if (q && q.correctAnswer.trim().toLowerCase() === ans.answer.trim().toLowerCase()) {
        score += q.points;
      }
      return {
        questionId: ans.questionId,
        answer: ans.answer,
      };
    });

    const submission = await QuizSubmission.create({
      quizId,
      studentId: req.user._id,
      answers: gradedAnswers,
      score,
      completionStatus: "completed",
      submittedAt: Date.now(),
    });

    res.status(201).json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit a quiz details & questions
// @route   PUT /api/quizzes/:id
// @access  Private/Teacher
export const editQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this quiz" });
    }

    const { title, dueDate, timeLimit, status, questions, questionsCount, questionsNumber } = req.body;

    quiz.title = title || quiz.title;
    quiz.dueDate = dueDate !== undefined ? dueDate : quiz.dueDate;
    quiz.timeLimit = timeLimit !== undefined ? timeLimit : quiz.timeLimit;
    quiz.status = status || quiz.status;

    if (questions && Array.isArray(questions)) {
      // Remove old questions and insert new ones
      await Question.deleteMany({ quizId: quiz._id });
      const questionsWithQuizId = questions.map((q) => ({
        ...q,
        quizId: quiz._id,
      }));
      await Question.insertMany(questionsWithQuizId);
      
      const finalQuestionsCount = (questionsCount !== undefined && questionsCount !== null)
        ? Number(questionsCount)
        : ((questionsNumber !== undefined && questionsNumber !== null)
          ? Number(questionsNumber)
          : questions.length);
      quiz.questionsCount = finalQuestionsCount;
    } else if (questionsCount !== undefined && questionsCount !== null) {
      quiz.questionsCount = Number(questionsCount);
    } else if (questionsNumber !== undefined && questionsNumber !== null) {
      quiz.questionsCount = Number(questionsNumber);
    }

    const updatedQuiz = await quiz.save();
    res.json({ success: true, quiz: updatedQuiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private/Teacher
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this quiz" });
    }

    await Question.deleteMany({ quizId: quiz._id });
    await QuizSubmission.deleteMany({ quizId: quiz._id });
    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Quiz and all questions/submissions deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for a quiz
// @route   GET /api/quizzes/:id/submissions
// @access  Private/Teacher
export const getQuizSubmissions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const course = await Course.findById(quiz.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view submissions" });
    }

    const submissions = await QuizSubmission.find({ quizId: quiz._id })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all quizzes created by the logged-in teacher
// @route   GET /api/quizzes/teacher
// @access  Private/Teacher
export const getTeacherQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own submission details for a quiz
// @route   GET /api/quizzes/:id/submission
// @access  Private/Student
export const getStudentQuizSubmission = async (req, res) => {
  try {
    const quizId = req.params.id;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    const submission = await QuizSubmission.findOne({ quizId, studentId });
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    // Retrieve all questions for this quiz
    const questions = await Question.find({ quizId });

    // Combine questions with student chosen answers and correct answers
    const questionsWithAnswers = questions.map((question) => {
      const studentAnswerObj = submission.answers.find(
        (ans) => ans.questionId.toString() === question._id.toString()
      );
      
      return {
        _id: question._id,
        text: question.text,
        options: question.options,
        points: question.points,
        correctAnswer: question.correctAnswer,
        studentAnswer: studentAnswerObj ? studentAnswerObj.answer : "",
      };
    });

    res.json({
      success: true,
      quiz,
      submission: {
        _id: submission._id,
        score: submission.score,
        completionStatus: submission.completionStatus,
        submittedAt: submission.submittedAt,
        questions: questionsWithAnswers,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

