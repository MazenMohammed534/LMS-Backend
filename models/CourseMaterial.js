import mongoose from "mongoose";
import path from "path";

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

const transformFn = (doc, ret) => {
  if (ret.file) {
    ret.file = `/api/materials/download/${path.basename(ret.file)}`;
  }
  return ret;
};

courseMaterialSchema.set("toJSON", { transform: transformFn });
courseMaterialSchema.set("toObject", { transform: transformFn });

const CourseMaterial = mongoose.model("CourseMaterial", courseMaterialSchema);

export default CourseMaterial;
