'use client';

import React from 'react';
import { CheckCircle, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-5 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="FinLegal AI Logo"
            className="h-9 w-auto object-contain rounded-lg shadow-2xs"
            onError={(e) => {
              // Fallback to icon.png if logo.png is missing or fails
              (e.currentTarget as HTMLImageElement).src = '/icon.png';
            }}
          />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
            FinLegal AI
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
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
