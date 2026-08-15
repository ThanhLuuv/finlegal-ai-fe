'use client';

import React, { useState } from 'react';
import { AgentThoughtStep } from '../types';
import { ChevronDown, ChevronRight, Cpu, Database, Search, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface ThoughtProcessProps {
  thoughts: AgentThoughtStep[];
  isStreaming?: boolean;
}

export const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts, isStreaming }) => {
  // Collapsed by default so answer text takes center stage
  const [isOpen, setIsOpen] = useState(false);

  if (!thoughts || thoughts.length === 0) return null;

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case 'SUPERVISOR':
        return { label: 'Bộ Điều Phối Yêu Cầu', icon: Cpu, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'RAG_AGENT':
        return { label: 'Tra Cứu Văn Bản (PDF)', icon: Search, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'SQL_AGENT':
        return { label: 'Truy Vấn Dữ Liệu D1', icon: Database, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'AUDITOR':
        return { label: 'Chuyên Viên Kiểm Toán', icon: ShieldCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { label: agent, icon: Cpu, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="mb-3 rounded-xl border border-slate-200/80 bg-slate-50/80 overflow-hidden text-xs shadow-2xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between bg-slate-100/70 hover:bg-slate-200/60 transition-colors text-slate-700 font-medium cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs">
          {isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span className="font-semibold text-slate-700">Tiến trình tra cứu & suy luận ({thoughts.length} bước)</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-2.5 space-y-2 bg-white border-t border-slate-200/80">
          {thoughts.map((t, idx) => {
            const agentMeta = getAgentBadge(t.agent);
            const Icon = agentMeta.icon;
            return (
              <div key={idx} className="flex flex-col gap-1 p-2 rounded-lg bg-slate-50/90 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold ${agentMeta.color}`}>
                    <Icon className="w-3 h-3" />
                    {agentMeta.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px] pl-0.5 break-words font-normal">
                  {t.thought}
                </p>
                {t.data !== undefined && t.data !== null && (
                  <pre className="mt-1 p-2 rounded bg-slate-900 text-[10px] text-slate-100 font-mono overflow-x-auto max-h-32 max-w-full whitespace-pre-wrap break-all">
                    {JSON.stringify(t.data, null, 2)}
                  </pre>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
