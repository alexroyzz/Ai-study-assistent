const Document = require("../models/Document.model");
const Note = require("../models/Note.model");
const Quiz = require("../models/Quiz.model");
const Chat = require("../models/Chat.model");
const User = require("../models/User.model");
const { cloudinary } = require("../config/cloudinary");
const {
  extractTextFromPDF,
  cleanExtractedText,
} = require("../utils/pdfParser");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Upload PDF ───────────────────────────────────────────────────────────────
// POST /api/documents/upload
const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError("Please upload a PDF file", 400);
  }

  const { title } = req.body;

  // Extract text from the uploaded PDF
  // req.file.path is the Cloudinary URL when using CloudinaryStorage
  let extractedText = "";
  let pageCount = 0;

  try {
    const parsed = await extractTextFromPDF(req.file.path);
    extractedText = cleanExtractedText(parsed.text);
    pageCount = parsed.pageCount;
  } catch (parseError) {
    console.warn("PDF text extraction failed:", parseError.message);
    // Continue even if parsing fails - file is still uploaded
  }

  // Save document metadata to MongoDB
  const document = await Document.create({
    user: req.user._id,
    title: title || req.file.originalname.replace(".pdf", ""),
    originalName: req.file.originalname,
    cloudinaryUrl: req.file.path,
    cloudinaryPublicId: req.file.filename,
    fileSize: req.file.size,
    pageCount,
    extractedText,
    textPreview: extractedText.slice(0, 500), // Store short preview
  });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.documentsUploaded": 1 },
  });

  res.status(201).json({
    success: true,
    message: "PDF uploaded successfully",
    document: {
      id: document._id,
      title: document.title,
      originalName: document.originalName,
      cloudinaryUrl: document.cloudinaryUrl,
      fileSize: document.fileSize,
      pageCount: document.pageCount,
      textPreview: document.textPreview,
      hasText: extractedText.length > 0,
      createdAt: document.createdAt,
    },
  });
});

// ─── Get All Documents ────────────────────────────────────────────────────────
// GET /api/documents
const getDocuments = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;

  // Build query
  const query = { user: req.user._id };

  // Add search filter if provided
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { originalName: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [documents, total] = await Promise.all([
    Document.find(query)
      .select("-extractedText") // Exclude large text field from list
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Document.countDocuments(query),
  ]);

  res.json({
    success: true,
    documents,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit),
    },
  });
});

// ─── Get Single Document ──────────────────────────────────────────────────────
// GET /api/documents/:id
const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  res.json({ success: true, document });
});

// ─── Delete Document ──────────────────────────────────────────────────────────
// DELETE /api/documents/:id
const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!document) {
    throw new AppError("Document not found", 404);
  }

  // Delete from Cloudinary
  try {
    await cloudinary.uploader.destroy(document.cloudinaryPublicId, {
      resource_type: "raw",
    });
  } catch (err) {
    console.warn("Cloudinary deletion failed:", err.message);
    // Continue with DB deletion even if Cloudinary fails
  }

  // Delete all associated notes, quizzes, and chats
  await Promise.all([
    Note.deleteMany({ document: document._id }),
    Quiz.deleteMany({ document: document._id }),
    Chat.deleteMany({ document: document._id }),
    document.deleteOne(),
  ]);

  res.json({
    success: true,
    message: "Document and all associated data deleted successfully",
  });
});

module.exports = { uploadDocument, getDocuments, getDocument, deleteDocument };
