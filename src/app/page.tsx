'use client';

import React, { useState, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { Header } from '../components/Header';
import { SecurityGate } from '../components/SecurityGate';
import { ChatWindow } from '../components/ChatWindow';
import { DocumentManager } from '../components/DocumentManager';
import { AdminLogModal } from '../components/AdminLogModal';
import { HelpCircle, Sparkles } from 'lucide-react';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedDocName, setSelectedDocName] = useState<string | undefined>(undefined);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Full-Screen Turnstile Security Verification State
  const [isVerified, setIsVerified] = useState(false);
  const [isTurnstilePassed, setIsTurnstilePassed] = useState(false);

  useEffect(() => {
    // Bind global Turnstile Callbacks for automatic verification
    if (typeof window !== 'undefined') {
      (window as any).onTurnstileSuccess = (_token: string) => {
        setIsTurnstilePassed(true);
        setTimeout(() => {
          setIsVerified(true);
        }, 600);
      };

      (window as any).onTurnstileExpired = () => {
        setIsTurnstilePassed(false);
      };

      (window as any).onTurnstileError = () => {
        setIsTurnstilePassed(false);
      };
    }
  }, []);

  // Render Full-Screen Security Gate if not verified
  if (!isVerified) {
    return (
      <SecurityGate 
        isTurnstilePassed={isTurnstilePassed} 
        onTurnstileSuccess={() => setIsVerified(true)} 
      />
    );
  }

  // Render Main Workspace Application
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <Header onOpenLogs={() => setIsLogsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-slate-100 dark:bg-slate-950">
        {/* Left Sidebar: Document Management Hub */}
        <aside className="w-84 shrink-0 flex flex-col gap-4 overflow-y-auto">
          <DocumentManager
            backendUrl={backendUrl}
            selectedDocId={selectedDocId}
            onSelectDoc={(docId) => {
              setSelectedDocId(docId);
              if (!docId) setSelectedDocName(undefined);
            }}
          />

          {/* Guide Box */}
          <div className="mt-auto p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
              <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Quy Trình RAG Nâng Cao</span>
            </div>
            <ol className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 list-decimal pl-4 leading-relaxed">
              <li><strong className="text-slate-800 dark:text-slate-200">Flow A</strong>: Upload file ➔ Lưu R2/D1 ➔ Phân tích cấu trúc ➔ BGE-M3 Embedding ➔ Vectorize Indexing.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Flow B</strong>: Nhập câu hỏi ➔ Query Rewrite (Llama 3.1 8B) ➔ Top 20 Vector Search ➔ Top 5 Reranker ➔ Qwen3 30B LLM Answer + Citations.</li>
              <li><strong className="text-slate-800 dark:text-slate-200">Flow C/D</strong>: Quản lý phiên bản (v1/v2), xóa triệt để hoặc tự động OCR nếu file scan.</li>
            </ol>
          </div>
        </aside>

        {/* Right Main Workspace: Interactive Chat Window */}
        <main className="flex-1 h-full overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={(prompt) => sendMessage(prompt, selectedDocId)}
            selectedDocId={selectedDocId}
            selectedDocName={selectedDocName}
          />
        </main>
      </div>

      {/* Internal AI Tracing Logs Modal */}
      <AdminLogModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        backendUrl={backendUrl}
      />
    </div>
  );
}

