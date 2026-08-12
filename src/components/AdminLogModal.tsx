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
      const res = await fetch(`${backendUrl}/api/admin/logs`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#0B1727] text-white">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hệ Thống Tracing Logs AI Doanh Nghiệp</h2>
              <p className="text-xs text-slate-500">Giám sát vết suy luận Multi-Agent & nhật ký đối soát từ D1 Database</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              title="Làm mới nhật ký"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Log List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Chưa có nhật ký suy luận nào được ghi nhận.
            </div>
          ) : (
            logs.map(log => {
              const isExpanded = expandedId === log.id;
              let thoughts: AgentThoughtStep[] = [];
              try {
                thoughts = JSON.parse(log.thought_process || '[]');
              } catch {
                // ignore json parse error
              }

              const isHighRisk = log.risk_level === 'HIGH';
              const isMediumRisk = log.risk_level === 'MEDIUM';

              return (
                <div
                  key={log.id}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs transition-all hover:border-slate-300"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate pr-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase shrink-0 ${
                        log.intent === 'HYBRID_AUDIT' ? 'bg-amber-100 text-amber-800' :
                        log.intent === 'RAG_ONLY' ? 'bg-sky-100 text-sky-800' :
                        log.intent === 'SQL_ONLY' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.intent || 'RAG_ONLY'}
                      </span>

                      {log.risk_level && log.risk_level !== 'NONE' && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0 ${
                          isHighRisk ? 'bg-rose-100 text-rose-700' :
                          isMediumRisk ? 'bg-amber-100 text-amber-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          <ShieldAlert className="w-3 h-3" />
                          {log.risk_level} RISK
                        </span>
                      )}

                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {log.user_prompt}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                        <div><strong className="text-slate-900">Trace ID:</strong> {log.trace_id}</div>
                        <div><strong className="text-slate-900">Session ID:</strong> {log.session_id}</div>
                      </div>

                      {/* Agent Thought Steps */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                          <Terminal className="w-3.5 h-3.5 text-[#0B1727]" />
                          <span>Vết Suy Luận Multi-Agent ({thoughts.length} bước)</span>
                        </h4>
                        <div className="space-y-2">
                          {thoughts.map((step, idx) => (
                            <div key={idx} className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px]">
                              <div className="text-sky-400 font-bold mb-1">[{step.agent}]</div>
                              <div className="text-slate-300">{String(step.thought)}</div>
                              {Boolean(step.data) && (
                                <pre className="mt-2 p-2 rounded bg-slate-950 text-emerald-400 text-[10px] overflow-x-auto">
                                  {JSON.stringify(step.data, null, 2)}
                                </pre>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Final Answer */}
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1">Phản Hồi Cuối Cùng</h4>
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed">
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
