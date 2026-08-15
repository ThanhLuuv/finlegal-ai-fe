'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ThoughtProcess } from './ThoughtProcess';
import { AuditCard } from './AuditCard';
import { Send, Bot, Loader2, ChevronDown, Layers, FileText } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-white shadow-sm rounded-2xl p-5 relative overflow-hidden">
      {/* Workspace Section Header Title - Matching Template: Trò chuyện với tài liệu */}
      <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-3">Trò chuyện với tài liệu</h2>

      {/* Target Document Selector Dropdown - Matching Template: Đang chat với: [ Tất cả tài liệu ▼ ] */}
      <div className="relative mb-4 z-20">
        <div 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 flex items-center justify-between cursor-pointer hover:bg-slate-100/70 transition-all"
        >
          <div className="flex items-center gap-2 text-slate-700 min-w-0">
            <span className="text-slate-400 font-normal shrink-0">Đang chat với:</span>
            <div className="flex items-center gap-1.5 text-blue-600 font-semibold truncate">
              <Layers className="w-4 h-4 shrink-0 text-blue-600" />
              <span className="truncate">{selectedDocName || 'Tất cả tài liệu'}</span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </div>

        {/* Dropdown Options Menu */}
        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30 max-h-60 overflow-y-auto">
            <div
              onClick={() => {
                if (onSelectDoc) onSelectDoc(undefined);
                setIsDropdownOpen(false);
              }}
              className={`px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-blue-50/80 ${!selectedDocId ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Tất cả tài liệu</span>
            </div>
            {documentsList.map((doc) => (
              <div
                key={doc.doc_id}
                onClick={() => {
                  if (onSelectDoc) onSelectDoc(doc.doc_id);
                  setIsDropdownOpen(false);
                }}
                className={`px-4 py-2 text-sm flex items-center gap-2 cursor-pointer hover:bg-blue-50/80 truncate ${selectedDocId === doc.doc_id ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-slate-700'}`}
              >
                <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{doc.file_name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Feed - Matching Template Message Bubbles */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Trợ Lý Lexifin
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đặt câu hỏi để tra cứu thông tin hợp đồng, quy định nội bộ hoặc báo cáo tài chính của bạn.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col">
              {msg.sender === 'user' ? (
                /* User Message: Right Aligned Soft Blue Bubble */
                <div className="self-end max-w-[80%] flex flex-col items-end">
                  <div className="bg-[#eff6ff] text-slate-800 rounded-2xl rounded-tr-xs px-4 py-3 text-sm leading-relaxed border border-blue-100/60 shadow-2xs font-normal">
                    {msg.content}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 mr-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ) : (
                /* Assistant Message: Left Aligned White Bubble with AI Icon Avatar */
                <div className="self-start max-w-[85%] flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 text-sm text-slate-800 leading-relaxed shadow-2xs">
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
                        <div className="prose prose-xs max-w-none text-slate-800 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-strong:text-slate-900">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        msg.isStreaming && (
                          <div className="flex items-center gap-2 text-slate-500 py-1 font-mono text-xs">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span>Đang bóc tách và tổng hợp câu trả lời...</span>
                          </div>
                        )
                      )}

                      {/* Grounded Citation Sources */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Căn cứ:</span>
                          {msg.sources.map((src, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[10px]"
                            >
                              {src.displayLabel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] text-slate-400 mt-1 ml-1">
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

      {/* Bottom Input Box - Matching Template Input Box Layout */}
      <form onSubmit={handleSubmit} className="relative bg-white border border-slate-200 rounded-2xl p-3 shadow-xs">
        <textarea
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Nhập câu hỏi của bạn..."
          disabled={isStreaming}
          rows={2}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-normal"
        />

        <div className="flex items-center justify-end pt-2 border-t border-slate-100/60">
          {/* Send Blue Button */}
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>

      {/* Footer Disclaimer Note - Matching Template Footer */}
      <p className="text-center text-xs text-slate-400 mt-2 font-normal">
        AI có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
      </p>
    </div>
  );
};
