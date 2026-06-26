
// pages/LoginPage.jsx
 
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/index.jsx';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-300 flex">
      {/* Left: Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark-400 to-dark-200 flex-col justify-between p-12 border-r border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-white">StudyAI</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Learn smarter,<br />
            <span className="bg-gradient-to-r from-brand-400 to-accent-purple bg-clip-text text-transparent">
              not harder.
            </span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Upload your PDFs and let AI generate notes, create quizzes, and answer your questions — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Notes Generated', value: '50K+' },
            { label: 'Quizzes Created', value: '20K+' },
            { label: 'Students', value: '10K+' },
            { label: 'PDFs Processed', value: '100K+' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-dark-100 rounded-xl p-4 border border-gray-800">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white">StudyAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to continue learning</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input pr-10"
                  placeholder="Your password"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
              {loading ? <Spinner size="sm" /> : <LogIn size={18} />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
