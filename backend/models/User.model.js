const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries by default
    },
    avatar: {
      type: String,
      default: "", // Cloudinary URL or empty string
    },
    bio: {
      type: String,
      maxlength: [200, "Bio cannot exceed 200 characters"],
      default: "",
    },
    // Stats for dashboard
    stats: {
      documentsUploaded: { type: Number, default: 0 },
      notesGenerated: { type: Number, default: 0 },
      quizzesTaken: { type: Number, default: 0 },
      chatMessages: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre("save", async function (next) {
  // Only hash if password was modified (or is new)
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare passwords ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Generate JWT ───────────────────────────────────────────
userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id, email: this.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

module.exports = mongoose.model("User", userSchema);
