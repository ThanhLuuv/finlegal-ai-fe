'use client';

import React, { useState } from 'react';
import { AgentThoughtStep } from '../types';
import { ChevronDown, ChevronRight, Terminal, Cpu, Database, Search, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';

interface ThoughtProcessProps {
  thoughts: AgentThoughtStep[];
  isStreaming?: boolean;
}

export const ThoughtProcess: React.FC<ThoughtProcessProps> = ({ thoughts, isStreaming }) => {
  // Expanded by default so live CLI execution traces are immediately visible
  const [isOpen, setIsOpen] = useState(true);

  if (!thoughts || thoughts.length === 0) return null;

  const getCliCommand = (t: AgentThoughtStep) => {
    switch (t.agent) {
      case 'SUPERVISOR':
        return {
          cmd: `$ lexifin-supervisor route --intent RAG_ONLY`,
          badge: 'SUPERVISOR',
          badgeClass: 'bg-purple-950/80 text-purple-400 border-purple-800'
        };
      case 'RAG_AGENT':
        return {
          cmd: `$ cloudflare-vectorize query --dense_top_k=25 --sparse_top_k=20`,
          badge: 'HYBRID_RETRIEVAL',
          badgeClass: 'bg-blue-950/80 text-blue-400 border-blue-800'
        };
      case 'SQL_AGENT':
        return {
          cmd: `$ cloudflare-d1 query --sql "SELECT * FROM sales_transactions"`,
          badge: 'D1_SQL_ENGINE',
          badgeClass: 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
        };
      case 'AUDITOR':
        return {
          cmd: `$ bge-reranker --top_k=4 && citation-auditor verify --grounding=100%`,
          badge: 'GROUNDING_AUDITOR',
          badgeClass: 'bg-amber-950/80 text-amber-400 border-amber-800'
        };
      default:
        return {
          cmd: `$ agent-engine exec --agent ${t.agent}`,
          badge: t.agent,
          badgeClass: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  return (
    <div className="mb-3 rounded-xl border border-slate-800 bg-[#080c14] overflow-hidden text-xs shadow-md font-mono">
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 flex items-center justify-between bg-[#0b101c] hover:bg-[#0e1526] transition-colors text-slate-300 font-medium cursor-pointer"
      >
        <div className="flex items-center gap-2 text-xs">
          {isStreaming ? (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          ) : (
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          )}
          <span className="font-semibold text-slate-200">System Terminal Trace ({thoughts.length} steps)</span>
        </div>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {/* Expanded Terminal Log Entries */}
      {isOpen && (
        <div className="p-2.5 space-y-2 bg-[#050810] border-t border-slate-800">
          {thoughts.map((t, idx) => {
            const cli = getCliCommand(t);
            return (
              <div key={idx} className="flex flex-col gap-1 p-2 rounded bg-[#090d18] border border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[9.5px] font-semibold ${cli.badgeClass}`}>
                    {cli.badge}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(t.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="text-[11px] text-cyan-400 font-bold tracking-tight mt-0.5">
                  {cli.cmd}
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px] font-sans pt-0.5">
                  {t.thought}
                </p>

                {t.data !== undefined && t.data !== null && (
                  <pre className="mt-1 p-2 rounded bg-[#020408] text-[10px] text-slate-300 font-mono overflow-x-auto max-h-32 max-w-full whitespace-pre-wrap break-all border border-slate-800">
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
