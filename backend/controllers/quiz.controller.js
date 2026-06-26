const Quiz = require("../models/Quiz.model");
const Document = require("../models/Document.model");
const User = require("../models/User.model");
const { generateQuiz } = require("../services/ai.service");
const { asyncHandler, AppError } = require("../middleware/error.middleware");

// ─── Generate Quiz ────────────────────────────────────────────────────────────
// POST /api/quizzes/generate
const generateQuizFromDoc = asyncHandler(async (req, res) => {
  const { documentId, questionCount = 10 } = req.body;

  if (!documentId) throw new AppError("Document ID is required", 400);

  const validCounts = [10, 20, 30];
  const count = parseInt(questionCount);
  if (!validCounts.includes(count)) {
    throw new AppError("questionCount must be 10, 20, or 30", 400);
  }

  // Fetch document with text
  const document = await Document.findOne({
    _id: documentId,
    user: req.user._id,
  }).select("+extractedText");

  if (!document) throw new AppError("Document not found", 404);

  if (!document.extractedText || document.extractedText.length < 200) {
    throw new AppError(
      "Document has insufficient text content for quiz generation",
      400,
    );
  }

  // Generate quiz questions using AI
  const questions = await generateQuiz(document.extractedText, count);

  if (!questions || questions.length === 0) {
    throw new AppError(
      "Failed to generate quiz questions. Please try again.",
      500,
    );
  }

  // Save quiz to database
  const quiz = await Quiz.create({
    user: req.user._id,
    document: documentId,
    title: `Quiz: ${document.title} (${count} Questions)`,
    questions,
    questionCount: count,
  });

  // Update document quiz count
  await Document.findByIdAndUpdate(documentId, { $inc: { quizzesCount: 1 } });

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.quizzesTaken": 1 },
  });

  // Return quiz WITHOUT correctAnswer to prevent cheating
  const quizResponse = {
    ...quiz.toObject(),
    questions: quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      // correctAnswer and explanation excluded until submission
    })),
  };

  res.status(201).json({
    success: true,
    message: "Quiz generated successfully",
    quiz: quizResponse,
  });
});

// ─── Submit Quiz Answers ──────────────────────────────────────────────────────
// POST /api/quizzes/:id/submit
const submitQuiz = asyncHandler(async (req, res) => {
  const { answers, timeTaken } = req.body;

  if (!answers || !Array.isArray(answers)) {
    throw new AppError("Answers array is required", 400);
  }

  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });

  if (!quiz) throw new AppError("Quiz not found", 404);

  // Calculate score
  let score = 0;
  const results = quiz.questions.map((question, index) => {
    const userAnswer = answers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) score++;

    return {
      question: question.question,
      options: question.options,
      userAnswer,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      isCorrect,
    };
  });

  const percentage = Math.round((score / quiz.questions.length) * 100);

  // Add this attempt to history
  quiz.attempts.push({
    answers,
    score,
    percentage,
    timeTaken: timeTaken || 0,
  });

  // Update best score
  if (!quiz.bestScore || percentage > quiz.bestScore) {
    quiz.bestScore = percentage;
  }

  quiz.isCompleted = true;
  await quiz.save();

  res.json({
    success: true,
    result: {
      score,
      total: quiz.questions.length,
      percentage,
      timeTaken: timeTaken || 0,
      results,
    },
  });
});

// ─── Get All Quizzes ──────────────────────────────────────────────────────────
// GET /api/quizzes
const getQuizzes = asyncHandler(async (req, res) => {
  const { documentId, search, page = 1, limit = 10 } = req.query;

  const query = { user: req.user._id };
  if (documentId) query.document = documentId;
  if (search) query.title = { $regex: search, $options: "i" };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [quizzes, total] = await Promise.all([
    Quiz.find(query)
      .select(
        "-questions.correctAnswer -questions.explanation -attempts.answers",
      ) // Exclude sensitive
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Quiz.countDocuments(query),
  ]);

  res.json({
    success: true,
    quizzes,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ─── Get Single Quiz ──────────────────────────────────────────────────────────
// GET /api/quizzes/:id
const getQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("document", "title originalName");

  if (!quiz) throw new AppError("Quiz not found", 404);

  // If quiz hasn't been completed yet, hide answers
  const response = quiz.toObject();
  if (!quiz.isCompleted) {
    response.questions = response.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));
  }

  res.json({ success: true, quiz: response });
});

// ─── Delete Quiz ──────────────────────────────────────────────────────────────
// DELETE /api/quizzes/:id
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });

  if (!quiz) throw new AppError("Quiz not found", 404);

  await quiz.deleteOne();
  await Document.findByIdAndUpdate(quiz.document, {
    $inc: { quizzesCount: -1 },
  });

  res.json({ success: true, message: "Quiz deleted successfully" });
});

module.exports = {
  generateQuizFromDoc,
  submitQuiz,
  getQuizzes,
  getQuiz,
  deleteQuiz,
};
