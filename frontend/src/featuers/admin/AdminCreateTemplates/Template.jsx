import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPortal } from "react-dom";
import { Filter, X, Search, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { TEMPLATES } from "../../user/Templates/TemplateRegistry";
import { templates as CV_LIST } from "../../user/CV/Templatesgallery";
import CVTemplates from "../../user/CV/Cvtemplates";
import mergeWithSampleData from "../../../utils/Datahelpers";
import axiosInstance from "../../../api/axios";
import TemplateTypeSwitch from "./TemplateTypeSwitch";
import { COVER_LETTER_TEMPLATES } from "../../user/CoverLetter/CoverLetterRegistry";
import CoverLetterTemplatesMap from "../../user/CoverLetter/CoverLetterTemplatesMap";

// ─── Constants ────────────────────────────────────────────────────────────────

const CV_PLACEHOLDER = "https://via.placeholder.com/210x297.png?text=CV+Template";
const CV_CANVAS_WIDTH = 794;

const SOURCE_MAP = {
  resume: TEMPLATES,
  cv: CV_LIST,
  "cover-letter": COVER_LETTER_TEMPLATES,
};

// ONLY the 3 existing categories — do NOT create any separate category!
const EXISTING_CATEGORIES = [
  "Contemporary Templates",
  "Creative Templates",
  "Traditional Templates",
];

function getCategoryBucketKey(category) {
  const cat = String(category || "").trim().toLowerCase();
  if (cat.includes("contemporary") || cat.includes("modern")) {
    return "Contemporary Templates";
  }
  if (cat.includes("creative") || cat.includes("design") || cat.includes("art")) {
    return "Creative Templates";
  }
  if (
    cat.includes("traditional") ||
    cat.includes("professional") ||
    cat.includes("academic") ||
    cat.includes("minimal") ||
    cat.includes("elegant")
  ) {
    return "Traditional Templates";
  }
  // Fallback ALWAYS goes to an existing category, NEVER creates a new category
  return "Contemporary Templates";
}

const resolveImageUrl = (target) => {
  if (!target) return CV_PLACEHOLDER;
  // If passed the template object:
  if (typeof target === "object") {
    if (target.isStatic) return target.image || CV_PLACEHOLDER;
    return resolveImageUrl(target.image);
  }
  // If target is already a full URL or blob or data URI
  const url = String(target);
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  // If it's a Vite local asset path
  if (
    url.startsWith("/src/") ||
    url.startsWith("/assets/") ||
    url.includes("template_thumnail") ||
    url.startsWith("@")
  ) {
    return url;
  }
  // If it's an uploaded file path from backend
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanPath = url.replace(/\\/g, "/");
  return `${baseUrl}${cleanPath.startsWith("/") ? "" : "/"}${cleanPath}`;
};

// ─── Pure Helpers ─────────────────────────────────────────────────────────────

function buildMergedTemplates(type, dbTemplates = []) {
  // Always initialize strictly the 3 existing categories
  const sections = {
    "Contemporary Templates": [],
    "Creative Templates": [],
    "Traditional Templates": [],
  };

  // 1. Static templates
  const source = SOURCE_MAP[type] ?? [];
  for (const t of source) {
    const bucket = getCategoryBucketKey(t.category);
    sections[bucket].push({
      _id: t.id,
      name: t.name,
      used: 0,
      previewText: t.description || t.category,
      image: t.thumbnail || CV_PLACEHOLDER,
      isStatic: !!t.thumbnail,
      isDbTemplate: false,
      templateId: t.id,
      type,
    });
  }

  // 2. DB uploaded templates matching current type (or default resume)
  const matchingDb = dbTemplates.filter((t) => {
    const tType = (t.type || "resume").toLowerCase();
    return tType === type.toLowerCase();
  });

  // Prepend into the existing category so newly created templates appear first
  for (const t of matchingDb) {
    const bucket = getCategoryBucketKey(t.category);
    sections[bucket].unshift({
      _id: t._id || t.id,
      name: t.name,
      used: 0,
      previewText: t.description || t.category || "Uploaded Template",
      image: t.imageUrl || t.previewimage || CV_PLACEHOLDER,
      isStatic: false,
      isDbTemplate: true,
      templateId: t._id || t.id,
      type: t.type || "resume",
      category: t.category,
    });
  }

  return sections;
}

function applyFilters(templates, statuses, search, statusFilter) {
  const term = search.toLowerCase();
  return Object.fromEntries(
    Object.entries(templates).map(([section, items]) => [
      section,
      items.filter((tpl) => {
        const matchesSearch =
          !term ||
          tpl.name?.toLowerCase().includes(term) ||
          tpl.previewText?.toLowerCase().includes(term) ||
          section.toLowerCase().includes(term);

        const isActive = statuses[tpl._id] !== false;
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && isActive) ||
          (statusFilter === "inactive" && !isActive);

        return matchesSearch && matchesStatus;
      }),
    ])
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useTemplateVisibility() {
  const queryClient = useQueryClient();

  const { data: statuses = {} } = useQuery({
    queryKey: ["templateVisibility"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/template-visibility");
      return res.data || {};
    },
    staleTime: 300_000,
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id) =>
      axiosInstance.post("/api/template-visibility/toggle", { templateId: id }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["templateVisibility"] });
      const prev = queryClient.getQueryData(["templateVisibility"]);
      queryClient.setQueryData(["templateVisibility"], (old = {}) => ({
        ...old,
        [id]: old[id] !== false ? false : true,
      }));
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(["templateVisibility"], ctx.prev);
      toast.error("Failed to update status");
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["templateVisibility"] }),
  });

  const isActive = (id) => statuses[id] !== false;
  return { statuses, isActive, toggleStatus };
}

