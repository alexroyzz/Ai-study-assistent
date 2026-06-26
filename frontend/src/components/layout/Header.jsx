// components/layout/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/documents': 'My PDFs',
  '/upload': 'Upload PDF',
  '/notes': 'My Notes',
  '/quizzes': 'My Quizzes',
  '/chat': 'Chat with PDF',
  '/profile': 'Profile',
};

const Header = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Find the best matching title
  const title = Object.entries(pageTitles).find(([path]) => pathname.startsWith(path))?.[1] || 'StudyAI';

  return (
    <header className="bg-dark-200 border-b border-gray-800/50 h-16 flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      {/* Mobile menu button + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-dark-100 rounded-lg px-3 py-1.5 border border-gray-800">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
