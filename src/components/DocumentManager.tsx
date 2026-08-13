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
    setStatusMessage({ text: targetDocIdForVersion ? 'Đang tải lên và tạo phiên bản mới...' : 'Đang xử lý theo Flow A (R2 -> D1 -> Parsing -> Chunking -> BGE-M3 -> Vectorize)...' });

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
    if (!confirm('Bạn có chắc chắn muốn xóa triệt để tài liệu này khỏi R2, D1 và kho Vector Vectorize?')) return;

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Sẵn sàng
          </span>
        );
      case 'EXTRACTING':
      case 'PARSING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:bg-blue-400/20 dark:text-blue-300 border border-blue-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Trích xuất
          </span>
        );
      case 'STRUCTURING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-600 dark:bg-cyan-400/20 dark:text-cyan-300 border border-cyan-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Cấu trúc
          </span>
        );
      case 'CHUNKING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/20 dark:text-indigo-300 border border-indigo-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Tạo Chunks
          </span>
        );
      case 'EMBEDDING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:bg-purple-400/20 dark:text-purple-300 border border-purple-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> BGE-M3 Vector
          </span>
        );
      case 'INDEXING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300 border border-amber-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Vectorize
          </span>
        );
      case 'DELETING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300 border border-rose-500/20 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang xóa
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:bg-rose-400/20 dark:text-rose-300 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" /> Lỗi xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Loader2 className="w-3 h-3 animate-spin" /> Đang tải...
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload Zone */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Tải Lên Tài Liệu (Flow A)</span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
            PDF, DOCX, XLSX, TXT
          </span>
        </div>

        <div className="relative group flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer text-center">
          <input
            type="file"
            accept=".pdf,.docx,.xlsx,.pptx,.txt,.csv"
            onChange={(e) => handleFileUpload(e)}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Đang tự động xử lý Pipeline RAG...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="p-2.5 rounded-full bg-blue-600 text-white shadow-md group-hover:scale-110 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  Kéo thả hoặc Nhấp để Upload file
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Max 25MB • Tự động tạo Chunks & Vector BGE-M3
                </p>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className={`flex items-center gap-2 text-xs p-2.5 rounded-lg font-mono text-[11px] ${
            statusMessage.isError 
              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
            <span className="truncate">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Document List & Scope Selection */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Kho Tài Liệu ({documents.length})</span>
          </div>
          <button
            onClick={fetchDocuments}
            className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* All documents option */}
          <button
            onClick={() => onSelectDoc(undefined)}
            className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer border ${
              !selectedDocId
                ? 'bg-blue-600 text-white border-blue-600 shadow-md font-semibold'
                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                className={`w-full p-2.5 rounded-lg text-xs transition-all flex flex-col gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-50/90 dark:bg-blue-950/40 border-blue-500 text-blue-900 dark:text-blue-100 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold truncate">{doc.file_name}</span>
                    {doc.version && (
                      <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        {doc.version}
                      </span>
                    )}
                  </div>
                  {renderStatusBadge(doc.processing_status)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{doc.total_pages || 1} trang • {doc.total_chunks || 0} chunks</span>

                  <div className="flex items-center gap-1">
                    {/* Version upload trigger button */}
                    <label 
                      onClick={(e) => e.stopPropagation()} 
                      className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer p-0.5 rounded"
                      title="Cập nhật phiên bản mới (v2/v3)"
                    >
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.xlsx,.pptx,.txt" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, doc.doc_id)}
                      />
                      <span className="text-[10px] underline font-medium">Up v2</span>
                    </label>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                      disabled={isDeleting}
                      className="p-1 rounded hover:bg-rose-500 hover:text-white transition-colors cursor-pointer text-slate-400 hover:text-white"
                      title="Xóa tài liệu này"
                    >
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Trash2 className="w-3.5 h-3.5" />}
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
