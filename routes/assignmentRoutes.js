import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
  editAssignment,
  deleteAssignment,
  submitAssignment,
  getStudentSubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getTeacherAssignments,
} from "../controllers/assignmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// All assignment routes require authentication
router.use(protect);

// Get all assignments for a course (Student or Teacher)
router.get("/course/:courseId", getAssignmentsByCourse);

// Teacher-only assignment management routes
router.post("/", authorize("teacher"), createAssignment);
router.get("/teacher", authorize("teacher"), getTeacherAssignments);
router.put("/:id", authorize("teacher"), editAssignment);
router.delete("/:id", authorize("teacher"), deleteAssignment);
router.get("/:id/submissions", authorize("teacher"), getAssignmentSubmissions);
router.put("/submissions/:submissionId/grade", authorize("teacher"), gradeSubmission);

// Student-only assignment submission routes
router.post("/:id/submit", authorize("student"), upload.single("file"), submitAssignment);
router.get("/:id/submission", authorize("student"), getStudentSubmission);

export default router;
