'use client';

import React from 'react';
import { CheckCircle, Activity } from 'lucide-react';

interface HeaderProps {
  onOpenLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogs }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-[#0B1727] px-6 flex items-center justify-between shrink-0 shadow-sm">
      <div className="flex items-center gap-3.5">
        <img 
          src="/logo.png" 
          alt="FinLegal AI Logo" 
          className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
        />
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2.5 tracking-tight">
            FinLegal AI
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700">
              Trợ lý Thông minh
            </span>
          </h1>
          <p className="text-xs text-slate-300">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
        </div>
      </div>

      {/* Top Status & Admin Tracing Button */}
      <div className="flex items-center gap-3">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-medium transition-all cursor-pointer shadow-sm"
            title="Xem nhật ký vết suy luận AI từ D1 Database"
          >
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Tracing Logs D1</span>
          </button>
        )}

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Hệ thống: Đã Xác Thực Cloudflare</span>
        </div>
      </div>
    </header>
  );
};
