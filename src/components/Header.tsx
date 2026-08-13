'use client';

import React from 'react';
import { CheckCircle, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-5 flex items-center justify-between shrink-0 shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md border border-blue-400/20 font-extrabold text-sm">
          FL
        </div>
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2 tracking-tight">
            FinLegal AI
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Trợ Lý Doanh Nghiệp
            </span>
          </h1>
          <p className="text-[11px] text-slate-400">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
        </div>
      </div>

      {/* Top Status & Admin Tracing Button */}
      <div className="flex items-center gap-2.5">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 text-slate-200 hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="Xem lịch sử suy luận & tra cứu"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Nhật Ký Suy Luận</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hệ Thống Sẵn Sàng</span>
        </div>
      </div>
    </header>
  );
};
