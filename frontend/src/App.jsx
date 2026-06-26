import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotesPage from "./pages/NotesPage";
import NotePage from "./pages/NotePage";
import QuizzesPage from "./pages/QuizzesPage";
import QuizPage from "./pages/QuizPage";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";

// Layout
import AppLayout from "./components/layout/AppLayout";
import LoadingScreen from "./components/common/LoadingScreen";

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// ─── Public Route Wrapper (redirect if logged in) ─────────────────────────────
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── App Routes ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />

    {/* Protected routes wrapped in AppLayout (sidebar + header) */}
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="upload" element={<UploadPage />} />
      <Route path="notes" element={<NotesPage />} />
      <Route path="notes/:id" element={<NotePage />} />
      <Route path="quizzes" element={<QuizzesPage />} />
      <Route path="quizzes/:id" element={<QuizPage />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="chat/:id" element={<ChatPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>

    {/* Catch all */}
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
);

export default App;
