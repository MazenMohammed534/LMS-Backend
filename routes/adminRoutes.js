import express from "express";
import {
  getStats,
  getUsers,
  addUser,
  editUser,
  deleteUser,
  getCourses,
  archiveCourse,
  archiveAllCourses,
  unarchiveCourse,
  getDepartments,
  addDepartment,
  editDepartment,
  deleteDepartment,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require login and Admin role
router.use(protect);
router.use(authorize("admin"));

router.get("/stats", getStats);
router.route("/users")
  .get(getUsers)
  .post(addUser);

router.route("/users/:id")
  .put(editUser)
  .delete(deleteUser);

router.get("/courses", getCourses);
router.put("/courses/archive-all", archiveAllCourses);
router.put("/courses/:id/archive", archiveCourse);
router.put("/courses/:id/unarchive", unarchiveCourse);

// Department management routes
router.route("/departments")
  .get(getDepartments)
  .post(addDepartment);

router.route("/departments/:id")
  .put(editDepartment)
  .delete(deleteDepartment);

export default router;
