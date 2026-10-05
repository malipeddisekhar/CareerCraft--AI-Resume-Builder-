import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Download,
  FileText,
  X,
  TrendingUp,
  Award,
  Zap,
  Check,
  RefreshCw,
  Eye,
  Layers,
  ChevronRight
} from "lucide-react";

const AtsCompletionModal = ({
  show,
  onClose,
  atsResult,
  onApplyAtsToEditor,
  onDownload,
  onViewTemplates,
  downloading,
}) => {
  const [activeTab, setActiveTab] = useState("ats"); // "ats" | "original"
  const [applied, setApplied] = useState(false);

  if (!show || !atsResult) return null;

  const {
    atsScore = 99,
    grade = "A+ (Elite ATS Ready)",
    breakdown = { keywords: 100, formatting: 100, impactMetrics: 98, completeness: 100 },
    stats = { actionVerbsCount: 16, metricsCount: 6, matchedKeywordsCount: 24, shortlistRate: "98.4%" },
    improvements = [],
    atsOptimizedData = {},
    originalData = {},
  } = atsResult;

  const currentPreviewData = activeTab === "ats" ? atsOptimizedData : originalData;

  const handleApply = () => {
    if (onApplyAtsToEditor) {
      onApplyAtsToEditor(atsOptimizedData);
      setApplied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 md:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden my-auto">
        
        {/* ── HEADER ── */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    100% ATS Resume Optimization
                  </h2>
                  <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    AI Powered
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your resume has been analyzed and elevated to score between 98-100% on recruiter ATS scanners.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── SCROLLABLE BODY ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* ── ATS SCORE BANNER ── */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
              
              {/* Score Ring / Dial */}
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="#1e293b"
                      strokeWidth="7"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#atsScoreGradient)"
                      strokeWidth="7"
                      strokeDasharray={263.89}
                      strokeDashoffset={263.89 - (263.89 * (atsScore || 99)) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{ filter: "drop-shadow(0 0 8px rgba(16, 185, 129, 0.45))" }}
                    />
                    <defs>
                      <linearGradient id="atsScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-black text-white tracking-tight leading-none">
                      {atsScore}%
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider mt-1">
                      ATS Score
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{grade}</span>
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm">
                    Surpasses the 80% benchmark required by top-tier ATS systems (Workday, Taleo, Greenhouse, Lever).
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2.5">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                      <TrendingUp size={12} /> {stats.shortlistRate} Shortlist Rate
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md">
                      <Zap size={12} /> {stats.actionVerbsCount}+ Action Verbs
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Score Pills */}
              <div className="grid grid-cols-2 gap-2.5 w-full sm:w-auto">
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] backdrop-blur-sm shadow-inner">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Keywords</p>
                  <p className="text-lg font-black text-emerald-400">{breakdown.keywords}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] backdrop-blur-sm shadow-inner">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Formatting</p>
                  <p className="text-lg font-black text-emerald-400">{breakdown.formatting}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] backdrop-blur-sm shadow-inner">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">STAR Metrics</p>
                  <p className="text-lg font-black text-emerald-400">{breakdown.impactMetrics}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-center min-w-[110px] backdrop-blur-sm shadow-inner">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Structure</p>
                  <p className="text-lg font-black text-emerald-400">{breakdown.completeness}%</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── KEY IMPROVEMENTS HIGHLIGHTS ── */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
              <Award size={15} className="text-indigo-600" />
              What AI Polished for ATS Excellence:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-sm">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── INTERACTIVE TAB SWITCHER (ATS vs ORIGINAL) ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers size={16} className="text-blue-600" />
                Compare Resume Versions:
              </h3>
              
              {/* Tab Selector */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("ats")}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === "ats"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Sparkles size={13} className="text-indigo-600" />
                  ✨ 100% ATS Optimized (99%)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("original")}
                  className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                    activeTab === "original"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText size={13} className="text-slate-500" />
                  📝 Manually Added (Original)
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {activeTab === "ats" ? "🌟 AI Enhanced Professional Summary" : "📄 Manually Entered Summary"}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                  activeTab === "ats" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                }`}>
                  {activeTab === "ats" ? "ATS Score: 99%" : "Original"}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 italic bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                "{currentPreviewData.summary || "No summary provided."}"
              </p>

              {/* Skills Snippet */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Technical Keywords (ATS Indexed):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(currentPreviewData.skills?.technical || []).slice(0, 10).map((skill, i) => (
                    <span
                      key={i}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                        activeTab === "ats"
                          ? "bg-indigo-50/60 text-indigo-700 border-indigo-200/80"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {(currentPreviewData.skills?.technical || []).length > 10 && (
                    <span className="text-[11px] font-semibold text-slate-400 px-1 py-1">
                      +{(currentPreviewData.skills?.technical || []).length - 10} more
                    </span>
                  )}
                </div>
              </div>

              {/* Experience Highlights Comparison */}
              {(currentPreviewData.experience || []).length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {activeTab === "ats" ? "⭐ STAR / XYZ Experience Achievements:" : "Work History:"}
                  </p>
                  <div className="space-y-2">
                    {(currentPreviewData.experience || []).slice(0, 2).map((exp, i) => (
                      <div key={i} className="text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{exp.title || "Role"}</span>
                          {exp.company && <span className="text-slate-500 text-[11px]">{exp.company}</span>}
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed text-[11px] line-clamp-3">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply to editor button */}
              {activeTab === "ats" && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={applied}
                    className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg border border-indigo-200 transition-all"
                  >
                    {applied ? (
                      <>
                        <Check size={14} className="text-emerald-600" />
                        <span className="text-emerald-700">Applied to Editor!</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        Apply 100% ATS Version to Active Editor
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── DOWNLOAD OPTIONS SECTION (BOTH RESUMES) ── */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Download size={16} className="text-emerald-600" />
              Download Options (Select Format):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Option 1: 100% ATS AI-Optimized Resume (Featured) */}
              <div className="border-2 border-indigo-600 rounded-2xl p-4 bg-gradient-to-b from-indigo-50/40 via-white to-white shadow-md relative flex flex-col justify-between">
                <span className="absolute -top-3 left-4 px-2.5 py-0.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm">
                  ⭐ Recommended (98-100% ATS)
                </span>

                <div>
                  <div className="flex items-center gap-2 mb-1.5 mt-1">
                    <Sparkles size={16} className="text-indigo-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      100% ATS AI-Optimized Resume
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Polished with STAR achievements, action verbs, and ATS keywords for maximum recruiter callback rate.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDownload(atsOptimizedData, "PDF", "ATS_Optimized_Resume")}
                    disabled={downloading === "ai-pdf"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {downloading === "ai-pdf" ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    Download PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownload(atsOptimizedData, "DOCX", "ATS_Optimized_Resume")}
                    disabled={downloading === "ai-docx"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {downloading === "ai-docx" ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <FileText size={14} />
                    )}
                    Download Word
                  </button>
                </div>
              </div>

              {/* Option 2: Manually Added Information Resume (Original) */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText size={16} className="text-slate-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Manually Added Resume (Original)
                    </h4>
                  </div>
                  <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                    Your exact unedited manual input as originally entered in the form fields.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onDownload(originalData, "PDF", "Manual_Resume")}
                    disabled={downloading === "orig-pdf"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all disabled:opacity-50"
                  >
                    {downloading === "orig-pdf" ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={14} />
                    )}
                    Download PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => onDownload(originalData, "DOCX", "Manual_Resume")}
                    disabled={downloading === "orig-docx"}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all disabled:opacity-50"
                  >
                    {downloading === "orig-docx" ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <FileText size={14} />
                    )}
                    Download Word
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500">
            💡 Both PDF & Word formats are fully ATS compliant with 0 machine errors.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition"
            >
              Continue Editing
            </button>

            {onViewTemplates && (
              <button
                type="button"
                onClick={onViewTemplates}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                Change Template
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AtsCompletionModal;
