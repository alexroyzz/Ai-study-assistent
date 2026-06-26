
// pages/DashboardPage.jsx - Main Dashboard

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, BookOpen, Brain, MessageSquare, Upload, ArrowRight, TrendingUp } from 'lucide-react';
import { userAPI } from '../services/api';
import { StatCard, Spinner } from '../components/common/index.jsx';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await userAPI.getStats();
        setStats(data.stats);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-500/20 to-accent-purple/20 rounded-xl border border-brand-500/30 p-6">
        <h2 className="text-2xl font-bold text-white mb-1">
          {greeting()}, {user?.name?.split(' ')[0]}! 👋
        </h2>
        <p className="text-gray-400">Ready to study smarter today? Upload a PDF to get started.</p>
        <Link to="/upload" className="btn-primary mt-4 inline-flex w-auto">
          <Upload size={16} />
          Upload PDF
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileText} label="PDFs Uploaded" value={stats?.totalDocuments || 0} color="blue" />
          <StatCard icon={BookOpen} label="Notes Generated" value={stats?.totalNotes || 0} color="purple" />
          <StatCard icon={Brain} label="Quizzes Taken" value={stats?.totalQuizzes || 0} color="green" />
          <StatCard icon={TrendingUp} label="Avg Quiz Score" value={stats?.avgQuizScore ? `${stats.avgQuizScore}%` : 'N/A'} color="yellow" />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/upload', icon: Upload, label: 'Upload PDF', desc: 'Add a new document', color: 'brand-500' },
            { to: '/notes', icon: BookOpen, label: 'Generate Notes', desc: 'AI-powered notes', color: 'purple-500' },
            { to: '/quizzes', icon: Brain, label: 'Take Quiz', desc: 'Test your knowledge', color: 'emerald-500' },
            { to: '/chat', icon: MessageSquare, label: 'Chat with PDF', desc: 'Ask questions', color: 'yellow-500' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="card-hover group flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-lg bg-${color}/20 flex items-center justify-center flex-shrink-0`}>
                <Icon size={20} className={`text-${color}`} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-white text-sm">{label}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
              <ArrowRight size={16} className="text-gray-600 group-hover:text-gray-400 ml-auto transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent PDFs */}
        <RecentSection
          title="Recent PDFs"
          items={stats?.recentDocuments}
          loading={loading}
          emptyText="No PDFs uploaded yet"
          renderItem={(doc) => (
            <div key={doc._id} className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
                <FileText size={14} className="text-brand-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">{doc.title}</p>
                <p className="text-xs text-gray-500">{formatDistanceToNow(doc.createdAt)}</p>
              </div>
            </div>
          )}
          viewAllTo="/documents"
        />

        {/* Recent Notes */}
        <RecentSection
          title="Recent Notes"
          items={stats?.recentNotes}
          loading={loading}
          emptyText="No notes generated yet"
          renderItem={(note) => (
            <div key={note._id} className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <BookOpen size={14} className="text-purple-400" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 truncate">{note.title}</p>
                <span className={`text-xs ${note.noteType === 'detailed' ? 'text-blue-400' : note.noteType === 'summary' ? 'text-green-400' : 'text-purple-400'}`}>
                  {note.noteType}
                </span>
              </div>
            </div>
          )}
          viewAllTo="/notes"
        />

        {/* Recent Quizzes */}
        <RecentSection
          title="Recent Quizzes"
          items={stats?.recentQuizzes}
          loading={loading}
          emptyText="No quizzes taken yet"
          renderItem={(quiz) => (
            <div key={quiz._id} className="flex items-center gap-3 py-2.5 border-b border-gray-800/50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Brain size={14} className="text-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-200 truncate">{quiz.title}</p>
                {quiz.bestScore !== null ? (
                  <p className="text-xs text-emerald-400">Best: {quiz.bestScore}%</p>
                ) : (
                  <p className="text-xs text-gray-500">Not attempted</p>
                )}
              </div>
            </div>
          )}
          viewAllTo="/quizzes"
        />
      </div>
    </div>
  );
};

// Helper component for recent sections
const RecentSection = ({ title, items, loading, emptyText, renderItem, viewAllTo }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <Link to={viewAllTo} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
        View all <ArrowRight size={12} />
      </Link>
    </div>
    {loading ? (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-dark-300 rounded-lg animate-pulse" />)}
      </div>
    ) : items?.length > 0 ? (
      <div>{items.map(renderItem)}</div>
    ) : (
      <p className="text-sm text-gray-500 py-4 text-center">{emptyText}</p>
    )}
  </div>
);

export default DashboardPage;
