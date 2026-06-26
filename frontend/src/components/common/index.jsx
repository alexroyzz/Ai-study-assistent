import React from "react";

export const Spinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
  return (
    <div
      className={`${sizes[size]} border-2 border-gray-700 border-t-brand-500 rounded-full animate-spin ${className}`}
    />
  );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-dark-100 flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-500" />
    </div>
    <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
    {description && (
      <p className="text-gray-500 text-sm mb-6 max-w-sm">{description}</p>
    )}
    {action}
  </div>
);

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  danger = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-dark-100 rounded-xl border border-gray-700 p-6 max-w-md w-full shadow-2xl animate-slide-up">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? "btn-danger" : "btn-primary"}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

export const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "blue",
  trend,
}) => {
  const colors = {
    blue: "from-brand-500/20 to-brand-600/5 border-brand-500/30 text-brand-400",
    purple:
      "from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400",
    green:
      "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400",
    yellow:
      "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400",
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl border p-5`}>
      <div className="flex items-center justify-between mb-3">
        <Icon size={22} className={colors[color].split(" ").pop()} />
        {trend !== undefined && (
          <span className="text-xs text-gray-500">{trend}</span>
        )}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
};

export const SearchBar = ({ value, onChange, placeholder = "Search..." }) => (
  <div className="relative">
    <svg
      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-10"
    />
  </div>
);
