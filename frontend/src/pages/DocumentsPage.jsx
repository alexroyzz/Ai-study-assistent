// pages/DocumentsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, Brain, MessageSquare, Upload, ExternalLink, Calendar, Hash } from 'lucide-react';
import { documentAPI } from '../services/api';
import { EmptyState, PageHeader, SearchBar, ConfirmModal, Spinner } from '../components/common/index.jsx';
import { formatDistanceToNow, formatFileSize } from '../utils/helpers';
import toast from 'react-hot-toast';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, doc: null });
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async (q = '') => {
    try {
      const { data } = await documentAPI.getAll({ search: q, limit: 20 });
      setDocuments(data.documents);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchDocuments(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await documentAPI.delete(deleteModal.doc._id);
      setDocuments(prev => prev.filter(d => d._id !== deleteModal.doc._id));
      toast.success('Document deleted');
    } catch (err) {
      toast.error('Failed to delete document');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, doc: null });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="My PDFs"
        subtitle={`${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded`}
        action={
          <Link to="/upload" className="btn-primary">
            <Upload size={16} />
            Upload PDF
          </Link>
        }
      />

      <div className="mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search documents..." />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-52 animate-pulse" />)}
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={search ? 'No documents found' : 'No PDFs yet'}
          description={search ? 'Try a different search term' : 'Upload your first PDF to get started with AI-powered studying'}
          action={!search && <Link to="/upload" className="btn-primary">Upload your first PDF</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc._id} className="card flex flex-col group hover:border-gray-700 transition-all duration-200">
              {/* Card Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{doc.originalName}</p>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  {formatDistanceToNow(doc.createdAt)}
                </span>
                <span>{formatFileSize(doc.fileSize)}</span>
                {doc.pageCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Hash size={11} />
                    {doc.pageCount} pages
                  </span>
                )}
              </div>

              {/* Usage stats */}
              <div className="flex gap-3 mb-4 text-xs">
                <span className="badge-purple">{doc.notesCount || 0} notes</span>
                <span className="badge-green">{doc.quizzesCount || 0} quizzes</span>
                <span className="badge-blue">{doc.chatsCount || 0} chats</span>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-3 border-t border-gray-800/50 flex flex-wrap gap-2">
                <Link to={`/notes?documentId=${doc._id}`} className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  <BookOpen size={12} />Notes
                </Link>
                <Link to={`/quizzes?documentId=${doc._id}`} className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
                  <Brain size={12} />Quiz
                </Link>
                <Link to={`/chat?documentId=${doc._id}`} className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                  <MessageSquare size={12} />Chat
                </Link>
                <a href={doc.cloudinaryUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-300 transition-colors">
                  <ExternalLink size={12} />View
                </a>
                <button
                  onClick={() => setDeleteModal({ open: true, doc })}
                  className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors ml-auto"
                >
                  <Trash2 size={12} />Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Document"
        message={`Delete "${deleteModal.doc?.title}"? This will also delete all notes, quizzes, and chats for this document. This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, doc: null })}
      />
    </div>
  );
};

export default DocumentsPage;
