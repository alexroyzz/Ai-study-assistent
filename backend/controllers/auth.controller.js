const User = require("../models/User.model");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Register ─────────────────────────────────────────────────────────────────
// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new AppError("Please provide name, email, and password", 400);
  }

  // Check if email already registered
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError("Email already registered. Please login instead.", 400);
  }

  // Create new user (password is hashed by pre-save hook in User model)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
  });

  // Generate JWT token
  const token = user.generateToken();

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      stats: user.stats,
      createdAt: user.createdAt,
    },
  });
});

// ─── Login ────────────────────────────────────────────────────────────────────
// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  // Find user and explicitly include password (excluded by default in schema)
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = user.generateToken();

  res.json({
    success: true,
    message: "Logged in successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      stats: user.stats,
      createdAt: user.createdAt,
    },
  });
});

// ─── Get Current User ─────────────────────────────────────────────────────────
// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  // req.user is already populated by auth middleware
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      bio: req.user.bio,
      stats: req.user.stats,
      createdAt: req.user.createdAt,
    },
  });
});

module.exports = { register, login, getMe };
