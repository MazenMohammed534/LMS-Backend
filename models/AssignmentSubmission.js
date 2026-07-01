import mongoose from "mongoose";
import path from "path";

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedFile: {
      type: String,
      default: "",
    },
    submittedFileOriginalName: {
      type: String,
      default: "",
    },
    submittedText: {
      type: String,
      default: "",
      required: true,
    },
    completionStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const transformFn = (doc, ret) => {
  if (ret.submittedFile) {
    ret.submittedFile = `/api/materials/download/${path.basename(ret.submittedFile)}`;
  }
  return ret;
};

assignmentSubmissionSchema.set("toJSON", { transform: transformFn });
assignmentSubmissionSchema.set("toObject", { transform: transformFn });

const AssignmentSubmission = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema,
);

export default AssignmentSubmission;