function usePreviewModal(type) {
  const [template, setTemplate] = React.useState(null);
  const [viewportWidth, setViewportWidth] = React.useState(0);
  const viewportRef = React.useRef(null);
  const isOpen = template !== null;

  React.useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen || type !== "cv") return;
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportWidth(el.clientWidth || 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, type]);

  const scale = React.useMemo(() => {
    if (type !== "cv" || !viewportWidth) return 1;
    const available = Math.max(0, viewportWidth - 16);
    return available ? Math.min(1, available / CV_CANVAS_WIDTH) : 1;
  }, [type, viewportWidth]);

  return {
    isOpen,
    template,
    viewportRef,
    scale,
    open: setTemplate,
    close: () => setTemplate(null),
  };
}

function useScrollSection(items) {
  const scrollRef = React.useRef(null);
  const [showControls, setShowControls] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      if (scrollRef.current) {
        const { scrollWidth, clientWidth } = scrollRef.current;
        setShowControls(scrollWidth > clientWidth);
      }
    };
    const t = setTimeout(check, 50);
    window.addEventListener("resize", check);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", check);
    };
  }, [items]);

  const scroll = (dir) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left:
        dir === "left"
          ? -scrollRef.current.clientWidth
          : scrollRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  return { scrollRef, showControls, scroll };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TemplateThumb = React.memo(function TemplateThumb({ tpl, type }) {
  if (type === "resume" || tpl.isDbTemplate) {
    return (
      <img
        src={resolveImageUrl(tpl)}
        alt={tpl.name}
        className="w-full h-full object-contain"
        onError={(e) => {
          e.target.src = CV_PLACEHOLDER;
        }}
      />
    );
  }
  const Component =
    type === "cv"
      ? CVTemplates?.[tpl.templateId]
      : CoverLetterTemplatesMap?.[tpl.templateId];

  return (
    <div
      className="absolute inset-0 pointer-events-none bg-white origin-top-left"
      style={{
        transform: "scale(0.32)",
        width: 794,
        height: 1123,
        overflow: "hidden",
      }}
    >
      {Component && <Component formData={mergeWithSampleData({})} />}
    </div>
  );
});

