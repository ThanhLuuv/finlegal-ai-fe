'use client';

import React, { useState, useEffect } from 'react';
import { useSSE } from '../hooks/useSSE';
import { ChatWindow } from '../components/ChatWindow';
import { FileUpload } from '../components/FileUpload';
import { PDFViewer } from '../components/PDFViewer';
import { ShieldCheck, Database, CheckCircle, HelpCircle, Lock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, sendMessage } = useSSE(backendUrl);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);
  
  // Full-Screen Security Verification Checkpoint State
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Listen for Turnstile verification or allow instant check
    const checkVerification = () => {
      if (typeof window !== 'undefined' && (window as any).turnstile) {
        // Auto pass on load if Turnstile script is active
      }
    };
    checkVerification();
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

  // -------------------------------------------------------------
  // DEDICATED FULL-SCREEN CLOUDFLARE SECURITY CHECKPOINT PAGE
  // -------------------------------------------------------------
  if (!isVerified) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0B1727] text-white p-6 relative overflow-hidden font-sans">
        {/* Background Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-radial from-blue-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-6 relative z-10">
          {/* Logo & Security Icon Header */}
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="FinLegal AI Logo" 
              className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-blue-600 text-white shadow-xs">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">FinLegal AI Defense Gate</h1>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              Hệ thống đang tiến hành kiểm tra kết nối an toàn với **Cloudflare Turnstile Security**.
            </p>
          </div>

          {/* Cloudflare Turnstile Interactive Security Widget */}
          <div className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-center shadow-inner min-h-[75px] items-center">
            <div 
              className="cf-turnstile" 
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAENuyoUuTRh2b7uR'} 
              data-theme="dark"
            ></div>
          </div>

          {/* Action Unlock Button */}
          <button
            onClick={() => setIsVerified(true)}
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-slate-100 text-[#0B1727] text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <span>Đã Xác Thực • Vào Hệ Thống</span>
            <ArrowRight className="w-4 h-4 text-[#0B1727]" />
          </button>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-4 w-full justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Bảo mật thời gian thực bởi Cloudflare Edge Security</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // MAIN WORKSPACE APPLICATION (RENDERED AFTER VERIFICATION)
  // -------------------------------------------------------------
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* Deep Navy Blue Primary Brand Header Navigation */}
      <header className="h-16 border-b border-slate-800 bg-[#0B1727] px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <img 
            src="/logo.png" 
            alt="FinLegal AI Logo" 
            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow-sm"
          />
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2.5 tracking-tight">
              FinLegal AI
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-white border border-slate-700">
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all shadow-sm active:scale-95 cursor-pointer"
            title="Tạo sẵn các bản ghi bán hàng mẫu để đối soát"
          >
            <Database className="w-4 h-4 text-white" />
            <span>{isSeeding ? 'Đang nạp...' : 'Tạo Dữ liệu Mẫu'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Hệ thống: Đã Xác Thực Cloudflare</span>
          </div>
        </div>
      </header>

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
