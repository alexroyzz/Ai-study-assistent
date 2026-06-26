const Note = require("../models/Note.model");
const Document = require("../models/Document.model");
const User = require("../models/User.model");
const { generateNotes } = require("../services/ai.service");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Generate Notes ───────────────────────────────────────────────────────────
// POST /api/notes/generate
const generateNote = asyncHandler(async (req, res) => {
  const { documentId, noteType = "concise" } = req.body;

  if (!documentId) {
    throw new AppError("Document ID is required", 400);
  }

  if (!["concise", "detailed", "summary"].includes(noteType)) {
    throw new AppError("noteType must be concise, detailed, or summary", 400);
  }

  // Fetch document with extracted text (use +extractedText to override select: false)
  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  }).select("+extractedText");

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  if (!document.extractedText || document.extractedText.length < 100) {
    throw new AppError(
      "Document has insufficient text content for note generation",
      400,
    );
  }

  // Generate notes using AI service
  const content = await generateNotes(document.extractedText, noteType);

  // Create note record in DB
  const note = await Note.create({
    user: req.user._id,
    document: documentId,
    title: `${noteType.charAt(0).toUpperCase() + noteType.slice(1)} Notes: ${document.title}`,
    content,
    noteType,
    wordCount: content.split(/\s+/).length,
  });

  // Update document notes count
  await Document.findByIdAndUpdate(documentId, { $inc: { notesCount: 1 } });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.notesGenerated": 1 },
  });

  res.status(201).json({
    success: true,
    message: "Notes generated successfully",
    note,
  });
});

// ─── Get All Notes ────────────────────────────────────────────────────────────
// GET /api/notes
const getNotes = asyncHandler(async (req, res) => {
  const { documentId, search, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (documentId) query.document = documentId;
  if (search) query.title = { $regex: search, $options: "i" };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notes, total] = await Promise.all([
    Note.find(query)
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Note.countDocuments(query),
  ]);

  res.json({
    success: true,
    notes,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── Get Single Note ──────────────────────────────────────────────────────────
// GET /api/notes/:id
const getNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("document", "title originalName");

  if (!note) throw new AppError("Note not found", 404);

  res.json({ success: true, note });
});

// ─── Delete Note ──────────────────────────────────────────────────────────────
// DELETE /api/notes/:id
const deleteNote = asyncHandler(async (req, res) => {
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });

  if (!note) throw new AppError("Note not found", 404);

  await note.deleteOne();
  await Document.findByIdAndUpdate(note.document, { $inc: { notesCount: -1 } });

  res.json({ success: true, message: "Note deleted successfully" });
});

module.exports = { generateNote, getNotes, getNote, deleteNote };
