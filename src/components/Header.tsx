'use client';

import React from 'react';
import { Upload, Terminal as TerminalIcon, FolderOpen, Scale } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
  onToggleMobileSidebar?: () => void;
  onUploadClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenLogs,
  onToggleMobileSidebar,
  onUploadClick
}) => {
  return (
    <header className="h-16 bg-white shadow-md shadow-slate-200/80 border-b border-slate-200/60 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile Drawer Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            title="Mở Kho Tài Liệu"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Professional Brand Logo Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              Lexifin
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60 font-sans">
                Enterprise RAG
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">Phân Tích Hợp Đồng & Tra Cứu Ngữ Cảnh Chuyên Sâu</p>
          </div>
        </div>
      </div>

      {/* Action Controls - Top Right Button */}
      <div className="flex items-center gap-3">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-mono font-medium transition-all shadow-sm cursor-pointer border border-slate-800"
            title="Mở Terminal Logs Hệ Thống"
          >
            <TerminalIcon className="w-4 h-4 text-emerald-400" />
            <span>Nhật Ký Terminal</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        )}

        {/* Primary Blue Button: Tải tài liệu mới */}
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span>Tải tài liệu mới</span>
          </button>
        )}
      </div>
    </header>
  );
};
