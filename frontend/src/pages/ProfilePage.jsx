import React, { useState } from "react";
import {
  User,
  Mail,
  FileText,
  BookOpen,
  Brain,
  MessageSquare,
  Save,
  Lock,
  Camera,
} from "lucide-react";
import { userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StatCard, Spinner } from "../components/common/index.jsx";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    avatar: user?.avatar || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setSavingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={FileText}
          label="PDFs"
          value={user?.stats?.documentsUploaded || 0}
          color="blue"
        />
        <StatCard
          icon={BookOpen}
          label="Notes"
          value={user?.stats?.notesGenerated || 0}
          color="purple"
        />
        <StatCard
          icon={Brain}
          label="Quizzes"
          value={user?.stats?.quizzesTaken || 0}
          color="green"
        />
        <StatCard
          icon={MessageSquare}
          label="Chats"
          value={user?.stats?.chatMessages || 0}
          color="yellow"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-dark-100 rounded-xl p-1 mb-6 border border-gray-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === id
                ? "bg-dark-300 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="card animate-fade-in">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-800">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-purple flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{user?.name}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                <Mail size={13} /> {user?.email}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })
                  : "recently"}
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                className="input"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="input opacity-60 cursor-not-allowed"
              />
              <p className="text-xs text-gray-600 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="label">Avatar URL</label>
              <input
                type="url"
                value={profileForm.avatar}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, avatar: e.target.value })
                }
                className="input"
                placeholder="https://example.com/your-photo.jpg"
              />
              <p className="text-xs text-gray-600 mt-1">
                Paste a URL to any image (or upload to Cloudinary)
              </p>
            </div>

            <div>
              <label className="label">
                Bio{" "}
                <span className="text-gray-600 font-normal">(optional)</span>
              </label>
              <textarea
                value={profileForm.bio}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, bio: e.target.value })
                }
                className="input resize-none"
                rows={3}
                placeholder="Tell us a bit about yourself..."
                maxLength={200}
              />
              <p className="text-xs text-gray-600 mt-1 text-right">
                {profileForm.bio.length}/200
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary"
            >
              {savingProfile ? <Spinner size="sm" /> : <Save size={16} />}
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="card animate-fade-in">
          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Lock size={20} className="text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Change Password</h3>
              <p className="text-xs text-gray-500">
                Keep your account secure with a strong password
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordSave} className="space-y-5">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="input"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="input"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="input"
                placeholder="Repeat new password"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="btn-primary"
            >
              {savingPassword ? <Spinner size="sm" /> : <Lock size={16} />}
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>

          {/* Security tips */}
          <div className="mt-6 p-4 bg-dark-300 rounded-xl border border-gray-800">
            <p className="text-xs font-medium text-gray-400 mb-2">
              🔒 Password tips:
            </p>
            <ul className="space-y-1">
              {[
                "Use at least 8 characters",
                "Mix uppercase, lowercase, numbers & symbols",
                "Avoid using personal info like birthdays",
                "Use a unique password for this account",
              ].map((tip, i) => (
                <li
                  key={i}
                  className="text-xs text-gray-600 flex items-center gap-2"
                >
                  <span className="text-brand-400">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
