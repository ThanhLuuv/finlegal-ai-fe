'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ThoughtProcess } from './ThoughtProcess';
import { AuditCard } from './AuditCard';
import { Send, Bot, User, Loader2, Sparkles, Filter, FileText } from 'lucide-react';

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

  const quickPrompts = [
    'Bên A được hủy hợp đồng lúc nào?',
    'Điều kiện đơn phương chấm dứt hợp đồng là gì?',
    'Thời hạn và nghĩa vụ thanh toán trong hợp đồng',
    'Các điều khoản về phạt vi phạm hợp đồng'
  ];

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

  const handleQuickPromptClick = (prompt: string) => {
    if (isStreaming) return;
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shadow-2xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              Trợ Lý LexiFin AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-[#0f172a]">
                Trợ Lý Chuyên Gia
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">Hỏi đáp & Tra cứu Hợp đồng theo ngữ cảnh</p>
          </div>
        </div>

        {/* Selected Document Filter Scope Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
          <Filter className="w-3.5 h-3.5 text-[#0f172a]" />
          <span className="truncate max-w-[200px]">
            {selectedDocName ? `Tài liệu: ${selectedDocName}` : 'Toàn bộ tài liệu'}
          </span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-slate-50/70">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">
                LexiFin AI - Trợ Lý Tra Cứu Hợp Đồng & Kiểm Toán Doanh Nghiệp
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Hệ thống tự động đọc hiểu văn bản, trích xuất chính xác các điều khoản và đưa ra câu trả lời kèm căn cứ trích dẫn rõ ràng.
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
                <div className="w-8 h-8 rounded-xl bg-[#0f172a] text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-3xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 !text-white rounded-tr-none font-medium shadow-md'
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {/* Thought Process Accordion */}
                  {msg.thoughtProcess && msg.thoughtProcess.length > 0 && (
                    <ThoughtProcess thoughts={msg.thoughtProcess} isStreaming={msg.isStreaming} />
                  )}

                  {/* Audit Card Component if available */}
                  {msg.auditReport && (
                    <AuditCard report={msg.auditReport} />
                  )}

                  {/* Response Content */}
                  {msg.content ? (
                    <div className="space-y-3">
                      <div className={`prose prose-xs max-w-none prose-p:leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'prose-invert !text-white prose-p:!text-white prose-headings:!text-white font-medium' 
                          : 'prose-slate text-slate-800'
                      }`}>
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>

                      {/* Verified Source Citations Cards */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#0f172a]" />
                            <span>Nguồn trích dẫn đã xác minh ({msg.sources.length}):</span>
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <div
                                key={sIdx}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 flex items-center gap-1.5 shadow-2xs hover:border-slate-300 transition-colors"
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
                        <Loader2 className="w-4 h-4 animate-spin text-[#0f172a]" />
                        <span>Đang tìm kiếm chunks và tổng hợp câu trả lời...</span>
                      </div>
                    )
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block px-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-100 bg-white space-y-2">
        <div className="flex items-center gap-2 bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/30 rounded-xl p-2 transition-all border border-slate-200">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={selectedDocName ? `Đặt câu hỏi cho file "${selectedDocName}"...` : 'Đặt câu hỏi tra cứu tài liệu Hợp đồng / Báo cáo...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Gửi</span>
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Phân tích tự động & Bảo vệ dữ liệu an toàn</span>
          </div>
          <span>Tra cứu thông minh • Xác minh trích dẫn</span>
        </div>
      </form>
    </div>
  );
};
