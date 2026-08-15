'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, FileText, Cpu, Database, Layers } from 'lucide-react';

interface IngestionTerminalCardProps {
  fileName: string;
  status: string;
  totalPages?: number;
  totalChunks?: number;
  logs: string[];
}

export const IngestionTerminalCard: React.FC<IngestionTerminalCardProps> = ({
  fileName,
  status,
  totalPages = 1,
  totalChunks = 0,
  logs
}) => {
  const getProgressPercentage = (st: string) => {
    switch (st) {
      case 'UPLOADED': return 15;
      case 'PARSING': return 35;
      case 'CHUNKING': return 60;
      case 'EMBEDDING': return 80;
      case 'INDEXING': return 92;
      case 'READY': return 100;
      case 'FAILED': return 100;
      default: return 10;
    }
  };

  const pct = getProgressPercentage(status);

  return (
    <div className="mb-4 rounded-xl border border-slate-800 bg-[#090d16] p-3 text-slate-100 font-mono text-xs shadow-md">
      {/* Title Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
        <div className="flex items-center gap-2 truncate">
          <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-slate-200 truncate">{fileName}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {status === 'READY' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> READY
            </span>
          ) : status === 'FAILED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-400 border border-rose-800 font-semibold">
              <AlertCircle className="w-3 h-3" /> FAILED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-950 text-blue-300 border border-blue-800 font-semibold">
              <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> {status}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mb-2.5 border border-slate-800">
        <div 
          className={`h-full transition-all duration-500 rounded-full ${
            status === 'READY' ? 'bg-emerald-500' : status === 'FAILED' ? 'bg-rose-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] text-slate-400">
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
          <FileText className="w-3 h-3 text-purple-400" />
          <span>Trang: <strong className="text-slate-200">{totalPages}</strong></span>
        </div>
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-blue-400" />
          <span>Chunks: <strong className="text-slate-200">{totalChunks || '--'}</strong></span>
        </div>
        <div className="p-1.5 rounded bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>Embed: <strong className="text-slate-200">768-dim</strong></span>
        </div>
      </div>

      {/* Live Terminal Log Output */}
      <div className="p-2 rounded bg-[#050810] border border-slate-800/80 max-h-24 overflow-y-auto space-y-1 text-[10.5px]">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-slate-300">
            <span className="text-cyan-500 select-none">$</span>
            <span className="flex-1 break-words">{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
