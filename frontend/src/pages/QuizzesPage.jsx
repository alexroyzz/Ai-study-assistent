import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Brain,
  Plus,
  Trash2,
  Sparkles,
  Trophy,
  Clock,
  FileText,
} from "lucide-react";
import { quizAPI, documentAPI } from "../services/api";
import {
  EmptyState,
  PageHeader,
  SearchBar,
  ConfirmModal,
  Spinner,
} from "../components/common/index.jsx";
import { formatDistanceToNow } from "../utils/helpers";
import toast from "react-hot-toast";

const QUESTION_COUNTS = [10, 20, 30];

const QuizzesPage = () => {
  const [searchParams] = useSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, quiz: null });
  const [genForm, setGenForm] = useState({
    documentId: searchParams.get("documentId") || "",
    questionCount: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesRes, docsRes] = await Promise.all([
          quizAPI.getAll({
            documentId: searchParams.get("documentId") || "",
            limit: 20,
          }),
          documentAPI.getAll({ limit: 50 }),
        ]);
        setQuizzes(quizzesRes.data.quizzes);
        setDocuments(docsRes.data.documents);
      } catch {
        toast.error("Failed to load quizzes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const { data } = await quizAPI.getAll({ search, limit: 20 });
        setQuizzes(data.quizzes);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.documentId) {
      toast.error("Please select a document");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await quizAPI.generate(genForm);
      setQuizzes((prev) => [data.quiz, ...prev]);
      setShowGenerator(false);
      toast.success(`${genForm.questionCount}-question quiz generated! 🧠`);
    } catch (err) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await quizAPI.delete(deleteModal.quiz._id);
      setQuizzes((prev) => prev.filter((q) => q._id !== deleteModal.quiz._id));
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    } finally {
      setDeleteModal({ open: false, quiz: null });
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Quizzes"
        subtitle={`${quizzes.length} quiz${quizzes.length !== 1 ? "zes" : ""} created`}
        action={
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="btn-primary"
          >
            <Plus size={16} />
            Generate Quiz
          </button>
        }
      />

      {/* Generator Panel */}
      {showGenerator && (
        <div className="card mb-6 border-emerald-500/30 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-emerald-400" />
            <h3 className="font-semibold text-white">Generate AI Quiz</h3>
          </div>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="label">Select Document</label>
              <select
                value={genForm.documentId}
                onChange={(e) =>
                  setGenForm({ ...genForm, documentId: e.target.value })
                }
                className="input"
                disabled={generating}
              >
                <option value="">Choose a PDF...</option>
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.title}
                  </option>
                ))}
              </select>
              {documents.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  <Link to="/upload" className="text-brand-400">
                    Upload a PDF first →
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="label">Number of Questions</label>
              <div className="flex gap-3">
                {QUESTION_COUNTS.map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() =>
                      setGenForm({ ...genForm, questionCount: count })
                    }
                    className={`flex-1 py-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                      genForm.questionCount === count
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-dark-300 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    {count} Qs
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={generating || !genForm.documentId}
                className="btn-primary"
              >
                {generating ? <Spinner size="sm" /> : <Sparkles size={16} />}
                {generating ? "Generating... (60-90s)" : "Generate Quiz"}
              </button>
              <button
                type="button"
                onClick={() => setShowGenerator(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-5">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search quizzes..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-44 animate-pulse" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No quizzes yet"
          description="Generate AI quizzes from your PDFs to test your knowledge"
          action={
            <button
              onClick={() => setShowGenerator(true)}
              className="btn-primary"
            >
              <Plus size={16} /> Generate your first quiz
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="card flex flex-col hover:border-gray-700 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Brain size={20} className="text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {quiz.title}
                  </h3>
                  {quiz.document && (
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                      <FileText size={10} /> {quiz.document.title}
                    </p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDistanceToNow(quiz.createdAt)}
                </span>
                <span className="badge-green">
                  {quiz.questionCount} questions
                </span>
              </div>

              {/* Score display */}
              <div className="mb-4">
                {quiz.isCompleted && quiz.bestScore !== null ? (
                  <div className="flex items-center gap-2">
                    <Trophy
                      size={14}
                      className={getScoreColor(quiz.bestScore)}
                    />
                    <span
                      className={`text-sm font-semibold ${getScoreColor(quiz.bestScore)}`}
                    >
                      Best: {quiz.bestScore}%
                    </span>
                    <span className="text-xs text-gray-500">
                      ({quiz.attempts?.length || 1} attempt
                      {(quiz.attempts?.length || 1) !== 1 ? "s" : ""})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">
                    Not attempted yet
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center justify-between">
                <Link
                  to={`/quizzes/${quiz._id}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  {quiz.isCompleted ? "Retake Quiz →" : "Start Quiz →"}
                </Link>
                <button
                  onClick={() => setDeleteModal({ open: true, quiz })}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Quiz"
        message={`Delete "${deleteModal.quiz?.title}"? All attempt history will be lost.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, quiz: null })}
      />
    </div>
  );
};

export default QuizzesPage;
