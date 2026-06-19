import express from "express";
import {
  getEnrolledCourses,
  joinCourse,
  getCourseMaterials,
  getStudentStats,
} from "../controllers/studentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("student"));

router.get("/courses", getEnrolledCourses);
router.post("/courses/join", joinCourse);
router.get("/courses/:courseId/materials", getCourseMaterials);
router.get("/stats", getStudentStats);

export default router;
