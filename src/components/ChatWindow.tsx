'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ThoughtProcess } from './ThoughtProcess';
import { AuditCard } from './AuditCard';
import { Send, Bot, Loader2, ChevronDown, Layers, FileText, Terminal as TerminalIcon } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (prompt: string) => void;
  selectedDocId?: string;
  selectedDocName?: string;
  documentsList?: Array<{ doc_id: string; file_name: string }>;
  onSelectDoc?: (docId: string | undefined) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  selectedDocId,
  selectedDocName,
  documentsList = [],
  onSelectDoc
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    onSendMessage(inputPrompt);
    setInputPrompt('');
  };

  return (
    <div className="flex flex-col h-full bg-[#090d18] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-blue-950/20 border border-slate-800/80 relative font-mono text-slate-100">
      {/* Workspace Section Header Title */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span>Lexifin Terminal Console // Trò chuyện tài liệu</span>
        </h2>
      </div>

      {/* Target Document Selector Dropdown */}
      <div className="relative mb-3 z-20">
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-[#050810] border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-all"
        >
          <div className="flex items-center gap-2 text-slate-300 min-w-0">
            <span className="text-slate-500 font-normal shrink-0 select-none">Target Scope:</span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold truncate">
              <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
              <span className="truncate">{selectedDocName || 'Tất cả tài liệu'}</span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Options Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#090d18] border border-slate-800 rounded-xl shadow-2xl py-1 z-30 max-h-60 overflow-y-auto font-mono text-xs">
            <div
              onClick={() => {
                if (onSelectDoc) onSelectDoc(undefined);
                setIsDropdownOpen(false);
              }}
              className={`px-3.5 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-800/80 ${!selectedDocId ? 'font-bold text-cyan-400 bg-blue-950/50' : 'text-slate-300'}`}
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Tất cả tài liệu</span>
            </div>
            {documentsList.map((doc) => (
              <div
                key={doc.doc_id}
                onClick={() => {
                  if (onSelectDoc) onSelectDoc(doc.doc_id);
                  setIsDropdownOpen(false);
                }}
                className={`px-3.5 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-800/80 truncate ${selectedDocId === doc.doc_id ? 'font-bold text-cyan-400 bg-blue-950/50' : 'text-slate-300'}`}
              >
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{doc.file_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 mb-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-3 font-mono">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-950/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-1">
                Trợ Lý Lexifin RAG Console
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Đặt câu hỏi để tra cứu thông tin hợp đồng, quy định nội bộ hoặc báo cáo tài chính của bạn. Tiến trình suy luận và truy vấn Vector sẽ hiển thị theo thời gian thực!
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              {msg.sender === 'user' ? (
                /* User Message: Dark Blue Terminal Pill */
                <div className="self-end max-w-[85%] flex flex-col items-end">
                  <div className="bg-blue-950/70 text-blue-100 rounded-2xl rounded-tr-xs px-4 py-3 text-xs leading-relaxed border border-blue-700/60 shadow-md font-mono flex items-start gap-2">
                    <span className="text-cyan-400 font-bold select-none">$</span>
                    <span className="flex-1 font-sans">{msg.content}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 mr-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ) : (
                /* Assistant Message: Left Aligned Dark Card with AI Icon Avatar */
                <div className="self-start max-w-[90%] flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-md shadow-cyan-950/40">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="bg-[#070b14] border border-slate-800/90 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-200 leading-relaxed shadow-xl">
                      {/* Thought Process Accordion */}
                      {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                        <ThoughtProcess thoughts={msg.thoughtProcess} isStreaming={msg.isStreaming} />
                      )}

                      {/* Audit Card Component */}
                      {msg.auditReport && (
                        <AuditCard report={msg.auditReport} />
                      )}

                      {/* Markdown Answer Text */}
                      {msg.content ? (
                        <div className="prose prose-invert prose-xs max-w-none text-slate-200 font-sans prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-100 prose-strong:text-cyan-300">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.isStreaming && (
                          <div className="flex items-center gap-2 text-cyan-400 py-1 font-mono text-xs">
                            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                            <span>Đang bóc tách và tổng hợp câu trả lời...</span>
                          </div>
                        )
                      )}

                      {/* Grounded Citation Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
                          <span className="font-semibold text-slate-500 text-[10px] uppercase tracking-wider select-none">Căn cứ:</span>
                          {msg.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700 font-medium text-[10px]"
                            >
                              {src.displayLabel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 mt-1 ml-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Box - Compact Terminal Input Bar */}
      <form onSubmit={handleSubmit} className="bg-[#050810] hover:bg-[#070c18] border border-slate-800 rounded-2xl p-2 pl-3.5 flex items-center gap-2 focus-within:border-cyan-500/60 focus-within:ring-1 focus-within:ring-cyan-500/30 transition-all shadow-inner">
        <span className="text-cyan-400 font-bold select-none text-sm">$</span>
        <textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Nhập câu hỏi tra cứu tài liệu..."
          disabled={isStreaming}
          rows={1}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-1.5 font-sans font-normal max-h-20"
        />

        <button
          type="submit"
          disabled={!inputPrompt.trim() || isStreaming}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-cyan-950/40 shrink-0 transition-all cursor-pointer active:scale-95"
        >
          {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>

      {/* Footer Disclaimer Note */}
      <p className="text-center text-[10.5px] text-slate-500 mt-2 font-mono">
        Lexifin Engine v4.0 • DeepSeek-v4-Flash Grounding Verify
      </p>
    </div>
  );
};
