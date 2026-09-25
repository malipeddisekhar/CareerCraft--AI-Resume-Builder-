import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavBar/AdminNavBar";
import AdminSidebar from "./AdminSidebar/AdminSidebar";
import AdminFooter from "./AdminFooter";
import { NotificationProvider } from "../../context/NotificationContext";

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <NotificationProvider>
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
        <AdminNavbar 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      </div>

      <AdminSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main
        className={`
          pt-16 md:pt-0 min-h-screen bg-slate-50 flex flex-col
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "md:ml-20" : "md:ml-64"}
        `}
      >
        <div className="flex-1">
          <Outlet />
        </div>
        <AdminFooter />
      </main>
    </NotificationProvider>
  );
}