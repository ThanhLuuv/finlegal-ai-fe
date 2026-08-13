'use client';

import React, { useState, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { Header } from '../components/Header';
import { SecurityGate } from '../components/SecurityGate';
import { ChatWindow } from '../components/ChatWindow';
import { DocumentManager } from '../components/DocumentManager';
import { AdminLogModal } from '../components/AdminLogModal';
import { HelpCircle, ShieldCheck, Zap, X } from 'lucide-react';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedDocName, setSelectedDocName] = useState<string | undefined>(undefined);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [isTurnstilePassed, setIsTurnstilePassed] = useState(false);

  useEffect(() => {
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

  if (!isVerified) {
    return (
      <SecurityGate 
        isTurnstilePassed={isTurnstilePassed} 
        onTurnstileSuccess={() => setIsVerified(true)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#0f172a] selection:text-white">
      <Header 
        onOpenLogs={() => setIsLogsOpen(true)} 
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden p-2.5 sm:p-4 gap-3 sm:gap-4 bg-[#f8fafc] relative">
        {/* Mobile Off-Canvas Drawer Overlay */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
        )}

        {/* Sidebar: Document Management Hub */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-80 sm:w-80 shrink-0 bg-[#f8fafc] md:bg-transparent
          flex flex-col gap-3.5 overflow-y-auto p-4 md:p-0 pr-1
          transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile Drawer Close Button */}
          <div className="md:hidden flex items-center justify-between pb-1 border-b border-slate-200">
            <span className="font-bold text-xs text-[#0f172a]">Quản Lý Kho Tài Liệu</span>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <DocumentManager
            backendUrl={backendUrl}
            selectedDocId={selectedDocId}
            onSelectDoc={(docId) => {
              setSelectedDocId(docId);
              if (!docId) setSelectedDocName(undefined);
              setIsMobileSidebarOpen(false); // Auto close drawer on mobile selection
            }}
          />

          {/* Executive Feature Guide Box */}
          <div className="mt-auto p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-[#0f172a] font-bold">
              <div className="p-1 rounded-lg bg-slate-100 text-[#0f172a] border border-slate-200">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span>Tính Năng Nổi Bật</span>
            </div>
            <ul className="space-y-2.5 text-[11px] text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <Zap className="w-3.5 h-3.5 text-[#0f172a] shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Bóc tách đa thức</strong>: Tự động trích xuất các điều khoản hợp đồng & số liệu tài chính.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0f172a] shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Hỏi đáp chuẩn xác</strong>: Tra cứu theo dấu bản ghi [E1], [E2] không ảo giác.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Right Main Workspace */}
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

      <AdminLogModal
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        backendUrl={backendUrl}
      />
    </div>
  );
}
