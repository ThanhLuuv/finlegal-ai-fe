'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSSE } from '../hooks/useSSE';
import { Header } from '../components/Header';
import { SecurityGate } from '../components/SecurityGate';
import { ChatWindow } from '../components/ChatWindow';
import { DocumentManager } from '../components/DocumentManager';
import { AdminLogModal } from '../components/AdminLogModal';
import { X } from 'lucide-react';
import { DocumentRecord } from '../types';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [selectedDocName, setSelectedDocName] = useState<string | undefined>(undefined);
  const [documentsList, setDocumentsList] = useState<Array<{ doc_id: string; file_name: string }>>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isVerified, setIsVerified] = useState(false);
  const [isTurnstilePassed, setIsTurnstilePassed] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement>(null);

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

  const fetchDocsList = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/documents`, {
        headers: { 'x-tenant-id': 'tenant_default', 'x-user-id': 'user_default' }
      });
      if (res.ok) {
        const data = await res.json() as { documents: DocumentRecord[] };
        const list = (data.documents || []).map(d => ({ doc_id: d.doc_id, file_name: d.file_name }));
        setDocumentsList(list);

        if (selectedDocId) {
          const found = list.find(d => d.doc_id === selectedDocId);
          setSelectedDocName(found ? found.file_name : undefined);
        } else {
          setSelectedDocName(undefined);
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isVerified) {
      fetchDocsList();
    }
  }, [isVerified, selectedDocId]);

  if (!isVerified) {
    return (
      <SecurityGate 
        isTurnstilePassed={isTurnstilePassed} 
        onTurnstileSuccess={() => setIsVerified(true)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Header with Right-Aligned Tải Tài Liệu Mới Button */}
      <Header 
        onOpenLogs={() => setIsLogsOpen(true)} 
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onUploadClick={() => uploadInputRef.current?.click()}
      />

      {/* Main 2-Column Template Layout */}
      <div className="flex-1 flex overflow-hidden p-3 sm:p-5 gap-4 sm:gap-5 bg-[#f8fafc] relative">
        {/* Mobile Off-Canvas Drawer Overlay */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />
        )}

        {/* Left Sidebar: Document List (Matching Template Sidebar) */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 md:z-auto
          w-80 sm:w-80 shrink-0 bg-[#f8fafc] md:bg-transparent
          flex flex-col overflow-y-auto p-4 md:p-0
          transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile Drawer Close Button */}
          <div className="md:hidden flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <span className="font-bold text-sm text-slate-800">Kho Tài Liệu</span>
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
            uploadInputRef={uploadInputRef}
            onSelectDoc={(docId) => {
              setSelectedDocId(docId);
              if (!docId) setSelectedDocName(undefined);
              setIsMobileSidebarOpen(false);
            }}
            onDocumentChange={fetchDocsList}
          />
        </aside>

        {/* Right Main Workspace: Trò chuyện với tài liệu */}
        <main className="flex-1 min-w-0 h-full overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={(prompt) => sendMessage(prompt, selectedDocId)}
            selectedDocId={selectedDocId}
            selectedDocName={selectedDocName}
            documentsList={documentsList}
            onSelectDoc={(docId) => setSelectedDocId(docId)}
            onAttachClick={() => uploadInputRef.current?.click()}
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
