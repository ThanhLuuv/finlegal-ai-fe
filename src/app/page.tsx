'use client';

import React, { useState, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { Header } from '../components/Header';
import { SecurityGate } from '../components/SecurityGate';
import { ChatWindow } from '../components/ChatWindow';
import { FileUpload } from '../components/FileUpload';
import { PDFViewer } from '../components/PDFViewer';
import { HelpCircle } from 'lucide-react';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  
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

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedNotice('Đang nạp dữ liệu bán hàng mẫu vào hệ thống...');
    try {
      const res = await fetch(`${backendUrl}/api/admin/seed`, { method: 'POST' });
      const data = await res.json() as { message?: string; error?: string };
      if (res.ok) {
        setSeedNotice('Khởi tạo dữ liệu bán hàng thành công!');
      } else {
        setSeedNotice(`Thông báo: ${data.error || 'Kiểm tra kết nối hệ thống'}`);
      }
    } catch (err) {
      setSeedNotice('Thông báo: Chưa kết nối được với máy chủ.');
    } finally {
      setIsSeeding(false);
    }
  };

  // Render Full-Screen Light Theme Security Gate if not verified
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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      <Header 
        isSeeding={isSeeding} 
        onSeedDatabase={handleSeedDatabase} 
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-slate-100">
        {/* Left Sidebar: Upload & Scope Selection */}
        <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
          {seedNotice && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono shadow-sm">
              {seedNotice}
            </div>
          )}

          <FileUpload
            backendUrl={backendUrl}
            onUploadSuccess={(docId) => setSelectedDocId(docId)}
          />

          <PDFViewer
            backendUrl={backendUrl}
            selectedDocId={selectedDocId}
            onSelectDoc={(docId) => setSelectedDocId(docId)}
          />

          {/* User Friendly Guide Box */}
          <div className="mt-auto p-4 rounded-xl bg-white shadow-sm space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <HelpCircle className="w-4 h-4 text-[#0B1727]" />
              <span>Hướng Dẫn Sử Dụng</span>
            </div>
            <ol className="space-y-1.5 text-xs text-slate-600 list-decimal pl-4 leading-relaxed">
              <li>Tải file Hợp đồng/Báo cáo (PDF) ở khung trên.</li>
              <li>Chọn file cụ thể hoặc đối soát toàn bộ văn bản.</li>
              <li>Gửi câu hỏi hoặc chọn các prompt gợi ý bên phải để nhận báo cáo đối soát.</li>
            </ol>
          </div>
        </aside>

        {/* Right Main Area: Chat & Audit Feed */}
        <main className="flex-1 h-full overflow-hidden">
          <ChatWindow
            messages={messages}
            isStreaming={isStreaming}
            onSendMessage={(prompt) => sendMessage(prompt, selectedDocId)}
          />
        </main>
      </div>
    </div>
  );
}
