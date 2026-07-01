import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import connectDB from "./config/db.js";
import seedAdmin from "./config/seed.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Seed admin user
  seedAdmin();
});

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
const __dirname = path.resolve();
const uploadFolder = process.env.VERCEL ? "/tmp" : path.join(__dirname, "/uploads");
app.use("/uploads", express.static(uploadFolder));

// Public Download Endpoint
app.get("/api/materials/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const safeFileName = path.basename(fileName);
  const filePath = path.join(uploadFolder, safeFileName);

  if (fs.existsSync(filePath)) {
    res.download(filePath, safeFileName);
  } else {
    res.status(404).json({ success: false, message: "File not found" });
  }
});

// Mount API Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);

// Root Route
app.get("/", (req, res) => {
  res.json({ message: "LMS API Backend is running successfully" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in development mode on port ${PORT}`);
});
