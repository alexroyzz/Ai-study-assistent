const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    cloudinaryUrl: {
      type: String,
      required: true, // URL to access the PDF in Cloudinary
    },
    cloudinaryPublicId: {
      type: String,
      required: true, // Needed for deletion from Cloudinary
    },
    fileSize: {
      type: Number, // Size in bytes
      required: true,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    // Extracted text content from pdf-parse (used for AI features)
    extractedText: {
      type: String,
      default: "",
      select: false, // Exclude from default queries (large field)
    },
    // Text truncated to reasonable length for AI context window
    textPreview: {
      type: String,
      default: "", // First ~500 chars for display
    },
    // Track associated resources
    notesCount: { type: Number, default: 0 },
    quizzesCount: { type: Number, default: 0 },
    chatsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

// Index for faster user-specific queries
documentSchema.index({ user: 1, createdAt: -1 });
documentSchema.index({ user: 1, title: "text" }); // Text search index

module.exports = mongoose.model("Document", documentSchema);
