'use client';

import React, { useState } from 'react';
import { AgentThoughtStep } from '../types';
import { ChevronDown, ChevronRight, Cpu, Database, Search, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface ThoughtProcessProps {
  thoughts: AgentThoughtStep[];
  isStreaming?: boolean;
}

export const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts, isStreaming }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!thoughts || thoughts.length === 0) return null;

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case 'SUPERVISOR':
        return { label: 'Bộ Điều Phối Yêu Cầu', icon: Cpu, color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'RAG_AGENT':
        return { label: 'Tra Cứu Văn Bản (PDF)', icon: Search, color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'SQL_AGENT':
        return { label: 'Truy Vấn Dữ Liệu Bán Hàng', icon: Database, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'AUDITOR':
        return { label: 'Chuyên Viên Kiểm Toán', icon: ShieldCheck, color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { label: agent, icon: Cpu, color: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden text-xs">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2 flex items-center justify-between bg-slate-100 hover:bg-slate-200/60 transition-colors text-slate-800 font-medium"
      >
        <div className="flex items-center gap-2">
          {isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>Retrieval Trace & Processing Steps ({thoughts.length} bước)</span>

        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {isOpen && (
        <div className="p-3 space-y-2 bg-white border-t border-slate-200">
          {thoughts.map((t, idx) => {
            const agentMeta = getAgentBadge(t.agent);
            const Icon = agentMeta.icon;
            return (
              <div key={idx} className="flex flex-col gap-1 p-2.5 rounded-md bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold ${agentMeta.color}`}>
                    <Icon className="w-3 h-3" />
                    {agentMeta.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px] pl-0.5">
                  {t.thought}
                </p>
                {t.data !== undefined && t.data !== null && (
                  <pre className="mt-1 p-2 rounded bg-slate-900 text-[10px] text-slate-100 font-mono overflow-x-auto max-h-32">
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
