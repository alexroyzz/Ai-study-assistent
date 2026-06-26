
// pages/NotePage.jsx - View Single Note

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, BookOpen, Clock, FileText, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { noteAPI } from '../services/api';
import { ConfirmModal, Spinner } from '../components/common/index.jsx';
import { formatDistanceToNow } from '../utils/helpers';
import toast from 'react-hot-toast';

const NotePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const { data } = await noteAPI.getOne(id);
        setNote(data.note);
      } catch (err) {
        toast.error('Note not found');
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(note.content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await noteAPI.delete(id);
      toast.success('Note deleted');
      navigate('/notes');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  const typeBadgeClass = {
    concise: 'badge-blue',
    detailed: 'badge-purple',
    summary: 'badge-green',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link to="/notes" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft size={16} />
          Back to Notes
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="btn-secondary text-sm py-1.5 px-3">
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={() => setDeleteModal(true)} className="btn-danger text-sm py-1.5 px-3">
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      {/* Note Header Card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen size={24} className="text-purple-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-xl font-bold text-white leading-tight">{note.title}</h1>
              <span className={`badge ${typeBadgeClass[note.noteType]} flex-shrink-0`}>
                {note.noteType}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500">
              {note.document && (
                <span className="flex items-center gap-1.5">
                  <FileText size={12} />
                  {note.document.title}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {formatDistanceToNow(note.createdAt)}
              </span>
              <span>{note.wordCount?.toLocaleString()} words</span>
            </div>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="card">
        <div className="markdown-content prose prose-invert max-w-none">
          <ReactMarkdown>{note.content}</ReactMarkdown>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
      />
    </div>
  );
};

export default NotePage;
