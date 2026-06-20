import express from "express";
import {
  getDepartments,
  addDepartment,
  editDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get departments (all authenticated users can read)
router.get("/", protect, getDepartments);

// Admin-only management endpoints
router.post("/", protect, authorize("admin"), addDepartment);
router.put("/:id", protect, authorize("admin"), editDepartment);
router.delete("/:id", protect, authorize("admin"), deleteDepartment);

export default router;
