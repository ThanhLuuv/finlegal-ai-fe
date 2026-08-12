'use client';

import React, { useState } from 'react';
import { useSSE } from '../hooks/useSSE';
import { ChatWindow } from '../components/ChatWindow';
import { FileUpload } from '../components/FileUpload';
import { PDFViewer } from '../components/PDFViewer';
import { ShieldCheck, Database, CheckCircle, HelpCircle } from 'lucide-react';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 flex items-center gap-2">
              FinLegal AI
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Trợ lý Thông minh
              </span>
            </h1>
            <p className="text-xs text-slate-500">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs font-medium text-slate-700 transition-colors shadow-sm"
            title="Tạo sẵn các bản ghi bán hàng mẫu để đối soát"
          >
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>{isSeeding ? 'Đang nạp...' : 'Tạo Dữ liệu Mẫu'}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hệ thống: Sẵn sàng</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Sidebar: Upload & Scope Selection */}
        <aside className="w-80 shrink-0 flex flex-col gap-4 overflow-y-auto">
          {seedNotice && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 font-mono">
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
          <div className="mt-auto p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <HelpCircle className="w-4 h-4 text-slate-700" />
              <span>Hướng Dẫn Sử Dụng</span>
            </div>
            <ol className="space-y-1.5 text-xs text-slate-600 list-decimal pl-4">
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
