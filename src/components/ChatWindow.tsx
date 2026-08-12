'use client';

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { ThoughtProcess } from './ThoughtProcess';
import { AuditCard } from './AuditCard';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSendMessage: (prompt: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isStreaming,
  onSendMessage
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

  const samplePrompts = [
    'Đối soát doanh thu Q2 trong Hợp đồng CTR-2024-001 so với số liệu ghi nhận thực tế trong hệ thống',
    'Truy vấn tổng doanh thu theo từng quý (Q1, Q2) của tất cả khách hàng trong hệ thống bán hàng',
    'So sánh giá trị hợp đồng Acme Corp với các giao dịch đã hoàn thành trong hệ thống'
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Trợ Lý FinLegal AI
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                Phân tích & Đối soát 24/7
              </span>
            </h2>
            <p className="text-xs text-slate-500">Tra cứu Văn bản & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
          </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1.5">Hệ Thống Phân Tích & Đối Soát Tài Chính</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập câu hỏi để đối soát số liệu Hợp đồng PDF với Cơ sở dữ liệu bán hàng thực tế theo thời gian thực.
              </p>
            </div>

            {/* Quick Sample Prompts */}
            <div className="w-full space-y-2.5 pt-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left pl-1">
                Gợi ý Yêu cầu Khởi tạo:
              </p>
              {samplePrompts.map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => onSendMessage(promptText)}
                  className="w-full text-left p-3.5 rounded-xl bg-white hover:bg-slate-100/80 border border-slate-200 hover:border-indigo-300 text-xs text-slate-700 transition-all duration-200 flex items-center justify-between shadow-xs hover:shadow-sm group"
                >
                  <span className="font-medium group-hover:text-slate-900 leading-snug">{promptText}</span>
                  <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-3 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div className={`max-w-3xl ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
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

                  {/* Response Text */}
                  {msg.content ? (
                    <div className="prose prose-slate prose-xs max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.isStreaming && (
                      <div className="flex items-center gap-2.5 text-slate-600 py-1 font-mono text-xs">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>Đang phân tích và đối soát số liệu...</span>
                      </div>
                    )
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block px-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form & Anti-Bot Protection Badge */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white space-y-2">
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 focus-within:border-slate-800 focus-within:bg-white rounded-xl p-2.5 transition-all shadow-xs">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Nhập câu hỏi hoặc yêu cầu đối soát số liệu..."
            disabled={isStreaming}
            className="flex-1 bg-transparent px-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isStreaming}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5"
          >
            <span>Gửi</span>
            {isStreaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Cloudflare Turnstile Invisible Widget & Clean Security Badge */}
        <div 
          className="cf-turnstile" 
          data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAENuyoUuTRh2b7uR'} 
          data-size="invisible"
        ></div>
        
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-500">Bảo vệ an ninh bởi Cloudflare Turnstile Defense</span>
          </div>
        </div>
      </form>
    </div>
  );
};
