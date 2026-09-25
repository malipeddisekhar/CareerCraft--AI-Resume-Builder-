import React from "react";
import { Sparkles } from "lucide-react";

function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full px-6 py-4 border-t border-gray-100 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-1.5">
          <Sparkles size={13} className="text-blue-500" />
          <span className="text-xs font-black tracking-tight">
            <span className="text-[#1a2e52]">CareerCraft</span>
            <span className="bg-gradient-to-r from-blue-500 to-orange-500 bg-clip-text text-transparent"> AI</span>
          </span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-[10px] text-gray-400 font-medium">Resume Builder</span>
          <span className="text-gray-300 text-xs">·</span>
          <span className="text-[10px] text-gray-400">
            © {year} All rights reserved.
          </span>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-1 text-[10px] font-black tracking-tight">
          <span className="text-[#1a2e52]">Dream Big.</span>
          <span className="text-blue-500">Skill Up.</span>
          <span className="text-orange-500">Fly High!</span>
        </div>
      </div>
    </footer>
  );
}

export default AdminFooter;

