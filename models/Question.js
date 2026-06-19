import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    text: {
      type: String,
      required: [true, "Please add question text"],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, "Please add options"],
    },
    correctAnswer: {
      type: String,
      required: [true, "Please add the correct answer"],
    },
    points: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
