'use client';

import React, { useState } from 'react';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';

interface FileUploadProps {
  backendUrl?: string;
  onUploadSuccess: (docId: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ backendUrl = 'http://localhost:8787', onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setStatusMessage('Vui lòng chọn file PDF hợp lệ.');
      return;
    }

    setIsUploading(true);
    setStatusMessage('Đang tải lên & phân tích tài liệu...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Tải lên thất bại: ${res.statusText}`);
      }

      const data = await res.json() as { docId: string; fileName: string };
      setStatusMessage(`Tải lên thành công! File: ${data.fileName || file.name}`);
      onUploadSuccess(data.docId, data.fileName || file.name);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`Lỗi tải file: ${errorMsg}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-lg transition-colors bg-slate-50 text-center cursor-pointer relative">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-slate-800 animate-spin" />
            <p className="text-xs text-slate-600 font-mono">Đang phân tích dữ liệu & trích xuất văn bản...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-2.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-sm">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Tải lên PDF Hợp đồng / Báo cáo tài chính</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Kéo thả hoặc nhấn để chọn file (Hỗ trợ PDF)</p>
            </div>
          </div>
        )}
      </div>

      {statusMessage && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-700 bg-slate-100 p-2 rounded border border-slate-200">
          <FileText className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className="font-mono text-[11px]">{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
