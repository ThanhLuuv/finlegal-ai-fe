'use client';

import React from 'react';
import { Activity, FolderOpen, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs, onToggleMobileSidebar }) => {
  return (
    <header className="h-16 bg-white shadow-xs px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
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
          <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-base shadow-2xs shrink-0">
            <img
              src="/logo.png"
              alt="FinLegal AI Logo"
              className="h-8 w-8 object-contain rounded-lg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="hidden group-has-[:hidden]:inline">FL</span>
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 tracking-tight">
              FinLegal AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Enterprise RAG
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 hidden sm:block">Phân Tích Hợp Đồng & Đối Soát Số Liệu Doanh Nghiệp</p>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium transition-all cursor-pointer"
            title="Xem lịch sử suy luận & quan sát hệ thống"
          >
            <Activity className="w-3.5 h-3.5 text-slate-700" />
            <span className="hidden sm:inline">Nhật Ký AI</span>
            <span className="sm:hidden text-[11px]">Log</span>
          </button>
        )}

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="hidden sm:inline">Trực Tuyến</span>
          <span className="sm:hidden text-[11px]">Online</span>
        </div>
      </div>
    </header>
  );
};
