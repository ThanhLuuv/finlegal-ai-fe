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
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-100/70 text-slate-900 font-sans">
      {/* Deep Navy Blue Primary Brand Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-[#0B1727] px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2.5 tracking-tight">
              FinLegal AI
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Trợ lý Thông minh
              </span>
            </h1>
            <p className="text-xs text-slate-300">Phân tích Hợp đồng & Đối soát Số liệu Bán hàng Doanh nghiệp</p>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedDatabase}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all shadow-sm active:scale-95"
            title="Tạo sẵn các bản ghi bán hàng mẫu để đối soát"
          >
            <Database className="w-4 h-4 text-blue-400" />
            <span>{isSeeding ? 'Đang nạp...' : 'Tạo Dữ liệu Mẫu'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Hệ thống: Sẵn sàng</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout (Clean Light Theme) */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 bg-slate-100/70">
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
          <div className="mt-auto p-4.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2.5 text-xs text-slate-700">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>Hướng Dẫn Sử Dụng</span>
            </div>
            <ol className="space-y-2 text-xs text-slate-600 list-decimal pl-4 leading-relaxed">
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
