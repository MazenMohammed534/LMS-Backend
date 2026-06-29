import Assignment from "../models/Assignment.js";
import AssignmentSubmission from "../models/AssignmentSubmission.js";
import Course from "../models/Course.js";
import fs from "fs";

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, dueDate } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ success: false, message: "Course ID and Title are required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify course ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to create assignments for this course" });
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description: description || "",
      dueDate,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
export const getAssignmentsByCourse = async (req, res) => {
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
      return res.status(403).json({ success: false, message: "Not authorized to view assignments for this course" });
    }

    const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit an assignment
// @route   PUT /api/assignments/:id
// @access  Private/Teacher
export const editAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to modify this assignment" });
    }

    const { title, description, dueDate, status } = req.body;

    assignment.title = title || assignment.title;
    assignment.description = description !== undefined ? description : assignment.description;
    assignment.dueDate = dueDate !== undefined ? dueDate : assignment.dueDate;
    assignment.status = status || assignment.status;

    const updatedAssignment = await assignment.save();
    res.json({ success: true, assignment: updatedAssignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete an assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Teacher
export const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this assignment" });
    }

    // Delete associated submission files if they exist
    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id });
    for (const sub of submissions) {
      if (sub.submittedFile && fs.existsSync(sub.submittedFile)) {
        try {
          fs.unlinkSync(sub.submittedFile);
        } catch (err) {
          console.error(`Error deleting submission file: ${sub.submittedFile}`, err);
        }
      }
    }

    await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
    await Assignment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Assignment and all student submissions deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an assignment (allows file and/or text)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
export const submitAssignment = async (req, res) => {
  try {
    const assignmentId = req.params.id;
    const { submittedText } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      // Clean up uploaded file if request fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course || !course.students.includes(req.user._id)) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ success: false, message: "Not authorized or not enrolled in this course" });
    }

    // Check if submission already exists
    let submission = await AssignmentSubmission.findOne({
      assignmentId,
      studentId: req.user._id,
    });

    if (submission) {
      // If student is updating their submission, delete the old file first if new one is uploaded
      if (req.file && submission.submittedFile && fs.existsSync(submission.submittedFile)) {
        try {
          fs.unlinkSync(submission.submittedFile);
        } catch (err) {
          console.error(`Error deleting old submission file: ${submission.submittedFile}`, err);
        }
      }

      submission.submittedText = submittedText !== undefined ? submittedText : submission.submittedText;
      if (req.file) {
        submission.submittedFile = req.file.path;
      }
      submission.completionStatus = "pending";
      submission.submittedAt = Date.now();
      await submission.save();
    } else {
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId: req.user._id,
        submittedText: submittedText || "",
        submittedFile: req.file ? req.file.path : "",
        completionStatus: "pending", // becomes "Done" once graded
        submittedAt: Date.now(),
      });
    }

    res.status(201).json({ success: true, submission });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own submission for an assignment
// @route   GET /api/assignments/:id/submission
// @access  Private/Student
export const getStudentSubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findOne({
      assignmentId: req.params.id,
      studentId: req.user._id,
    });

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher
export const getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to view submissions" });
    }

    const submissions = await AssignmentSubmission.find({ assignmentId: assignment._id })
      .populate("studentId", "name email")
      .sort({ submittedAt: -1 });

    res.json({ success: true, submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade/score a student's assignment submission
// @route   PUT /api/assignments/submissions/:submissionId/grade
// @access  Private/Teacher
export const gradeSubmission = async (req, res) => {
  try {
    const { score, status } = req.body;

    const submission = await AssignmentSubmission.findById(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Associated assignment not found" });
    }

    const course = await Course.findById(assignment.courseId);
    if (!course || course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to grade this submission" });
    }

    if (score !== undefined) {
      submission.score = Number(score);
    }
    
    if (status) {
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status. Use 'approved' or 'rejected'" });
      }
      submission.completionStatus = status;
    } else {
      submission.completionStatus = "approved";
    }

    await submission.save();

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all assignments created by the logged-in teacher
// @route   GET /api/assignments/teacher
// @access  Private/Teacher
export const getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .populate("courseId", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

