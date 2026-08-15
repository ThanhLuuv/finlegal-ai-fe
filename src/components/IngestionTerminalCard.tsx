'use client';

import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Terminal as TerminalIcon, Cpu, Layers } from 'lucide-react';

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

  // Generate ASCII progress bar like Linux terminal [==========>          ]
  const totalChars = 20;
  const filledChars = Math.round((pct / 100) * totalChars);
  const asciiBar = `[${'='.repeat(Math.max(0, filledChars - 1))}${filledChars > 0 ? '>' : ''}${' '.repeat(Math.max(0, totalChars - filledChars))}] ${pct}%`;

  return (
    <div className="mb-4 rounded-xl border border-slate-800 bg-[#070b14] p-3.5 text-emerald-400 font-mono text-xs shadow-2xl">
      {/* Linux Terminal Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 ml-1 font-semibold">root@lexifin-engine:~/ingestion#</span>
        </div>

        <div className="flex items-center gap-1.5">
          {status === 'READY' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
              <CheckCircle2 className="w-3 h-3" /> SUCCESS
            </span>
          ) : status === 'FAILED' ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] bg-rose-950 text-rose-400 border border-rose-800 font-bold">
              <AlertCircle className="w-3 h-3" /> FAILED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] bg-blue-950 text-blue-300 border border-blue-800 font-bold">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" /> {status}...
            </span>
          )}
        </div>
      </div>

      {/* Target File Command */}
      <div className="text-[11px] text-slate-300 mb-2 truncate">
        <span className="text-cyan-400 font-bold">$ ./ingest_file --target </span>
        <span className="text-amber-300 font-bold">"{fileName}"</span>
      </div>

      {/* ASCII Terminal Progress Bar */}
      <div className="p-1.5 rounded bg-[#03050a] border border-slate-800 text-[10.5px] font-mono text-cyan-400 mb-2 text-center tracking-wider">
        {asciiBar}
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-3 gap-1.5 mb-2 text-[10px] text-slate-400">
        <div className="p-1 rounded bg-[#03050a] border border-slate-800 text-center">
          Pages: <span className="text-emerald-400 font-bold">{totalPages}</span>
        </div>
        <div className="p-1 rounded bg-[#03050a] border border-slate-800 text-center">
          Chunks: <span className="text-cyan-400 font-bold">{totalChunks || '--'}</span>
        </div>
        <div className="p-1 rounded bg-[#03050a] border border-slate-800 text-center">
          Vector: <span className="text-purple-400 font-bold">768-dim</span>
        </div>
      </div>

      {/* Terminal Output Logs */}
      <div className="p-2 rounded bg-[#03050a] border border-slate-800/90 max-h-28 overflow-y-auto space-y-1 text-[10.5px]">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start gap-1.5 text-slate-200">
            <span className="text-emerald-500 font-bold select-none">&gt;</span>
            <span className="flex-1 break-words leading-tight">{log}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
