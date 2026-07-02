import mongoose from "mongoose";
import path from "path";

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a course name"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Please add a course code"],
      unique: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Please add a department"],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, "Please add an academic year"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    cover: {
      type: String,
      default: "uploads/default-course-cover.jpg",
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const transformFn = (doc, ret) => {
  if (ret.cover) {
    ret.cover = `api/materials/download/${path.basename(ret.cover)}`;
  }
  return ret;
};

courseSchema.set("toJSON", { transform: transformFn });
courseSchema.set("toObject", { transform: transformFn });

const Course = mongoose.model("Course", courseSchema);

export default Course;
