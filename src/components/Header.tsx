'use client';

import React from 'react';
import { CheckCircle, Activity, FolderOpen } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs, onToggleMobileSidebar }) => {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-3.5 sm:px-5 flex items-center justify-between shrink-0 shadow-2xs z-20">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile Sidebar Drawer Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-[#0f172a] hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
            title="Mở Kho Tài Liệu"
          >
            <FolderOpen className="w-4 h-4 text-[#0f172a]" />
          </button>
        )}

        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="LexiFin AI Logo"
            className="h-8 sm:h-9 w-auto object-contain rounded-lg shadow-2xs"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.png';
            }}
          />
        </div>
        <div>
          <h1 className="text-xs sm:text-sm font-bold text-[#0f172a] flex items-center gap-1.5 sm:gap-2 tracking-tight">
            LexiFin AI
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a]">
              Trợ Lý Doanh Nghiệp
            </span>
          </h1>
          <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
        </div>
      </div>

      {/* Top Status & Admin Tracing Button */}
      <div className="flex items-center gap-2">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-[#0f172a] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Xem lịch sử suy luận & tra cứu"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Nhật Ký Suy Luận</span>
            <span className="sm:hidden text-[11px]">Log</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Hệ Thống Sẵn Sàng</span>
          <span className="sm:hidden text-[11px]">Sẵn Sàng</span>
        </div>
      </div>
    </header>
  );
};
