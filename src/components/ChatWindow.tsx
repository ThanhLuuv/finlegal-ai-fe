'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ThoughtProcess } from './ThoughtProcess';
import { AuditCard } from './AuditCard';
import { Send, Bot, User, Loader2, Filter, FileText } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (prompt: string) => void;
  selectedDocId?: string;
  selectedDocName?: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isStreaming,
  onSendMessage,
  selectedDocId,
  selectedDocName
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
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
    <div className="flex flex-col h-full rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* Top Bar */}
      <div className="px-5 py-3.5 bg-white flex items-center justify-between gap-2 shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
              Trợ Lý FinLegal AI
              <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                Enterprise Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">Phân Tích Hợp Đồng & Tra Cứu Ngữ Cảnh Chuyên Sâu</p>
          </div>
        </div>

        {/* Selected Document Filter Scope Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-[220px]">
            {selectedDocName ? `Tài liệu: ${selectedDocName}` : 'Tất cả tài liệu'}
          </span>
        </div>
      </div>

      {/* Message Feed - Minimal Borderless Text Layout */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
                FinLegal AI - Trợ Lý Doanh Nghiệp & Hợp Đồng
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tự động đọc hiểu văn bản, tra cứu nguồn chính xác và hỗ trợ đối soát dữ liệu kinh doanh với độ tin cậy tuyệt đối.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              {msg.sender === 'user' ? (
                /* User Message: Simple Text, No Box Div, Color Text */
                <div className="flex flex-col items-end gap-1 pl-12">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600">
                    <span>Bạn</span>
                    <User className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-sm font-semibold text-slate-900 max-w-2xl text-right leading-relaxed">
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ) : (
                /* Assistant Message: Simple Text, No Box Div */
                <div className="flex gap-3 items-start max-w-3xl pr-4">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-3 min-w-0 text-xs leading-relaxed text-slate-800">
                    {/* Thought Process Accordion */}
                    {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                      <ThoughtProcess thoughts={msg.thoughtProcess} isStreaming={msg.isStreaming} />
                    )}

                    {/* Audit Card Component */}
                    {msg.auditReport && (
                      <AuditCard report={msg.auditReport} />
                    )}

                    {/* Clean Markdown Answer Text (No Boxed Div) */}
                    {msg.content ? (
                      <div className="prose prose-xs max-w-none text-slate-800 prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-strong:text-slate-900 prose-code:text-blue-700">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.isStreaming && (
                        <div className="flex items-center gap-2 text-slate-500 py-1 font-mono text-xs">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span>Đang tra cứu vector & tổng hợp câu trả lời...</span>
                        </div>
                      )
                    )}

                    {/* Verified Source Citation Pills */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Căn cứ:</span>
                        </span>
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-[10px]"
                          >
                            {src.displayLabel}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 bg-white space-y-2 shadow-2xs">
        <div className="flex items-center gap-2 bg-slate-100/80 focus-within:bg-white focus-within:shadow-xs rounded-2xl p-2 transition-all">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={selectedDocName ? `Đặt câu hỏi cho file "${selectedDocName}"...` : 'Đặt câu hỏi tra cứu hợp đồng / quy định / báo cáo...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Gửi</span>
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="hidden sm:flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>FinLegal Enterprise RAG Engine • Sẵn sàng</span>
          </div>
          <span>Bảo mật dữ liệu • Trích dẫn căn cứ thực tế</span>
        </div>
      </form>
    </div>
  );
};
