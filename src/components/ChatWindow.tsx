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
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Trợ Lý FinLegal RAG AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300 border border-blue-500/20">
                Cloudflare Workers AI
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tra cứu Hợp đồng & Hỏi đáp RAG theo ngữ cảnh</p>
          </div>
        </div>

        {/* Selected Document Filter Scope Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700">
          <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="truncate max-w-[180px]">
            {selectedDocName ? `Tài liệu: ${selectedDocName}` : 'Toàn bộ tài liệu'}
          </span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50 dark:bg-slate-950/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 max-w-xl mx-auto space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                Hệ Thống Tra Cứu Tài Liệu RAG Chi Tiết
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Tự động tối ưu câu hỏi (Llama 3.1 8B) ➔ Tìm kiếm Vector BGE-M3 ➔ Đánh giá Top Chunks ➔ Trả lời kèm Trích dẫn chính xác (Qwen3 30B / Llama 3.3 70B).
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="w-full space-y-2 pt-2">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Câu hỏi gợi ý nhanh:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickPromptClick(prompt)}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-400 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-left shadow-2xs cursor-pointer flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-3xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-800'
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
                    <div className="prose prose-slate dark:prose-invert prose-xs max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.isStreaming && (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 py-1 font-mono text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
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
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 focus-within:bg-white dark:focus-within:bg-slate-900 focus-within:ring-2 focus-within:ring-blue-500 rounded-xl p-2 transition-all border border-slate-200 dark:border-slate-700">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={selectedDocName ? `Đặt câu hỏi cho file "${selectedDocName}"...` : 'Đặt câu hỏi tra cứu tài liệu Hợp đồng / Báo cáo...'}
            disabled={isStreaming}
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Gửi</span>
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Bảo vệ bởi Cloudflare Serverless Engine & Turnstile</span>
          </div>
          <span>BGE-M3 Embedding + Llama 3.1 8B / Qwen3 30B</span>
        </div>
      </form>
    </div>
  );
};

