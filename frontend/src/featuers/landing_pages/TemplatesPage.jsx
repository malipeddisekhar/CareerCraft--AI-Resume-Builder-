import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar";
import Footer from "./Footer";
import { TEMPLATES } from "../../featuers/user/Templates/TemplateRegistry";
import axiosInstance from "../../api/axios";

const resolveImageUrl = (target) => {
  if (!target) return "";
  const url = String(target);
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (
    url.startsWith("/src/") ||
    url.startsWith("/assets/") ||
    url.includes("template_thumnail") ||
    url.startsWith("@")
  ) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanPath = url.replace(/\\/g, "/");
  return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

function TemplatesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [allTemplates, setAllTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplatesData = async () => {
      try {
        const [visRes, dbRes] = await Promise.allSettled([
          axiosInstance.get('/api/template-visibility'),
          axiosInstance.get('/api/template?status=approved')
        ]);

        const visibilityMap = visRes.status === "fulfilled" ? visRes.value.data || {} : {};
        setStatuses(visibilityMap);

        const dbList = dbRes.status === "fulfilled" && Array.isArray(dbRes.value.data) ? dbRes.value.data : [];
        const matchingDb = dbList
          .filter(t => (t.type || "resume").toLowerCase() === "resume")
          .map(t => ({
            id: t._id || t.id,
            name: t.name,
            category: t.category || "Modern",
            thumbnail: resolveImageUrl(t.imageUrl || t.previewimage),
            description: t.description,
            isDynamic: true,
          }));

        const staticList = TEMPLATES.map(t => ({
          ...t,
          thumbnail: resolveImageUrl(t.thumbnail)
        }));

        setAllTemplates([...matchingDb, ...staticList]);
      } catch (error) {
        console.error("Failed to fetch templates", error);
        setAllTemplates(TEMPLATES.map(t => ({ ...t, thumbnail: resolveImageUrl(t.thumbnail) })));
      } finally {
        setLoading(false);
      }
    };
    fetchTemplatesData();
  }, []);

  // Filter templates: Must be active (default true) AND match category
  const availableTemplates = allTemplates.filter(t => statuses[t.id] !== false);

  const filteredTemplates = selectedCategory === "all"
    ? availableTemplates
    : availableTemplates.filter((t) =>
      t.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(t.category.toLowerCase())
    );

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "traditional", label: "Traditional" },
    { id: "modern", label: "Modern" },
    { id: "creative", label: "Creative" },
    { id: "executive", label: "Executive" },
  ];

  const handleCreateResume = (template) => {
    localStorage.setItem("currentTemplate", JSON.stringify(template.id));
    navigate("/user/resume-builder");
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* MAIN CONTENT */}
      <section className="px-8 py-12">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-5xl font-bold text-gray-900">Choose Your Template</h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Select a professionally designed template to get started
            </p>
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 ${selectedCategory === cat.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* TEMPLATES GRID */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                Loading templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                No templates found in this category.
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onMouseEnter={() => setHoveredTemplate(template.id)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  onClick={() => handleCreateResume(template)}
                  className="relative cursor-pointer group"
                >
                  <div
                    className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${hoveredTemplate === template.id
                      ? "border-blue-600 shadow-2xl -translate-y-2"
                      : "border-gray-200"
                      }`}
                  >
                    <div className="relative h-[400px] bg-gray-50 overflow-hidden">
                      <img
                        src={template.thumbnail} // Registry uses thumbnail
                        alt={template.name}
                        className="object-cover object-top w-full h-full"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          // Fallback placeholder logic
                        }}
                      />
                    </div>

                    <div className="p-4 bg-white border-t border-gray-200">
                      <h3 className="text-lg font-bold text-center text-gray-900">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-xs text-center text-gray-500 mt-1">{template.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default TemplatesPage;

