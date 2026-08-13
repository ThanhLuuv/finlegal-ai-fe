'use client';

import React from 'react';
import { CheckCircle, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-md px-5 flex items-center justify-between shrink-0 shadow-2xs z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="LexiFin AI Logo"
            className="h-9 w-auto object-contain rounded-lg shadow-2xs"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/icon.png';
            }}
          />
        </div>
        <div>
          <h1 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 tracking-tight">
            LexiFin AI
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#0f172a] border border-slate-300/80">
              Trợ Lý Doanh Nghiệp
            </span>
          </h1>
          <p className="text-[11px] text-slate-500">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
        </div>
      </div>

      {/* Top Status & Admin Tracing Button */}
      <div className="flex items-center gap-2.5">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-[#0f172a] text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            title="Xem lịch sử suy luận & tra cứu"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nhật Ký Suy Luận</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hệ Thống Sẵn Sàng</span>
        </div>
      </div>
    </header>
  );
};
