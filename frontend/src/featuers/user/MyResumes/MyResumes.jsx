import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, FileText, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

import UserNavBar from "../UserNavBar/UserNavBar";
import ResumeTable from "./components/ResumeTable";
import SearchFilter from "./components/SearchFilter";
import Pagination from "./components/Pagination";
import { useMyResumes } from "../../../hooks/useMyResumes";
import "./MyResumes.css";

export default function MyResumes({ onSidebarToggle }) {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  
  const {
    resumes,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    fetchResumes,
    deleteResume,
    downloadResume
  } = useMyResumes();

  const handleCreateNew = useCallback(() => {
    navigate('/templates');
  }, [navigate]);

  const handleViewResume = useCallback((resume) => {
    navigate(`/resume/preview/${resume.id}`);
  }, [navigate]);

  const handleEditResume = useCallback((resume) => {
    navigate(`/resume/edit/${resume.id}`);
  }, [navigate]);

  const handleDownloadResume = useCallback(async (resume) => {
    const success = await downloadResume(resume.id, resume.format);
    if (success) {
      toast.success(`${resume.title} downloaded successfully!`);
    }
  }, [downloadResume]);

  const handleDeleteResume = useCallback(async (resume) => {
    if (window.confirm(`Are you sure you want to delete "${resume.title}"?`)) {
      const success = await deleteResume(resume.id);
      if (success) {
        toast.success(`${resume.title} deleted successfully!`);
        setOpenMenu(null);
      }
    }
  }, [deleteResume]);

  const handlePageChange = useCallback((page) => {
    fetchResumes(page, filters.search, filters.format);
  }, [fetchResumes, filters.search, filters.format]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchResumes(1, newFilters.search, newFilters.format);
  }, [setFilters, fetchResumes]);

  if (error) {
    return (
      <div className="myresumes-page user-page">
        <UserNavBar onMenuClick={onSidebarToggle || (() => console.log("Toggle sidebar"))} />
        <div className="myresumes-wrapper">
          <div className="error-state">
            <AlertCircle size={48} />
            <h3>Error Loading Resumes</h3>
            <p>{error}</p>
            <button onClick={() => fetchResumes()} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="myresumes-page user-page">
      <UserNavBar
        onMenuClick={onSidebarToggle || (() => console.log("Toggle sidebar"))}
      />

      <div className="myresumes-wrapper">
        <div className="page-header">
          <div>
            <h1>My Resumes</h1>
            <p>Manage all your resume documents.</p>
          </div>
          <button className="create-btn" onClick={handleCreateNew}>
            <Plus size={20} />
            Create New
          </button>
        </div>

        <div className="card">
          <SearchFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            totalResumes={pagination.total}
          />

          <ResumeTable
            resumes={resumes}
            loading={loading}
            openMenu={openMenu}
            setOpenMenu={setOpenMenu}
            onView={handleViewResume}
            onEdit={handleEditResume}
            onDownload={handleDownloadResume}
            onDelete={handleDeleteResume}
          />

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        </div>

        <footer className="mt-4 py-4 bg-white border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1 px-6">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              ©️ {new Date().getFullYear()}{" "}
              <span className="text-[#1a2e52]">CareerCraft</span>
              <span className="bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent font-black"> AI</span>
              <span className="text-gray-400 font-medium"> · Resume Builder · All rights reserved.</span>
            </p>
            <div className="flex items-center gap-1 text-[10px] font-black tracking-tight">
              <span className="text-[#1a2e52]">Dream Big.</span>
              <span className="text-blue-500">Skill Up.</span>
              <span className="text-orange-500">Fly High!</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
