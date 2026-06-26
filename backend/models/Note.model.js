const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
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
    content: {
      type: String,
      required: true, // The AI-generated markdown notes content
    },
    // Type of notes generated
    noteType: {
      type: String,
      enum: ["concise", "detailed", "summary"],
      default: "concise",
    },
    // Word count for display
    wordCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ document: 1 });

module.exports = mongoose.model("Note", noteSchema);
