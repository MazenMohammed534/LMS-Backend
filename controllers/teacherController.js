import Course from "../models/Course.js";
import User from "../models/User.js";
import CourseMaterial from "../models/CourseMaterial.js";
import Assignment from "../models/Assignment.js";
import Quiz from "../models/Quiz.js";
import fs from "fs";
import path from "path";

// @desc    Get courses taught by the logged-in teacher
// @route   GET /api/teacher/courses
// @access  Private/Teacher
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new course
// @route   POST /api/teacher/courses
// @access  Private/Teacher
export const createCourse = async (req, res) => {
  try {
    const { coursename, coursecode, year, department, cover } = req.body;

    // Check if course code is unique
    const courseExists = await Course.findOne({ code: coursecode });
    if (courseExists) {
      return res.status(400).json({ success: false, message: "Course code already exists" });
    }

    const course = await Course.create({
      name: coursename,
      code: coursecode,
      year: Number(year),
      department,
      createdBy: req.user._id,
      cover: cover || "uploads/default-course-cover.png",
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit a course
// @route   PUT /api/teacher/courses/:id
// @access  Private/Teacher
export const editCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to modify this course" });
    }

    course.name = req.body.coursename || course.name;
    course.year = req.body.year !== undefined ? Number(req.body.year) : course.year;
    course.department = req.body.department || course.department;
    if (req.body.isArchived !== undefined) {
      course.isArchived = req.body.isArchived;
    }
    if (req.body.cover !== undefined) {
      course.cover = req.body.cover;
    }

    const updatedCourse = await course.save();
    res.json({ success: true, course: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete/Archive a course
// @route   DELETE /api/teacher/courses/:id
// @access  Private/Teacher
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this course" });
    }

    // Delete course materials from DB and filesystem
    const materials = await CourseMaterial.find({ courseId: course._id });
    for (const mat of materials) {
      try {
        if (fs.existsSync(mat.file)) {
          fs.unlinkSync(mat.file);
        }
      } catch (err) {
        console.error(`Error deleting file: ${mat.file}`, err);
      }
    }
    await CourseMaterial.deleteMany({ courseId: course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Course and associated materials deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get students enrolled in a course
// @route   GET /api/teacher/courses/:id/students
// @access  Private/Teacher
export const getCourseStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate("students", "name email");

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to access this course" });
    }

    res.json({ success: true, students: course.students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload Course Material
// @route   POST /api/teacher/materials
// @access  Private/Teacher
export const uploadMaterial = async (req, res) => {
  try {
    const { courseId, title } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      // Remove file if course doesn't exist
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify course ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(403).json({ success: false, message: "Not authorized to upload material to this course" });
    }

    const fileType = path.extname(req.file.originalname).substring(1); // e.g. pdf, png

    const material = await CourseMaterial.create({
      courseId,
      title,
      file: req.file.path, // save local path
      fileType,
    });

    res.status(201).json({ success: true, material });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete Course Material
// @route   DELETE /api/teacher/materials/:id
// @access  Private/Teacher
export const deleteMaterial = async (req, res) => {
  try {
    const material = await CourseMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    const course = await Course.findById(material.courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Associated course not found" });
    }

    // Verify course ownership
    if (course.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to delete materials from this course" });
    }

    // Delete file from storage
    if (fs.existsSync(material.file)) {
      fs.unlinkSync(material.file);
    }

    await CourseMaterial.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Material deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher dashboard stats
// @route   GET /api/teacher/stats
// @access  Private/Teacher
export const getTeacherStats = async (req, res) => {
  try {
    const teacherId = req.user._id;

    // 1. Count courses created by this teacher
    const coursesCount = await Course.countDocuments({ createdBy: teacherId });

    // 2. Count assignments created by this teacher
    const assignmentsCount = await Assignment.countDocuments({ createdBy: teacherId });

    // 3. Count quizzes created by this teacher
    const quizzesCount = await Quiz.countDocuments({ createdBy: teacherId });

    // 4. Calculate total unique students enrolled in all courses created by this teacher
    const courses = await Course.find({ createdBy: teacherId });
    const studentIds = new Set();
    courses.forEach((course) => {
      if (course.students && Array.isArray(course.students)) {
        course.students.forEach((id) => studentIds.add(id.toString()));
      }
    });
    const studentsCount = studentIds.size;

    res.json({
      success: true,
      stats: {
        courses: coursesCount,
        assignments: assignmentsCount,
        quizzes: quizzesCount,
        students: studentsCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

