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
    <div className="flex flex-col h-full rounded-xl bg-white border border-slate-200 overflow-hidden">
      {/* Top Bar */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
              Trợ Lý FinLegal AI
              <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Enterprise Engine
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 hidden sm:block">Phân Tích Hợp Đồng & Tra Cứu Ngữ Cảnh Chuyên Sâu</p>
          </div>
        </div>

        {/* Selected Document Filter Scope Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shrink-0">
          <Filter className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className="truncate max-w-[120px] sm:max-w-[220px]">
            {selectedDocName ? `Tài liệu: ${selectedDocName}` : 'Tất cả tài liệu'}
          </span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
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
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[90%] sm:max-w-2xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200 shadow-xs'
                  }`}
                >
                  {/* Thought Process Accordion */}
                  {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                    <ThoughtProcess thoughts={msg.thoughtProcess} isStreaming={msg.isStreaming} />
                  )}

                  {/* Audit Card Component */}
                  {msg.auditReport && (
                    <AuditCard report={msg.auditReport} />
                  )}

                  {/* Response Content */}
                  {msg.content ? (
                    <div className="space-y-3">
                      <div className={`prose prose-xs max-w-none prose-p:leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'prose-invert text-white prose-p:text-white prose-headings:text-white font-medium' 
                          : 'prose-slate text-slate-800'
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Verified Source Citations Cards */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-slate-700" />
                            <span>Căn cứ trích dẫn đã xác minh ({msg.sources.length}):</span>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 flex items-center gap-1.5"
                              >
                                <span>{src.displayLabel}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    msg.isStreaming && (
                      <div className="flex items-center gap-2 text-slate-500 py-1 font-mono text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                        <span>Đang tra cứu vector & tổng hợp câu trả lời...</span>
                      </div>
                    )
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block px-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white space-y-2">
        <div className="flex items-center gap-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl p-2 border border-slate-200 transition-all">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={selectedDocName ? `Đặt câu hỏi cho file "${selectedDocName}"...` : 'Đặt câu hỏi tra cứu hợp đồng / quy định / báo cáo...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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
