'use client';

import React, { useState, useEffect } from 'react';
import { DocumentRecord } from '../types';
import { 
  FileText, 
  UploadCloud, 
  RefreshCw, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers,
  Sparkles
} from 'lucide-react';

interface DocumentManagerProps {
  backendUrl: string;
  selectedDocId?: string;
  onSelectDoc: (docId: string | undefined) => void;
  onDocumentChange?: () => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  backendUrl,
  selectedDocId,
  onSelectDoc,
  onDocumentChange
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/documents`, {
        headers: {
          'x-tenant-id': 'tenant_default',
          'x-user-id': 'user_default'
        }
      });
      if (res.ok) {
        const data = await res.json() as { documents: DocumentRecord[] };
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.warn('Failed to fetch document list:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    const interval = setInterval(fetchDocuments, 6000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, targetDocIdForVersion?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['pdf', 'txt', 'csv'];
    if (!allowedExts.includes(ext)) {
      setStatusMessage({ text: `Định dạng .${ext} chưa được hỗ trợ. Vui lòng chọn file PDF, TXT hoặc CSV.`, isError: true });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setStatusMessage({ text: 'Dung lượng file vượt quá giới hạn 25MB.', isError: true });
      return;
    }

    setIsUploading(true);
    setStatusMessage({ text: targetDocIdForVersion ? 'Đang tải lên và tạo phiên bản mới...' : 'Đang xử lý và trích xuất nội dung tài liệu...' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const endpoint = targetDocIdForVersion
        ? `${backendUrl}/api/documents/${targetDocIdForVersion}/version`
        : `${backendUrl}/api/documents`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-tenant-id': 'tenant_default',
          'x-user-id': 'user_default'
        },
        body: formData
      });

      const data = await res.json() as { success?: boolean; error?: string; docId?: string; fileName?: string; version?: string; message?: string };

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Upload failed');
      }

      setStatusMessage({ text: data.message || `Tải lên thành công file: ${file.name}` });
      if (data.docId) {
        onSelectDoc(data.docId);
      }
      await fetchDocuments();
      if (onDocumentChange) onDocumentChange();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatusMessage({ text: `Lỗi: ${errorMsg}`, isError: true });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này khỏi hệ thống?')) return;

    setDeletingId(docId);
    try {
      const res = await fetch(`${backendUrl}/api/documents/${docId}`, {
        method: 'DELETE',
        headers: {
          'x-tenant-id': 'tenant_default',
          'x-user-id': 'user_default'
        }
      });
      if (res.ok) {
        if (selectedDocId === docId) {
          onSelectDoc(undefined);
        }
        await fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
          </span>
        );
      case 'EXTRACTING':
      case 'PARSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Trích xuất
          </span>
        );
      case 'STRUCTURING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Cấu trúc
          </span>
        );
      case 'CHUNKING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Phân đoạn
          </span>
        );
      case 'EMBEDDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang mã hóa
          </span>
        );
      case 'INDEXING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang lưu trữ
          </span>
        );
      case 'DELETING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang xóa
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Lỗi xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload Zone */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Tải Lên Tài Liệu</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded-md">
            PDF, TXT, CSV
          </span>
        </div>

        <div className="relative group flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl border-2 border-dashed border-slate-800 hover:border-blue-500/50 bg-slate-950/60 hover:bg-slate-950 transition-all cursor-pointer text-center">
          <input
            type="file"
            accept=".pdf,.txt,.csv"
            onChange={(e) => handleFileUpload(e)}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-1.5">
              <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
              <p className="text-xs font-medium text-slate-300 font-mono">Đang đọc & phân tích tài liệu...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-0.5">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/20 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                  Kéo thả hoặc Nhấp để Upload file
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Max 25MB • Tự động trích xuất điều khoản
                </p>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className={`flex items-center gap-2 text-xs p-2.5 rounded-xl font-mono text-[11px] ${
            statusMessage.isError 
              ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' 
              : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
            <span className="truncate">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Document List & Scope Selection */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md flex flex-col gap-2.5 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <FileText className="w-4 h-4 text-blue-400" />
            <span>Kho Tài Liệu ({documents.length})</span>
          </div>
          <button
            onClick={fetchDocuments}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* All documents option */}
          <button
            onClick={() => onSelectDoc(undefined)}
            className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
              !selectedDocId
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/30 shadow-md font-semibold'
                : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Tra cứu toàn bộ tài liệu</span>
            </div>
            {!selectedDocId && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
          </button>

          {/* List individual documents */}
          {documents.map((doc) => {
            const isSelected = selectedDocId === doc.doc_id;
            const isDeleting = deletingId === doc.doc_id;

            return (
              <div
                key={doc.doc_id}
                onClick={() => onSelectDoc(doc.doc_id)}
                className={`w-full p-2.5 rounded-xl text-xs transition-all flex flex-col gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500/30 shadow-md font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold truncate">{doc.file_name}</span>
                    {doc.version && (
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                        isSelected 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {doc.version}
                      </span>
                    )}
                  </div>
                  {renderStatusBadge(doc.processing_status)}
                </div>

                <div className={`flex items-center justify-between text-[11px] ${
                  isSelected ? 'text-blue-100' : 'text-slate-400'
                }`}>
                  <span>{doc.total_pages || 1} trang • {doc.total_chunks || 0} chunks</span>

                  <div className="flex items-center gap-1">
                    {/* Version upload trigger button */}
                    <label 
                      onClick={(e) => e.stopPropagation()} 
                      className={`hover:underline cursor-pointer p-0.5 rounded font-medium text-[10px] ${
                        isSelected ? 'text-white' : 'text-blue-400 hover:text-blue-300'
                      }`}
                      title="Cập nhật phiên bản mới (v2/v3)"
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.txt,.csv" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, doc.doc_id)}
                      />
                      <span>Up v2</span>
                    </label>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                      disabled={isDeleting}
                      className="p-1 rounded hover:bg-rose-600 hover:text-white transition-colors cursor-pointer text-slate-400 hover:text-white"
                      title="Xóa tài liệu này"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
