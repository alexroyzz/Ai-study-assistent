const mongoose = require("mongoose");

// Individual message in a chat session
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatSchema = new mongoose.Schema(
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
      default: "Chat Session", // Auto-generated from first message
    },
    messages: [messageSchema],
    // Track total messages for display
    messageCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

chatSchema.index({ user: 1, document: 1, createdAt: -1 });

module.exports = mongoose.model("Chat", chatSchema);
