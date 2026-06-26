import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { quizAPI } from "../services/api";
import { Spinner } from "../components/common/index.jsx";
import toast from "react-hot-toast";

const QuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplanations, setShowExplanations] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await quizAPI.getOne(id);
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(null));
        // Start timer
        timerRef.current = setInterval(
          () => setTimeElapsed((t) => t + 1),
          1000,
        );
      } catch (err) {
        toast.error("Quiz not found");
        navigate("/quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
    return () => clearInterval(timerRef.current);
  }, [id]);

  const selectAnswer = (optionIndex) => {
    if (submitted) return;
    setAnswers((prev) => {
      const updated = [...prev];
      updated[currentQ] = optionIndex;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const unanswered = answers.filter((a) => a === null).length;
    if (unanswered > 0) {
      const confirm = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
      );
      if (!confirm) return;
    }

    clearInterval(timerRef.current);
    setSubmitting(true);
    try {
      const { data } = await quizAPI.submit(id, {
        answers: answers.map((a) => a ?? 0),
        timeTaken: timeElapsed,
      });
      setResult(data.result);
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      toast.error(err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setCurrentQ(0);
    setSubmitted(false);
    setResult(null);
    setShowExplanations(false);
    setTimeElapsed(0);
    timerRef.current = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const getScoreColor = (pct) => {
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreBg = (pct) => {
    if (pct >= 80)
      return "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30";
    if (pct >= 60)
      return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
    return "from-red-500/20 to-red-600/5 border-red-500/30";
  };

  const getMessage = (pct) => {
    if (pct >= 90) return "Outstanding! 🏆";
    if (pct >= 80) return "Great job! 🎉";
    if (pct >= 60) return "Good effort! 📚";
    return "Keep studying! 💪";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!quiz) return null;

  // ─── Results View ─────────────────────────────────────────────────────────
  if (submitted && result) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in">
        <Link
          to="/quizzes"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6"
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </Link>

        {/* Score Card */}
        <div
          className={`bg-gradient-to-br ${getScoreBg(result.percentage)} rounded-2xl border p-8 text-center mb-6`}
        >
          <Trophy
            size={48}
            className={`${getScoreColor(result.percentage)} mx-auto mb-3`}
          />
          <h2 className="text-2xl font-bold text-white mb-1">
            {getMessage(result.percentage)}
          </h2>
          <div
            className={`text-6xl font-bold ${getScoreColor(result.percentage)} my-4`}
          >
            {result.percentage}%
          </div>
          <p className="text-gray-400">
            {result.score} / {result.total} correct
          </p>
          <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
            <Clock size={14} />
            Time: {formatTime(result.timeTaken || 0)}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button onClick={handleRetake} className="btn-secondary">
            <RotateCcw size={16} /> Retake Quiz
          </button>
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="btn-primary"
          >
            {showExplanations ? "Hide" : "Show"} Explanations
          </button>
        </div>

        {/* Results breakdown */}
        <div className="space-y-4">
          {result.results.map((r, i) => (
            <div
              key={i}
              className={`card border ${r.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}
            >
              <div className="flex items-start gap-3 mb-3">
                {r.isCorrect ? (
                  <CheckCircle
                    size={18}
                    className="text-emerald-400 flex-shrink-0 mt-0.5"
                  />
                ) : (
                  <XCircle
                    size={18}
                    className="text-red-400 flex-shrink-0 mt-0.5"
                  />
                )}
                <p className="text-sm font-medium text-white">
                  <span className="text-gray-500 mr-2">Q{i + 1}.</span>
                  {r.question}
                </p>
              </div>

              <div className="ml-7 space-y-1.5">
                {r.options.map((opt, j) => (
                  <div
                    key={j}
                    className={`text-xs px-3 py-2 rounded-lg ${
                      j === r.correctAnswer
                        ? "bg-emerald-500/20 text-emerald-300 font-medium"
                        : j === r.userAnswer && !r.isCorrect
                          ? "bg-red-500/20 text-red-300"
                          : "text-gray-500"
                    }`}
                  >
                    {String.fromCharCode(65 + j)}. {opt}
                    {j === r.correctAnswer && " ✓"}
                    {j === r.userAnswer && !r.isCorrect && " ✗"}
                  </div>
                ))}
              </div>

              {showExplanations && r.explanation && (
                <div className="ml-7 mt-3 p-3 bg-dark-300 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">
                    <span className="text-brand-400 font-medium">
                      Explanation:{" "}
                    </span>
                    {r.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── Quiz Taking View ─────────────────────────────────────────────────────
  const question = quiz.questions[currentQ];
  const progress =
    (answers.filter((a) => a !== null).length / quiz.questions.length) * 100;
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/quizzes"
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
        >
          <ArrowLeft size={16} /> Exit Quiz
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-400 bg-dark-100 px-3 py-1.5 rounded-lg border border-gray-800">
            <Clock size={14} />
            {formatTime(timeElapsed)}
          </div>
          <span className="text-sm text-gray-400">
            {answeredCount}/{quiz.questions.length} answered
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-dark-100 rounded-full h-2 mb-6">
        <div
          className="bg-gradient-to-r from-brand-500 to-accent-purple h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Question {currentQ + 1} of {quiz.questions.length}
          </span>
          {answers[currentQ] !== null && (
            <span className="badge-green text-xs">Answered</span>
          )}
        </div>

        <h2 className="text-lg font-semibold text-white mb-6 leading-relaxed">
          {question.question}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm transition-all duration-200 ${
                answers[currentQ] === i
                  ? "border-brand-500 bg-brand-500/20 text-white font-medium"
                  : "border-gray-700 hover:border-gray-500 text-gray-300 bg-dark-300 hover:bg-dark-100"
              }`}
            >
              <span
                className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold mr-3 flex-shrink-0 ${
                  answers[currentQ] === i
                    ? "bg-brand-500 text-white"
                    : "bg-dark-100 text-gray-500"
                }`}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="btn-secondary disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {/* Question dots */}
        <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentQ(i)}
              className={`w-6 h-6 rounded-full text-xs font-medium transition-all ${
                i === currentQ
                  ? "bg-brand-500 text-white"
                  : answers[i] !== null
                    ? "bg-emerald-500/40 text-emerald-300"
                    : "bg-dark-100 text-gray-500 hover:bg-dark-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {currentQ < quiz.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ((q) => q + 1)}
            className="btn-secondary"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary bg-emerald-600 hover:bg-emerald-700"
          >
            {submitting ? <Spinner size="sm" /> : <Trophy size={16} />}
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
