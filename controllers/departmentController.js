import Department from "../models/Department.js";

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({}).sort({ name: 1 });
    res.json({
      success: true,
      departments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new department
// @route   POST /api/departments
// @access  Private/Admin
export const addDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Please provide a department name" });
    }

    // Check if department already exists
    const departmentExists = await Department.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, "i") } });
    if (departmentExists) {
      return res.status(400).json({ success: false, message: "Department already exists" });
    }

    const department = await Department.create({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: "Department added successfully",
      department,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a department
// @route   PUT /api/departments/:id
// @access  Private/Admin
export const editDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Please provide a department name" });
    }

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    // Check if name is taken by another department
    const nameExists = await Department.findOne({
      _id: { $ne: req.params.id },
      name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
    });
    if (nameExists) {
      return res.status(400).json({ success: false, message: "Another department with this name already exists" });
    }

    department.name = name.trim();
    const updatedDepartment = await department.save();

    res.json({
      success: true,
      message: "Department updated successfully",
      department: updatedDepartment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a department
// @route   DELETE /api/departments/:id
// @access  Private/Admin
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: "Department not found" });
    }

    await Department.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
