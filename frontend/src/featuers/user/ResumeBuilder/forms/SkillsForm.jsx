import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import { useState } from "react";
import axiosInstance from "../../../../api/axios";

// Safe helper to extract an array of strings from any skills format
const getSkillsList = (skillsObj, type) => {
  if (!skillsObj) return [];
  if (Array.isArray(skillsObj)) {
    return type === "technical"
      ? skillsObj.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean)
      : [];
  }
  const val = skillsObj[type];
  if (Array.isArray(val)) {
    return val.map((s) => (typeof s === "string" ? s : s?.name || "")).filter(Boolean);
  }
  if (typeof val === "string" && val.trim()) {
    return val.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const SkillsForm = ({ formData, setFormData }) => {
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState("technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({ technical: [], soft: [] });
  const [aiError, setAiError] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;
    const skillName = newSkill.trim();
    setFormData((prev) => {
      const prevSkills =
        typeof prev?.skills === "object" && !Array.isArray(prev?.skills)
          ? prev.skills || {}
          : {};
      const currentList = getSkillsList(prevSkills, skillType);
      if (currentList.includes(skillName)) return prev;
      return {
        ...prev,
        skills: {
          technical: getSkillsList(prevSkills, "technical"),
          soft: getSkillsList(prevSkills, "soft"),
          [skillType]: [...currentList, skillName],
        },
      };
    });
    setNewSkill("");
  };

  const removeSkill = (type, index) => {
    setFormData((prev) => {
      const prevSkills =
        typeof prev?.skills === "object" && !Array.isArray(prev?.skills)
          ? prev.skills || {}
          : {};
      const currentList = getSkillsList(prevSkills, type);
      return {
        ...prev,
        skills: {
          technical: getSkillsList(prevSkills, "technical"),
          soft: getSkillsList(prevSkills, "soft"),
          [type]: currentList.filter((_, i) => i !== index),
        },
      };
    });
  };

  const addSuggestedSkill = (skill) => {
    setFormData((prev) => {
      const prevSkills =
        typeof prev?.skills === "object" && !Array.isArray(prev?.skills)
          ? prev.skills || {}
          : {};
      const currentList = getSkillsList(prevSkills, skillType);
      if (currentList.includes(skill)) return prev;
      return {
        ...prev,
        skills: {
          technical: getSkillsList(prevSkills, "technical"),
          soft: getSkillsList(prevSkills, "soft"),
          [skillType]: [...currentList, skill],
        },
      };
    });
  };

  const handleAISuggestSkills = async () => {
    try {
      setIsGenerating(true);
      setAiError("");
      const response = await axiosInstance.post("/api/resume/suggest-skills", {
        experience: formData?.experience || [],
        education: formData?.education || [],
        projects: formData?.projects || [],
        skills: formData?.skills || { technical: [], soft: [] },
      });
      if (response.data?.suggestions) {
        setAiSuggestions(response.data.suggestions);
      }
    } catch (error) {
      console.error("AI skill suggestion failed:", error);
      setAiError("AI suggestion failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const staticSuggestions =
    skillType === "technical"
      ? ["JavaScript", "React.js", "Node.js", "Python", "SQL", "AWS"]
      : ["Leadership", "Communication", "Teamwork", "Problem Solving"];

  // Merge AI suggestions with static, filter already-added
  const currentSkills = getSkillsList(formData?.skills, skillType);
  const rawAiList = aiSuggestions?.[skillType];
  const aiList = Array.isArray(rawAiList) ? rawAiList.filter((s) => typeof s === "string") : [];
  const displaySuggestions = (aiList.length > 0 ? aiList : staticSuggestions)
    .filter((s) => !currentSkills.includes(s));

  return (
    <div className="flex flex-col gap-0.5">
      {/* Toggle */}
      <div className="flex gap-2 p-3 rounded-xl bg-slate-900 w-fit my-2 mx-auto">
        <button
          onClick={() => setSkillType("technical")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            skillType === "technical"
              ? "bg-white text-slate-900 shadow-md scale-105"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          Technical Skills
        </button>
        <button
          onClick={() => setSkillType("soft")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
            skillType === "soft"
              ? "bg-white text-slate-900 shadow-md scale-105"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          Soft Skills
        </button>
      </div>

      {/* AI Suggest Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={handleAISuggestSkills}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 disabled:opacity-60 transition-all shadow-md"
        >
          {isGenerating ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Sparkles size={14} />
          )}
          {isGenerating ? "Generating..." : "✨ AI Suggest Skills"}
        </button>
      </div>

      {aiError && (
        <p className="text-xs text-red-500 mb-2">{aiError}</p>
      )}

      {/* Add Skill Input */}
      <div className="flex gap-2 w-full mt-2 mb-4">
        <input
          type="text"
          className="flex-grow px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all bg-white"
          value={newSkill}
          placeholder={`Add a ${skillType} skill... (e.g., JavaScript, Leadership)`}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && newSkill.trim()) {
              e.preventDefault();
              addSkill();
            }
          }}
        />
        <button
          className="bg-black text-white py-2.5 px-5 rounded-lg text-sm font-medium hover:bg-black/80 transition-colors whitespace-nowrap"
          onClick={addSkill}
        >
          Add Skill
        </button>
      </div>

      {/* Current Skills */}
      <div className="w-full flex flex-wrap gap-2 mb-6 min-h-[40px]">
        {currentSkills.map((skill, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 bg-blue-50 text-sm font-medium text-blue-700 border border-blue-200 rounded-md px-2.5 py-1.5"
          >
            <span>{typeof skill === "string" ? skill : skill?.name || String(skill)}</span>
            <button
              onClick={() => removeSkill(skillType, idx)}
              className="hover:text-red-500 hover:bg-blue-100 rounded-full p-0.5 transition-colors"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        {currentSkills.length === 0 && (
          <div className="text-sm text-slate-400 italic flex items-center h-full">
            No {skillType} skills added yet.
          </div>
        )}
      </div>

      {/* Suggested Skills (static or AI) */}
      <div className="w-full">
        <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          {aiList.length > 0 ? (
            <><Sparkles size={14} className="text-indigo-500" /> AI Suggested {skillType} skills:</>
          ) : (
            `Suggested ${skillType} skills:`
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {displaySuggestions.map((skill, idx) => (
            <button
              key={idx}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 transition-all"
              onClick={() => addSuggestedSkill(skill)}
            >
              <Plus size={14} className="text-slate-400" />
              {skill}
            </button>
          ))}
          {displaySuggestions.length === 0 && (
            <p className="text-xs text-slate-400 italic">All suggested skills already added.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;
