const Chat = require("../models/Chat.model");
const Document = require("../models/Document.model");
const User = require("../models/User.model");
const { chatWithPDF } = require("../services/ai.service");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Start New Chat or Send Message ──────────────────────────────────────────
// POST /api/chats/message
const sendMessage = asyncHandler(async (req, res) => {
  const { documentId, message, chatId } = req.body;

  if (!documentId || !message) {
    throw new AppError("documentId and message are required", 400);
  }

  if (message.trim().length < 3) {
    throw new AppError("Message must be at least 3 characters", 400);
  }

  // Get document with extracted text
  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  }).select("+extractedText");

  if (!document) throw new AppError("Document not found", 404);

  if (!document.extractedText) {
    throw new AppError("This document has no extracted text for chat", 400);
  }

  // Find existing chat session or create new one
  let chat;
  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) throw new AppError("Chat session not found", 404);
  } else {
    // Create new chat session with title from first message
    const title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
    chat = await Chat.create({
      user: req.user._id,
      document: documentId,
      title,
      messages: [],
    });
  }

  // Get AI response using chat history for context
  const aiResponse = await chatWithPDF(
    message,
    document.extractedText,
    chat.messages.slice(-10), // Pass last 10 messages for context
  );

  // Add user and AI messages to chat
  chat.messages.push(
    { role: "user", content: message },
    { role: "assistant", content: aiResponse },
  );
  chat.messageCount = chat.messages.length;
  await chat.save();

  // Update document chat count and user stats
  await Document.findByIdAndUpdate(documentId, { $inc: { chatsCount: 1 } });
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.chatMessages": 1 },
  });

  res.json({
    success: true,
    chatId: chat._id,
    message: {
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    },
  });
});

// ─── Get User's Chat Sessions ─────────────────────────────────────────────────
// GET /api/chats
const getChats = asyncHandler(async (req, res) => {
  const { documentId, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (documentId) query.document = documentId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [chats, total] = await Promise.all([
    Chat.find(query)
      .select("-messages") // Exclude messages from list view
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Chat.countDocuments(query),
  ]);

  res.json({
    success: true,
    chats,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── Get Chat History ─────────────────────────────────────────────────────────
// GET /api/chats/:id
const getChatHistory = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("document", "title originalName");

  if (!chat) throw new AppError("Chat session not found", 404);

  res.json({ success: true, chat });
});

// ─── Delete Chat Session ──────────────────────────────────────────────────────
// DELETE /api/chats/:id
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

  if (!chat) throw new AppError("Chat session not found", 404);

  await chat.deleteOne();
  await Document.findByIdAndUpdate(chat.document, { $inc: { chatsCount: -1 } });

  res.json({ success: true, message: "Chat session deleted" });
});

module.exports = { sendMessage, getChats, getChatHistory, deleteChat };
