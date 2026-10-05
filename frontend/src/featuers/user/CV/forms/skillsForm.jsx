import { Plus, X, Sparkles, RefreshCw } from "lucide-react";
import { useState, useCallback } from "react";
import axiosInstance from "../../../../api/axios";

// ── Helper: Safe skills update (avoids repetition) ──
const updateSkills = (prev, type, updater) => {
  const skills = prev?.skills ?? { technical: [], soft: [] };
  return {
    ...prev,
    skills: {
      ...skills,
      [type]: updater(skills[type] ?? []),
    },
  };
};

const SkillsForm = ({ formData, setFormData }) => {
  const [newSkill, setNewSkill] = useState("");
  const [skillType, setSkillType] = useState("technical");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({ technical: [], soft: [] });
  const [aiError, setAiError] = useState("");

  const addSkill = useCallback(() => {
    if (!newSkill.trim()) return;
    setFormData(prev => updateSkills(prev, skillType, 
      list => [...list, newSkill.trim()]
    ));
    setNewSkill("");
  }, [newSkill, skillType, setFormData]);

  const removeSkill = useCallback((type, skillValue) => {
    setFormData(prev => updateSkills(prev, type, 
      list => list.filter(s => s !== skillValue)
    ));
  }, [setFormData]);

  const addSuggestedSkill = useCallback((skill) => {
    setFormData(prev => {
      const current = prev?.skills?.[skillType] ?? [];
      if (current.includes(skill)) return prev;
      return updateSkills(prev, skillType, list => [...list, skill]);
    });
  }, [skillType, setFormData]);

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

  const staticSuggestions = skillType === "technical"
    ? ["JavaScript", "React", "Node.js", "Python", "SQL", "AWS"]
    : ["Leadership", "Communication", "Problem Solving", "Teamwork"];

  const currentSkills = formData?.skills?.[skillType] ?? [];
  const aiList = aiSuggestions[skillType] ?? [];
  const displaySuggestions = aiList.length > 0
    ? aiList.filter((s) => !currentSkills.includes(s))
    : staticSuggestions.filter((s) => !currentSkills.includes(s));

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle Buttons */}
      <div className="flex gap-2 p-3 rounded-xl bg-slate-900 w-fit mx-auto" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={skillType === "technical"}
          onClick={() => setSkillType("technical")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${skillType === "technical" ? "bg-white text-slate-900 shadow-md scale-105" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}
        >
          Technical Skills
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={skillType === "soft"}
          onClick={() => setSkillType("soft")}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-300
            ${skillType === "soft" ? "bg-white text-slate-900 shadow-md scale-105" : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"}`}
        >
          Soft Skills
        </button>
      </div>

      {/* AI Suggest Button */}
      <div className="flex justify-end px-2">
        <button
          type="button"
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
        <p className="text-xs text-red-500 px-2">{aiError}</p>
      )}

      {/* Add Skill Input */}
      <div className="flex gap-2 px-2">
        <label htmlFor="skill-input" className="sr-only">Add skill</label>
        <input
          id="skill-input"
          type="text"
          value={newSkill}
          placeholder={`Add a ${skillType} skill...`}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addSkill()}
          className="border w-full p-2 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={addSkill}
          aria-label="Add skill"
          className="bg-black text-white px-4 rounded-lg hover:bg-black/80 transition"
        >
          Add
        </button>
      </div>

      {/* Skills List */}
      <div className="flex flex-wrap gap-2 px-2 min-h-[36px]">
        {currentSkills.map((skill) => (
          <span
            key={`${skillType}-${skill}`}
            className="inline-flex items-center gap-2 bg-blue-200 text-blue-700 text-sm px-3 py-1 rounded-xl"
          >
            {skill}
            <button 
              type="button"
              onClick={() => removeSkill(skillType, skill)}
              aria-label={`Remove ${skill}`}
            >
              <X size={14} className="hover:text-red-500 transition" />
            </button>
          </span>
        ))}
        {currentSkills.length === 0 && (
          <span className="text-xs text-slate-400 italic">No {skillType} skills added yet.</span>
        )}
      </div>

      {/* Suggested Skills (AI / Static) */}
      <div className="px-2">
        <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-2">
          {aiList.length > 0 ? (
            <><Sparkles size={14} className="text-indigo-500" /> AI Suggested {skillType} skills:</>
          ) : (
            `Suggested skills:`
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          {displaySuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSuggestedSkill(skill)}
              className="flex items-center gap-1 bg-black text-white px-3 py-1.5 text-sm rounded-lg hover:bg-black/80 transition"
            >
              <Plus size={14} />
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