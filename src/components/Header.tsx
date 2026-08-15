'use client';

import React from 'react';
import { Upload, Activity, ShieldCheck, FolderOpen } from 'lucide-react';

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
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
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
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
            <span className="text-white font-black text-sm">FL</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              Lexifin
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200/60">
                Enterprise RAG
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">Phân Tích Hợp Đồng & Tra Cứu Ngữ Cảnh Chuyên Sâu</p>
          </div>
        </div>
      </div>

      {/* Action Controls - Matching Template Image Right Button */}
      <div className="flex items-center gap-3">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            title="Xem lịch sử suy luận & quan sát hệ thống"
          >
            <Activity className="w-3.5 h-3.5 text-slate-600" />
            <span>Nhật Ký AI</span>
          </button>
        )}

        {/* Primary Blue Button: Tải tài liệu mới */}
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span>Tải tài liệu mới</span>
          </button>
        )}
      </div>
    </header>
  );
};
