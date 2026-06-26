import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Upload,
  BookOpen,
  Brain,
  MessageSquare,
  User,
  LogOut,
  X,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/documents", icon: FileText, label: "My PDFs" },
  { to: "/upload", icon: Upload, label: "Upload PDF" },
  { to: "/notes", icon: BookOpen, label: "My Notes" },
  { to: "/quizzes", icon: Brain, label: "My Quizzes" },
  { to: "/chat", icon: MessageSquare, label: "Chat with PDF" },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <aside
      className={`
      fixed top-0 left-0 h-full w-64 bg-dark-200 border-r border-gray-800/50
      flex flex-col z-30 transition-transform duration-300
      ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    `}
    >
      {/* Logo + Close button */}
      <div className="flex items-center justify-between p-5 border-b border-gray-800/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">StudyAI</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-200 group
              ${
                isActive
                  ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                  : "text-gray-400 hover:text-white hover:bg-dark-100"
              }
            `}
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-gray-800/50">
        <NavLink
          to="/profile"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-100 transition-all duration-200 mb-1"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <User size={14} className="text-gray-500 flex-shrink-0" />
        </NavLink>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full text-sm font-medium"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
