import User from "../models/User.js";
import Course from "../models/Course.js";

// @desc    Get dashboard statistics (Total Students, Teachers, Courses)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTeachers = await User.countDocuments({ role: "teacher" });
    const totalCourses = await Course.countDocuments({});

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users, optionally filtered by role
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role && ["admin", "teacher", "student"].includes(role)) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new user (admin, teacher, or student)
// @route   POST /api/admin/users
// @access  Private/Admin
export const addUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    if (!role || !["admin", "teacher", "student"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing role" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const userFields = { name, email, password, role };

    const user = await User.create(userFields);

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} added successfully`,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const editUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    const userResponse = {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    res.json({
      success: true,
      user: userResponse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses (system-wide view for Admin)
// @route   GET /api/admin/courses?archived=true|false
// @access  Private/Admin
export const getCourses = async (req, res) => {
  try {
    const filter = {};

    if (req.query.archived === "true") {
      filter.isArchived = true;
    } else if (req.query.archived === "false") {
      filter.isArchived = false;
    }

    const courses = await Course.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive a single course
// @route   PUT /api/admin/courses/:id/archive
// @access  Private/Admin
export const archiveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (course.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Course is already archived",
      });
    }

    course.isArchived = true;
    await course.save();

    res.json({
      success: true,
      message: "Course archived successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Archive all active courses
// @route   PUT /api/admin/courses/archive-all
// @access  Private/Admin
export const archiveAllCourses = async (req, res) => {
  try {
    const result = await Course.updateMany(
      { isArchived: false },
      { $set: { isArchived: true } },
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} course(s) archived successfully`,
      archivedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore a single archived course
// @route   PUT /api/admin/courses/:id/unarchive
// @access  Private/Admin
export const unarchiveCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    if (!course.isArchived) {
      return res.status(400).json({
        success: false,
        message: "Course is not archived",
      });
    }

    course.isArchived = false;
    await course.save();

    res.json({
      success: true,
      message: "Course restored successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
