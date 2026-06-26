const User = require("../models/User.model");
const Document = require("../models/Document.model");
const Note = require("../models/Note.model");
const Quiz = require("../models/Quiz.model");
const Chat = require("../models/Chat.model");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Get Profile ──────────────────────────────────────────────────────────────
// GET /api/users/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Get real counts from DB for accuracy
  const [docCount, noteCount, quizCount, chatCount] = await Promise.all([
    Document.countDocuments({ user: req.user._id }),
    Note.countDocuments({ user: req.user._id }),
    Quiz.countDocuments({ user: req.user._id }),
    Chat.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      stats: {
        documentsUploaded: docCount,
        notesGenerated: noteCount,
        quizzesTaken: quizCount,
        chatMessages: chatCount,
      },
      createdAt: user.createdAt,
    },
  });
});

// ─── Update Profile ───────────────────────────────────────────────────────────
// PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, avatar } = req.body;

  // Build update object with only provided fields
  const updateData = {};
  if (name) updateData.name = name.trim();
  if (bio !== undefined) updateData.bio = bio.trim();
  if (avatar) updateData.avatar = avatar;

  if (Object.keys(updateData).length === 0) {
    throw new AppError("No fields to update", 400);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
    },
  });
});

// ─── Change Password ──────────────────────────────────────────────────────────
// PUT /api/users/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Please provide current and new password", 400);
  }

  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword; // Will be hashed by pre-save hook
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

// ─── Get User Stats ───────────────────────────────────────────────────────────
// GET /api/users/stats
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [documents, notes, quizzes, chats] = await Promise.all([
    Document.find({ user: userId })
      .select("title createdAt fileSize")
      .sort("-createdAt")
      .limit(5),
    Note.find({ user: userId })
      .select("title noteType createdAt")
      .sort("-createdAt")
      .limit(5),
    Quiz.find({ user: userId })
      .select("title bestScore isCompleted createdAt")
      .sort("-createdAt")
      .limit(5),
    Chat.countDocuments({ user: userId }),
  ]);

  // Calculate quiz average score
  const completedQuizzes = await Quiz.find({
    user: userId,
    isCompleted: true,
  }).select("bestScore");
  const avgScore =
    completedQuizzes.length > 0
      ? Math.round(
          completedQuizzes.reduce((sum, q) => sum + (q.bestScore || 0), 0) /
            completedQuizzes.length,
        )
      : 0;

  res.json({
    success: true,
    stats: {
      totalDocuments: await Document.countDocuments({ user: userId }),
      totalNotes: await Note.countDocuments({ user: userId }),
      totalQuizzes: await Quiz.countDocuments({ user: userId }),
      totalChats: chats,
      avgQuizScore: avgScore,
      recentDocuments: documents,
      recentNotes: notes,
      recentQuizzes: quizzes,
    },
  });
});

module.exports = { getProfile, updateProfile, changePassword, getUserStats };
