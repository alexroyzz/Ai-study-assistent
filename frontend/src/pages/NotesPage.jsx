
//NotesPage - Notes List & Generator

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  FileText,
} from "lucide-react";
import { noteAPI, documentAPI } from "../services/api";
import {
  EmptyState,
  PageHeader,
  SearchBar,
  ConfirmModal,
  Spinner,
} from "../components/common/index.jsx";
import { formatDistanceToNow } from "../utils/helpers";
import toast from "react-hot-toast";

const NOTE_TYPES = [
  {
    value: "concise",
    label: "Concise",
    desc: "Key points only",
    color: "text-brand-400",
    bg: "bg-brand-500/20",
  },
  {
    value: "detailed",
    label: "Detailed",
    desc: "Full coverage",
    color: "text-purple-400",
    bg: "bg-purple-500/20",
  },
  {
    value: "summary",
    label: "Summary",
    desc: "Quick overview",
    color: "text-emerald-400",
    bg: "bg-emerald-500/20",
  },
];

const NotesPage = () => {
  const [searchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, note: null });
  const [genForm, setGenForm] = useState({
    documentId: searchParams.get("documentId") || "",
    noteType: "concise",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, docsRes] = await Promise.all([
          noteAPI.getAll({
            documentId: searchParams.get("documentId") || "",
            limit: 20,
          }),
          documentAPI.getAll({ limit: 50 }),
        ]);
        setNotes(notesRes.data.notes);
        setDocuments(docsRes.data.documents);
      } catch (err) {
        toast.error("Failed to load notes");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const { data } = await noteAPI.getAll({ search, limit: 20 });
        setNotes(data.notes);
      } catch {}
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!genForm.documentId) {
      toast.error("Please select a document");
      return;
    }
    setGenerating(true);
    try {
      const { data } = await noteAPI.generate(genForm);
      setNotes((prev) => [data.note, ...prev]);
      setShowGenerator(false);
      toast.success("Notes generated successfully! 📝");
    } catch (err) {
      toast.error(err.message || "Failed to generate notes");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await noteAPI.delete(deleteModal.note._id);
      setNotes((prev) => prev.filter((n) => n._id !== deleteModal.note._id));
      toast.success("Note deleted");
    } catch {
      toast.error("Failed to delete note");
    } finally {
      setDeleteModal({ open: false, note: null });
    }
  };

  const noteTypeBadge = (type) => {
    const t = NOTE_TYPES.find((n) => n.value === type);
    return t ? (
      <span className={`badge ${t.bg} ${t.color}`}>{t.label}</span>
    ) : null;
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My Notes"
        subtitle={`${notes.length} note${notes.length !== 1 ? "s" : ""} generated`}
        action={
          <button
            onClick={() => setShowGenerator(!showGenerator)}
            className="btn-primary"
          >
            <Plus size={16} />
            Generate Notes
          </button>
        }
      />

      {/* Generator Panel */}
      {showGenerator && (
        <div className="card mb-6 border-brand-500/30 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-brand-400" />
            <h3 className="font-semibold text-white">Generate AI Notes</h3>
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
                  No PDFs uploaded.{" "}
                  <Link to="/upload" className="text-brand-400">
                    Upload one first →
                  </Link>
                </p>
              )}
            </div>

            <div>
              <label className="label">Note Type</label>
              <div className="grid grid-cols-3 gap-3">
                {NOTE_TYPES.map(({ value, label, desc, color, bg }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setGenForm({ ...genForm, noteType: value })}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                      genForm.noteType === value
                        ? `${bg} border-current ${color}`
                        : "bg-dark-300 border-gray-700 text-gray-400 hover:border-gray-500"
                    }`}
                  >
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs opacity-70 mt-0.5">{desc}</p>
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
                {generating ? "Generating... (30-60s)" : "Generate Notes"}
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
          placeholder="Search notes..."
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-44 animate-pulse" />
          ))}
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No notes yet"
          description="Generate AI-powered notes from your uploaded PDFs"
          action={
            <button
              onClick={() => setShowGenerator(true)}
              className="btn-primary"
            >
              <Plus size={16} /> Generate your first notes
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="card flex flex-col hover:border-gray-700 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen
                    size={16}
                    className="text-purple-400 flex-shrink-0"
                  />
                  <h3 className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                    {note.title}
                  </h3>
                </div>
                {noteTypeBadge(note.noteType)}
              </div>

              {note.document && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <FileText size={11} />
                  <span className="truncate">{note.document.title}</span>
                </div>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDistanceToNow(note.createdAt)}
                </span>
                <span>{note.wordCount?.toLocaleString()} words</span>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-800/50 flex items-center justify-between">
                <Link
                  to={`/notes/${note._id}`}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1"
                >
                  Read notes →
                </Link>
                <button
                  onClick={() => setDeleteModal({ open: true, note })}
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
        title="Delete Note"
        message={`Delete "${deleteModal.note?.title}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, note: null })}
      />
    </div>
  );
};

export default NotesPage;
