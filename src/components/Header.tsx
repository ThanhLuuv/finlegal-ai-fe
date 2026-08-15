'use client';

import React from 'react';
import { Upload, Terminal as TerminalIcon, FolderOpen, Scale, Cpu } from 'lucide-react';

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
    <header className="h-16 bg-[#090d18] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20 shadow-lg shadow-black/40">
      <div className="flex items-center gap-3">
        {/* Mobile Drawer Toggle Button */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-colors cursor-pointer border border-slate-700"
            title="Mở Kho Tài Liệu"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-3">
          {/* Neon Glow Terminal Logo Badge */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2 tracking-tight font-mono">
              Lexifin <span className="text-cyan-400 font-normal">Console</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/80 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DEEPSEEK-V4
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">Developer RAG System & Real-Time Engine Trace</p>
          </div>
        </div>
      </div>

      {/* Action Controls - Top Right Button */}
      <div className="flex items-center gap-3">
        {onOpenLogs && (
          <button
            onClick={onOpenLogs}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e1628] hover:bg-[#131d35] text-slate-200 text-xs font-mono font-medium transition-all border border-slate-700/80 hover:border-cyan-500/50 cursor-pointer shadow-sm"
            title="Mở Developer Terminal Console"
          >
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span>Nhật Ký AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
        )}

        {/* Primary Cyan/Blue Button: Tải tài liệu mới */}
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-cyan-600/20 cursor-pointer active:scale-98"
          >
            <Upload className="w-4 h-4" />
            <span className="font-mono">Tải tài liệu mới</span>
          </button>
        )}
      </div>
    </header>
  );
};
