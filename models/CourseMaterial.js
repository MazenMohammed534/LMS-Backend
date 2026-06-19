import mongoose from "mongoose";

const courseMaterialSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Please add a material title"],
      trim: true,
    },
    file: {
      type: String,
      required: [true, "Please add a file path"],
    },
    fileType: {
      type: String,
      default: "",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);

export default CourseMaterial;
