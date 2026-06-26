import React from "react";
import { Sparkles } from "lucide-react";

export const LoadingScreen = () => (
  <div className="min-h-screen bg-dark-300 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center mx-auto mb-4 animate-pulse-slow">
        <Sparkles size={28} className="text-white" />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">Loading StudyAI...</p>
    </div>
  </div>
);

export default LoadingScreen;
