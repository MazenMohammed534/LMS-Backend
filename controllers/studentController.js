import Course from "../models/Course.js";
import CourseMaterial from "../models/CourseMaterial.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";

// @desc    Get courses the logged-in student is enrolled in
// @route   GET /api/student/courses
// @access  Private/Student
export const getEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in a course by course code
// @route   POST /api/student/courses/join
// @access  Private/Student
export const joinCourse = async (req, res) => {
  try {
    const { coursecode } = req.body;

    if (!coursecode) {
      return res.status(400).json({ success: false, message: "Course code is required" });
    }

    // Find course by code
    const course = await Course.findOne({ code: coursecode });

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found with this code" });
    }

    if (course.isArchived) {
      return res.status(400).json({ success: false, message: "Cannot join an archived course" });
    }

    // Check if student is already enrolled
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course" });
    }

    // Add student to the course
    course.students.push(req.user._id);
    await course.save();

    res.json({
      success: true,
      message: "Successfully joined the course",
      course: {
        _id: course._id,
        name: course.name,
        code: course.code,
        department: course.department,
        year: course.year,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get materials for an enrolled course
// @route   GET /api/student/courses/:courseId/materials
// @access  Private/Student
export const getCourseMaterials = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Verify student is enrolled in this course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (!course.students.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: "You must be enrolled to view course materials" });
    }

    const materials = await CourseMaterial.find({ courseId }).sort({ uploadedAt: -1 });
    res.json({ success: true, materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student dashboard stats
// @route   GET /api/student/stats
// @access  Private/Student
export const getStudentStats = async (req, res) => {
  try {
    const enrolledCoursesCount = await Course.countDocuments({ students: req.user._id });

    // Find all courses student is enrolled in to find tasks and quizzes counts
    const courses = await Course.find({ students: req.user._id });
    const courseIds = courses.map(c => c._id);

    const totalTasks = await Assignment.countDocuments({ courseId: { $in: courseIds } });
    const totalQuizzes = await Quiz.countDocuments({ courseId: { $in: courseIds } });

    res.json({
      success: true,
      stats: {
        enrolledCourses: enrolledCoursesCount,
        tasks: totalTasks,
        quizzes: totalQuizzes,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
