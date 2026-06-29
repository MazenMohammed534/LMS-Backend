import express from "express";
import {
  getCourses,
  createCourse,
  editCourse,
  deleteCourse,
  getCourseStudents,
  uploadMaterial,
  deleteMaterial,
  getTeacherStats,
  getCourseDetails,
} from "../controllers/teacherController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("teacher"));

router.get("/stats", getTeacherStats);

router.route("/courses")
  .get(getCourses)
  .post(createCourse);

router.route("/courses/:id")
  .get(getCourseDetails)
  .put(editCourse)
  .delete(deleteCourse);

router.get("/courses/:id/students", getCourseStudents);

router.post("/materials", upload.single("file"), uploadMaterial);
router.delete("/materials/:id", deleteMaterial);

export default router;
