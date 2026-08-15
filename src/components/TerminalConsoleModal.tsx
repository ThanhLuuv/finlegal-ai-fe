'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SystemLog, LogCategory } from '../types';
import { X, Terminal as TerminalIcon, Trash2, Copy, Check, Filter, Play, Cpu, ShieldCheck } from 'lucide-react';

interface TerminalConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: SystemLog[];
  onClearLogs: () => void;
}

export const TerminalConsoleModal: React.FC<TerminalConsoleModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(l => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'INGESTION') return l.category === 'INGESTION';
    if (selectedTab === 'VECTOR') return l.category === 'VECTORIZE' || l.category === 'D1_SQL' || l.category === 'RERANK';
    if (selectedTab === 'LLM') return l.category === 'DEEPSEEK' || l.category === 'SYSTEM';
    return true;
  });

  const getCategoryBadge = (category: LogCategory) => {
    switch (category) {
      case 'INGESTION':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/80';
      case 'VECTORIZE':
        return 'bg-blue-950/80 text-blue-400 border-blue-800/80';
      case 'D1_SQL':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80';
      case 'RERANK':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/80';
      case 'DEEPSEEK':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SUCCESS': return 'text-emerald-400';
      case 'ERROR': return 'text-rose-400';
      case 'WARN': return 'text-amber-400';
      case 'EXEC': return 'text-cyan-400';
      default: return 'text-slate-300';
    }
  };

  const handleCopyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] [${l.category}] [${l.level}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-5xl h-[85vh] max-h-[750px] bg-[#090d16] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-xs">
        
        {/* Top Retro macOS Terminal Bar */}
        <div className="h-11 px-4 bg-[#0d1322] border-b border-slate-800/80 flex items-center justify-between shrink-0 select-none">
          <div className="flex items-center gap-3">
            {/* macOS Dot Buttons */}
            <div className="flex items-center gap-1.5">
              <button onClick={onClose} className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <div className="flex items-center gap-2 text-slate-300 font-semibold tracking-wide text-xs">
              <TerminalIcon className="w-4 h-4 text-cyan-400" />
              <span>FinLegal Developer Console v4.0</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-normal">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE STREAM
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
            </button>

            <button
              onClick={onClearLogs}
              className="px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-rose-300 hover:text-rose-200 flex items-center gap-1.5 text-[11px] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Logs</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="h-10 px-4 bg-[#0b101d] border-b border-slate-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: `Tất cả (${logs.length})`, icon: Filter },
              { id: 'INGESTION', label: 'Nạp & Bóc Tách File', icon: Play },
              { id: 'VECTOR', label: 'Vectorize & D1 SQL', icon: Cpu },
              { id: 'LLM', label: 'DeepSeek-v4 & Auditor', icon: ShieldCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const active = selectedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    active 
                      ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={autoScroll} 
              onChange={e => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-0" 
            />
            Tự động cuộn
          </label>
        </div>

        {/* Terminal Log Console Screen */}
        <div 
          ref={logContainerRef} 
          className="flex-1 p-4 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800 bg-[#070b13] font-mono leading-relaxed"
        >
          {filteredLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
              <TerminalIcon className="w-8 h-8 mb-2 text-slate-700" />
              <span>Chưa có dữ liệu nhật ký hệ thống. Hãy tải file hoặc đặt câu hỏi để xem tiến trình live!</span>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/60 p-1 rounded transition-colors group">
                <span className="text-slate-500 shrink-0 text-[10px] pt-0.5 select-none font-mono">
                  [{log.timestamp}]
                </span>

                <span className={`px-1.5 py-0.5 rounded border text-[9px] font-semibold shrink-0 select-none ${getCategoryBadge(log.category)}`}>
                  {log.category}
                </span>

                <span className={`flex-1 break-words text-[11.5px] ${getLevelColor(log.level)}`}>
                  <span className="text-slate-600 select-none mr-1.5">$</span>
                  {log.message}
                </span>

                {log.details && (
                  <details className="w-full mt-1 pl-12 text-[10px] text-slate-400">
                    <summary className="cursor-pointer text-slate-500 hover:text-slate-300">Xem chi tiết JSON</summary>
                    <pre className="mt-1 p-2 rounded bg-slate-950 text-slate-300 border border-slate-800 overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>

        {/* Console Footer Info Bar */}
        <div className="h-7 px-4 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between shrink-0 text-[10px] text-slate-500">
          <div className="flex items-center gap-4">
            <span>RAG Engine: <strong className="text-slate-300">v4.0 Enterprise</strong></span>
            <span>LLM: <strong className="text-cyan-400">DeepSeek-v4-Flash</strong></span>
            <span>Vector Index: <strong className="text-blue-400">Cloudflare Vectorize (768-dim)</strong></span>
          </div>
          <span>Tổng số logs: {filteredLogs.length}</span>
        </div>

      </div>
    </div>
  );
};
