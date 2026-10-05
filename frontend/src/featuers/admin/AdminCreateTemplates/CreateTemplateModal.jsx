import React, { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Upload,
  ImagePlus,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../../api/axios";

/* ─── Constants ────────────────────────────────────────────────── */
const CATEGORIES = ["Contemporary", "Creative", "Traditional"];
const TYPES = [
  { value: "resume", label: "Resume" },
  { value: "cv", label: "CV" },
  { value: "cover-letter", label: "Cover Letter" },
];

const ACCEPT_IMG = "image/jpeg,image/png,image/webp";
const ACCEPT_DOC = ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/* ─── Drag-n-drop file uploader ─────────────────────────────────── */
function FileDropZone({ label, hint, accept, file, onFile, onClear, icon: Icon, preview }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile]
  );

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      {file ? (
        <div className="relative rounded-xl border-2 border-blue-400 bg-blue-50 overflow-hidden">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-52 object-contain bg-white"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                <span className="text-white text-xs font-medium truncate">{file.name}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4">
              <FileText size={32} className="text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <CheckCircle size={20} className="text-green-500" />
            </div>
          )}
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-red-50 hover:text-red-600 transition-colors shadow"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 select-none ${
            dragging
              ? "border-blue-500 bg-blue-50 scale-[1.01]"
              : "border-slate-300 hover:border-blue-400 hover:bg-slate-50"
          }`}
        >
          <div className={`p-3 rounded-full ${dragging ? "bg-blue-100" : "bg-slate-100"}`}>
            <Icon size={24} className={dragging ? "text-blue-500" : "text-slate-400"} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Drag & drop or <span className="text-blue-600 underline">browse</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">{hint}</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ─── Progress bar ───────────────────────────────────────────────── */
function ProgressBar({ value }) {
  return (
    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────── */
export default function CreateTemplateModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    category: "Contemporary",
    type: "resume",
    description: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const resetForm = () => {
    setForm({ name: "", category: "Contemporary", type: "resume", description: "" });
    setThumbnail(null);
    setThumbnailPreview(null);
    setTemplateFile(null);
    setError("");
    setProgress(0);
  };

  const handleClose = () => {
    if (uploading) return;
    resetForm();
    onClose();
  };

  const handleThumbnail = (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image (JPG, PNG, WebP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Thumbnail must be under 5 MB");
      return;
    }
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleTemplateFile = (file) => {
    const allowed = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
    ];
    if (!allowed.includes(file.type) && !file.name.endsWith(".docx")) {
      setError("Template file must be a DOCX or HTML file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Template file must be under 10 MB");
      return;
    }
    setTemplateFile(file);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Template name is required");
    if (!thumbnail) return setError("Please upload a thumbnail image");

    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("category", form.category);
    data.append("type", form.type);
    data.append("description", form.description.trim());
    data.append("thumbnail", thumbnail);
    if (templateFile) data.append("templateFile", templateFile);

    setUploading(true);
    setProgress(0);

    try {
      const res = await axiosInstance.post("/api/admin/templates/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      });

      toast.success("Template created & approved successfully! 🎉");
      onSuccess?.(res.data.template);
      resetForm();
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        "Upload failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[95vh] flex flex-col bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-in 0.22s cubic-bezier(.34,1.56,.64,1)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Template</h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Templates uploaded by admin are auto-approved &amp; immediately visible to users.
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name + Category row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Modern Blue Resume"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                disabled={uploading}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Template Type
            </label>
            <div className="flex gap-3">
              {TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  disabled={uploading}
                  onClick={() => setForm((f) => ({ ...f, type: value }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-150 ${
                    form.type === value
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Short description shown under the template card..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={uploading}
              rows={2}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50"
            />
          </div>

          {/* Thumbnail upload */}
          <FileDropZone
            label={
              <>
                Thumbnail / Preview Image <span className="text-red-500">*</span>
              </>
            }
            hint="JPG, PNG or WebP · Max 5 MB"
            accept={ACCEPT_IMG}
            file={thumbnail}
            onFile={handleThumbnail}
            onClear={() => {
              setThumbnail(null);
              setThumbnailPreview(null);
            }}
            icon={ImagePlus}
            preview={thumbnailPreview}
          />

          {/* Template file upload */}
          <FileDropZone
            label={
              <>
                Template File{" "}
                <span className="text-slate-400 font-normal">(optional — DOCX or HTML)</span>
              </>
            }
            hint="DOCX / HTML · Max 10 MB · Used for live AI generation"
            accept={ACCEPT_DOC}
            file={templateFile}
            onFile={handleTemplateFile}
            onClear={() => setTemplateFile(null)}
            icon={Upload}
            preview={null}
          />

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          )}
        </form>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle size={13} className="text-green-500" />
            Admin uploads are instantly approved &amp; visible
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-template-form"
              disabled={uploading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 shadow-md shadow-blue-200"
            >
              {uploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Create Template
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1)   translateY(0); }
        }
      `}</style>
    </div>,
    document.body
  );
}
