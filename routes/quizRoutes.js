import express from "express";
import {
  createQuiz,
  getQuizzesByCourse,
  getQuizById,
  getQuizForTaking,
  submitQuiz,
  editQuiz,
  deleteQuiz,
  getQuizSubmissions,
  getTeacherQuizzes,
} from "../controllers/quizController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All quiz routes require authentication
router.use(protect);

// Get all quizzes for a course (Student or Teacher)
router.get("/course/:courseId", getQuizzesByCourse);

// Teacher-only management routes
router.post("/", authorize("teacher"), createQuiz);
router.get("/teacher", authorize("teacher"), getTeacherQuizzes);
router.get("/:id", authorize("teacher"), getQuizById);
router.put("/:id", authorize("teacher"), editQuiz);
router.delete("/:id", authorize("teacher"), deleteQuiz);
router.get("/:id/submissions", authorize("teacher"), getQuizSubmissions);

// Student-only quiz taking routes
router.get("/:id/take", authorize("student"), getQuizForTaking);
router.post("/:id/submit", authorize("student"), submitQuiz);

export default router;
