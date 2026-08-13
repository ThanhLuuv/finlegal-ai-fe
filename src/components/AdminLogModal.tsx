'use client';

import React, { useEffect, useState } from 'react';
import { Activity, X, ChevronDown, ChevronUp, RefreshCw, Terminal, ShieldAlert } from 'lucide-react';
import { AgentThoughtStep } from '../types';

interface D1ChatLog {
  id: number;
  session_id: string;
  trace_id: string;
  user_prompt: string;
  intent: string;
  thought_process: string;
  final_response: string;
  risk_level: string;
  created_at: string;
}

interface AdminLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl?: string;
}

export const AdminLogModal: React.FC<AdminLogModalProps> = ({
  isOpen,
  onClose,
  backendUrl = 'https://finlegal-backend.lvthanh-work.workers.dev'
}) => {
  const [logs, setLogs] = useState<D1ChatLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/admin/logs`, {
        headers: {
          'x-admin-key': 'admin_secret_default'
        }
      });
      if (res.ok) {
        const data = await res.json() as { logs: D1ChatLog[] };
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.warn('Failed to fetch internal chat logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, backendUrl]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0f172a] text-white shadow-xs">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0f172a]">LexiFin AI - Nhật Ký Suy Luận & Tra Cứu AI</h2>
              <p className="text-xs text-slate-500">Giám sát chi tiết các bước xử lý và căn cứ trích dẫn của hệ thống</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer border border-slate-200"
              title="Làm mới nhật ký"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Log List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/60">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              Chưa có nhật ký suy luận nào được ghi nhận.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedId === log.id;
              let thoughts: AgentThoughtStep[] = [];
              try {
                thoughts = JSON.parse(log.thought_process || '[]');
              } catch {
                thoughts = [];
              }

              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden text-xs shadow-2xs hover:border-slate-300 transition-all"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-semibold shrink-0">
                        ID #{log.id}
                      </span>

                      <div className="truncate flex-1">
                        <p className="font-bold text-slate-900 truncate text-xs">{log.user_prompt}</p>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          Intent: {log.intent || 'RAG_QUERY'} • Session: {log.session_id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {log.risk_level === 'HIGH' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <ShieldAlert className="w-3 h-3 text-rose-600" /> High Risk
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Trace Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3 font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          User Prompt:
                        </span>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 font-sans">
                          {log.user_prompt}
                        </div>
                      </div>

                      {/* Detailed Agent Thought Steps */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Thought Process Trajectory ({thoughts.length} steps):
                        </span>
                        <div className="space-y-2">
                          {thoughts.map((step, sIdx) => (
                            <div key={sIdx} className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-[#0f172a] font-mono">[{step.agent}] {step.status}</span>
                                <span className="text-slate-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p className="text-slate-700 font-sans text-xs">{step.thought}</p>
                              {step.data !== undefined && step.data !== null && (
                                <pre className="p-2 rounded bg-slate-900 text-slate-100 text-[10px] overflow-x-auto max-h-32">
                                  {JSON.stringify(step.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Answer */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Final System Answer Output:
                        </span>
                        <div className="p-3 rounded-lg bg-white border border-slate-200 text-slate-800 font-sans leading-relaxed text-xs">
                          {log.final_response}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
