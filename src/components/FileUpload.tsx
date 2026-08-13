'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  backendUrl?: string;
  onUploadSuccess: (docId: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ backendUrl = 'https://finlegal-backend.lvthanh-work.workers.dev', onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['pdf', 'txt', 'csv'].includes(ext)) {
      setStatusMessage('Vui lòng chọn file hợp lệ (PDF, TXT, CSV).');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Đang tải lên & phân tích cấu trúc tài liệu...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        headers: {
          'x-tenant-id': 'tenant_default',
          'x-user-id': 'user_default'
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Tải lên thất bại: ${res.statusText}`);
      }

      const data = await res.json() as { docId: string; fileName: string; warnings?: string[] };
      const warningText = data.warnings && data.warnings.length > 0 ? ` (${data.warnings.length} lưu ý cấu trúc)` : '';
      setStatusMessage(`Tải lên thành công! File: ${data.fileName || file.name}${warningText}`);
      onUploadSuccess(data.docId, data.fileName || file.name);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Lỗi tải file: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
      <div className="flex flex-col items-center justify-center p-5 rounded-xl transition-all bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-center cursor-pointer relative group shadow-inner">
        <input
          type="file"
          accept=".pdf,.txt,.csv"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-xs text-slate-700 dark:text-slate-300 font-mono">Đang phân tích dữ liệu & trích xuất văn bản...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-md group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Tải lên Tài liệu Hợp đồng / Báo cáo</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kéo thả hoặc nhấn để chọn file (PDF, TXT, CSV)</p>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 bg-blue-50/80 dark:bg-blue-900/30 p-2.5 rounded-xl shadow-xs border border-blue-100 dark:border-blue-800/40">
          <FileText className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
          <span className="font-mono text-[11px] truncate">{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
