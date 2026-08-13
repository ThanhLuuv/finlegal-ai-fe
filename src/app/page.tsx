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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Header onOpenLogs={() => setIsLogsOpen(true)} />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4 bg-slate-100">
        {/* Left Sidebar: Document Management Hub */}
        <aside className="w-72 sm:w-80 shrink-0 flex flex-col gap-3.5 overflow-y-auto pr-0.5">
          <DocumentManager
            backendUrl={backendUrl}
            selectedDocId={selectedDocId}
            onSelectDoc={(docId) => {
              setSelectedDocId(docId);
              if (!docId) setSelectedDocName(undefined);
            }}
          />

          {/* Guide Box */}
          <div className="mt-auto p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <div className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <span>Tính Năng Nổi Bật</span>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">⚡</span>
                <span><strong className="text-slate-800">Đọc hiểu siêu tốc</strong>: Tự động trích xuất các điều khoản hợp đồng & số liệu tài chính.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">🎯</span>
                <span><strong className="text-slate-800">Hỏi đáp chính xác</strong>: Tìm kiếm đúng vị trí và trả lời có căn cứ rõ ràng.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-blue-600 font-bold shrink-0">🛡️</span>
                <span><strong className="text-slate-800">Bảo mật tuyệt đối</strong>: Dữ liệu của bạn được phân quyền & bảo vệ an toàn.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Main Workspace: Interactive Chat Window */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
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