const AdminTemplateCard = React.memo(function AdminTemplateCard({
  tpl,
  type,
  isActive,
  onPreview,
  onToggleStatus,
  onDelete,
}) {
  return (
    <div
      className={`min-w-[280px] w-full md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 bg-white border border-slate-200 rounded-xl p-2 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative ${
        !isActive ? "opacity-70 grayscale" : ""
      }`}
    >
      <div
        className="relative w-full aspect-[210/297] rounded-lg overflow-hidden cursor-pointer"
        onClick={onPreview}
      >
        <TemplateThumb tpl={tpl} type={type} />
        {tpl.isDbTemplate && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-blue-600 text-white rounded-full shadow">
            Uploaded
          </span>
        )}
      </div>

      <div className="mt-2 text-sm font-semibold text-slate-800 truncate">
        {tpl.name}
      </div>
      <div className="text-xs text-slate-500 truncate">{tpl.previewText}</div>

      <div className="flex gap-2 mt-3 pt-2 border-t">
        <button
          onClick={onPreview}
          className="flex-1 py-1 text-xs bg-slate-50 rounded hover:bg-slate-100 transition-colors"
        >
          View
        </button>
        <button
          onClick={onToggleStatus}
          className={`flex-1 py-1 text-xs rounded transition-colors ${
            isActive
              ? "bg-slate-100 hover:bg-red-50 hover:text-red-600"
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          {isActive ? "Disable" : "Enable"}
        </button>
        {tpl.isDbTemplate && onDelete && (
          <button
            onClick={() => onDelete(tpl._id)}
            className="p-1.5 text-xs rounded bg-slate-50 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Delete uploaded template"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
});

const AdminTemplateSection = React.memo(function AdminTemplateSection({
  title,
  items,
  type,
  isTemplateActive,
  handlePreview,
  handleToggleStatus,
  handleDelete,
}) {
  const { scrollRef, showControls, scroll } = useScrollSection(items);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {items.length}
        </span>
      </div>

      <div className="relative group/section">
        {showControls && items.length > 1 && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 z-10 w-10 h-10 bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center text-slate-700 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-all duration-200 hover:bg-slate-50 hover:scale-110 disabled:opacity-0"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={scrollRef}
          className={`flex gap-6 pb-6 pt-1 px-1 -mx-1 scroll-smooth ${
            showControls ? "overflow-x-auto" : "overflow-x-visible flex-wrap"
          }`}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((tpl, i) => (
            <AdminTemplateCard
              key={tpl._id || i}
              tpl={tpl}
              type={type}
              isActive={isTemplateActive(tpl._id)}
              onPreview={() => handlePreview(tpl)}
              onToggleStatus={() => handleToggleStatus(tpl._id)}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {showControls && items.length > 1 && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 z-10 w-10 h-10 bg-white border border-slate-200 shadow-lg rounded-full flex items-center justify-center text-slate-700 opacity-100 md:opacity-0 md:group-hover/section:opacity-100 transition-all duration-200 hover:bg-slate-50 hover:scale-110"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
});

function PreviewModal({
  isOpen,
  template,
  type,
  viewportRef,
  scale,
  onClose,
}) {
  if (!isOpen) return null;

  const isDbOrResume = type === "resume" || template?.isDbTemplate;
  const PreviewComponent =
    !isDbOrResume && type === "cv" && template?.templateId
      ? CVTemplates?.[template.templateId]
      : !isDbOrResume && type === "cover-letter" && template?.templateId
      ? CoverLetterTemplatesMap?.[template.templateId]
      : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-black/85 p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative mx-auto flex h-full max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 pr-14 sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              {template?.name || "Template Preview"}
            </h2>
            <p className="text-sm text-slate-500 capitalize">
              {type.replace("-", " ")} template preview
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/50 p-2 text-white"
        >
          <X size={20} />
        </button>

        <div className="flex-1 overflow-auto bg-slate-100 p-4 sm:p-6">
          {isDbOrResume ? (
            <div className="mx-auto flex w-full max-w-4xl justify-center">
              <img
                src={resolveImageUrl(template)}
                alt={template?.name || "Template Preview"}
                className="h-auto max-w-full rounded-md bg-white shadow-lg"
              />
            </div>
          ) : PreviewComponent ? (
            <div ref={viewportRef} className="mx-auto w-full overflow-auto">
              <div
                className="mx-auto origin-top bg-white shadow-lg"
                style={{ width: CV_CANVAS_WIDTH, zoom: scale }}
              >
                <PreviewComponent formData={mergeWithSampleData({})} />
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-white text-slate-500">
              Preview is not available for this template.
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminTemplates() {
  const [type, setType] = React.useState("resume");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const queryClient = useQueryClient();
  const { statuses, isActive, toggleStatus } = useTemplateVisibility();
  const preview = usePreviewModal(type);

  // Fetch DB templates from backend
  const { data: dbTemplates = [] } = useQuery({
    queryKey: ["adminTemplates"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/api/admin/templates");
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error("Failed to load admin templates:", err);
        return [];
      }
    },
  });

  // Delete mutation for uploaded templates with immediate UI update
  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/admin/templates/${id}`),
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ["adminTemplates"] });

      // Snapshot previous value
      const previousTemplates = queryClient.getQueryData(["adminTemplates"]);

      // Optimistically remove from UI immediately without waiting for server response
      queryClient.setQueryData(["adminTemplates"], (old = []) =>
        Array.isArray(old)
          ? old.filter((t) => (t._id || t.id) !== deletedId)
          : []
      );

      return { previousTemplates };
    },
    onSuccess: (_data, deletedId) => {
      // Ensure the deleted item remains filtered out of cache
      queryClient.setQueryData(["adminTemplates"], (old = []) =>
        Array.isArray(old)
          ? old.filter((t) => (t._id || t.id) !== deletedId)
          : []
      );
      queryClient.invalidateQueries({ queryKey: ["adminTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template was deleted successfully.");
    },
    onError: (err, _deletedId, context) => {
      // Rollback to previous state on failure
      if (context?.previousTemplates) {
        queryClient.setQueryData(["adminTemplates"], context.previousTemplates);
      }
      toast.error(
        err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Failed to delete template"
      );
    },
  });

  const handleDeleteTemplate = (id) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  // Merge static templates + DB uploaded templates into STRICTLY existing categories
  const approvedTemplates = React.useMemo(
    () => buildMergedTemplates(type, dbTemplates),
    [type, dbTemplates]
  );

  const filteredTemplates = React.useMemo(
    () => applyFilters(approvedTemplates, statuses, search, statusFilter),
    [approvedTemplates, statuses, search, statusFilter]
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      <Toaster />

      <div className="sticky top-[64px] z-40 bg-white border-b border-slate-200 px-6 py-3 flex justify-center md:justify-start">
        <TemplateTypeSwitch value={type} onChange={setType} />
      </div>

      <div className="p-6 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 capitalize">
              {type.replace("-", " ")} Templates
            </h1>
            <p className="text-sm text-slate-500">
              Manage and organize all available {type.replace("-", " ")} templates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${type}s...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="relative inline-block w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-10 py-2 border border-slate-200 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Template Sections — ONLY the 3 existing categories */}
        {Object.entries(filteredTemplates).map(([section, items]) =>
          items.length > 0 ? (
            <AdminTemplateSection
              key={section}
              title={section}
              items={items}
              type={type}
              isTemplateActive={isActive}
              handlePreview={preview.open}
              handleToggleStatus={toggleStatus}
              handleDelete={handleDeleteTemplate}
            />
          ) : null
        )}

        {/* Preview Modal */}
        <PreviewModal
          isOpen={preview.isOpen}
          template={preview.template}
          type={type}
          viewportRef={preview.viewportRef}
          scale={preview.scale}
          onClose={preview.close}
        />
      </div>
    </div>
  );
}