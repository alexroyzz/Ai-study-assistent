// Custom error class with status code support
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global async error wrapper - eliminates try/catch in controllers
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Main error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error details in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Handle specific Mongoose errors

  // Bad ObjectId (e.g., invalid MongoDB ID format)
  if (err.name === "CastError") {
    error = new AppError("Resource not found", 404);
  }

  // Duplicate key error (e.g., email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`${field} already exists`, 400);
  }

  // Validation error (e.g., required field missing)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(messages.join(", "), 400);
  }

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    error = new AppError("File size too large. Maximum size is 10MB", 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { AppError, asyncHandler, errorHandler };
