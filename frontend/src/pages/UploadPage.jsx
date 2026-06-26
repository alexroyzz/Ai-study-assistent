import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { documentAPI } from "../services/api";
import { Spinner } from "../components/common/index.jsx";
import toast from "react-hot-toast";

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be under 10MB");
      return;
    }
    setFile(selectedFile);
    // Auto-fill title from filename
    if (!title) {
      setTitle(selectedFile.name.replace(".pdf", "").replace(/[-_]/g, " "));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);
    formData.append("title", title || file.name.replace(".pdf", ""));

    setUploading(true);
    setProgress(0);

    // Simulate progress during upload
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 90));
    }, 300);

    try {
      const { data } = await documentAPI.upload(formData);
      clearInterval(progressInterval);
      setProgress(100);
      toast.success("PDF uploaded and text extracted successfully!");
      setTimeout(() => navigate("/documents"), 800);
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Upload PDF</h1>
        <p className="text-gray-400 text-sm">
          Upload a PDF to generate AI notes, quizzes, and chat with it
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop Zone */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200
            ${dragging ? "border-brand-500 bg-brand-500/10" : "border-gray-700 hover:border-gray-500 hover:bg-dark-100"}
            ${file ? "border-emerald-500/50 bg-emerald-500/5" : ""}
            ${uploading ? "pointer-events-none" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
            disabled={uploading}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              {!uploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setProgress(0);
                  }}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  <X size={14} />
                  Remove file
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-xl bg-dark-300 flex items-center justify-center">
                <Upload size={28} className="text-gray-500" />
              </div>
              <div>
                <p className="text-gray-300 font-medium">
                  Drop your PDF here or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF files only · Max 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Title input */}
        <div>
          <label className="label">Document Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Give your document a meaningful title"
            disabled={uploading}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">
                Uploading and extracting text...
              </span>
              <span className="text-sm text-brand-400 font-medium">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-dark-300 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-brand-500 to-accent-purple h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-dark-100 rounded-xl p-4 border border-gray-800">
          <p className="text-xs font-medium text-gray-400 mb-2">
            💡 Tips for best results:
          </p>
          <ul className="space-y-1">
            {[
              "Use text-based PDFs (not scanned images) for best AI performance",
              "Larger PDFs work great — the AI will handle long content",
              "Textbooks, research papers, and notes all work well",
            ].map((tip, i) => (
              <li
                key={i}
                className="text-xs text-gray-500 flex items-start gap-2"
              >
                <span className="text-brand-400 flex-shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary w-full justify-center py-3"
        >
          {uploading ? <Spinner size="sm" /> : <Upload size={18} />}
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;
