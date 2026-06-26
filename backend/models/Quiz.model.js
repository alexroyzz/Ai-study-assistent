const mongoose = require("mongoose");

// Schema for individual MCQ question
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: {
    type: [String],
    required: true,
    validate: [
      (arr) => arr.length === 4,
      "Each question must have exactly 4 options",
    ],
  },
  correctAnswer: {
    type: Number, // Index of the correct option (0-3)
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: "", // AI-generated explanation for the correct answer
  },
});

// Schema for a quiz attempt (when user submits answers)
const attemptSchema = new mongoose.Schema({
  answers: [Number], // User's selected answer indices
  score: Number, // Number of correct answers
  percentage: Number,
  completedAt: { type: Date, default: Date.now },
  timeTaken: Number, // In seconds
});

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
    questionCount: {
      type: Number,
      enum: [10, 20, 30],
      default: 10,
    },
    // Store all attempts so user can see history
    attempts: [attemptSchema],
    // Best score across all attempts
    bestScore: {
      type: Number,
      default: null,
    },
    // Has the quiz been completed at least once
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

quizSchema.index({ user: 1, createdAt: -1 });
quizSchema.index({ document: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
