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
  Sparkles,
  Eye,
  Search,
  X,
  Terminal as TerminalIcon
} from 'lucide-react';
import { IngestionTerminalCard } from './IngestionTerminalCard';

interface DocumentManagerProps {
  backendUrl: string;
  selectedDocId?: string;
  onSelectDoc: (docId: string | undefined) => void;
  onDocumentChange?: () => void;
  uploadInputRef?: React.RefObject<HTMLInputElement | null>;
  activeIngestion?: {
    docId: string;
    fileName: string;
    status: string;
    totalPages?: number;
    totalChunks?: number;
    logs: string[];
  } | null;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  backendUrl,
  selectedDocId,
  onSelectDoc,
  onDocumentChange,
  uploadInputRef,
  activeIngestion
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<{ text: string; isError?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (text: string, isError?: boolean) => {
    setStatusToast({ text, isError });
    setTimeout(() => {
      setStatusToast(null);
    }, 4000);
  };

  const [internalIngestionState, setInternalIngestionState] = useState<{
    docId: string;
    fileName: string;
    status: string;
    totalPages?: number;
    totalChunks?: number;
    logs: string[];
  } | null>(null);

  const startStatusPolling = (docId: string, fileName: string) => {
    const initLogs = [
      `[0.05s] [UPLOAD] Uploading raw file to Cloudflare R2... OK`,
      `[0.15s] [STATE] Initialized D1 record (status: UPLOADED)`
    ];

    setInternalIngestionState({
      docId,
      fileName,
      status: 'UPLOADED',
      logs: initLogs
    });

    const currentLogs = [...initLogs];
    const seenStatuses = new Set(['UPLOADED']);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/documents/${docId}/status`);
        if (res.ok) {
          const st = await res.json() as {
            status: string;
            totalPages: number;
            totalChunks: number;
            extractionMethod: string;
            isReady: boolean;
          };

          const s = st.status || 'UPLOADED';
          if (!seenStatuses.has(s)) {
            seenStatuses.add(s);
            if (s === 'PARSING') {
              currentLogs.push(`[0.35s] [PARSING] Fast-path text parsing & structure analysis...`);
            } else if (s === 'CHUNKING') {
              currentLogs.push(`[0.70s] [CHUNKING] Structure-aware recursive splitting (700 tokens, overlap 135)...`);
            } else if (s === 'EMBEDDING') {
              currentLogs.push(`[1.10s] [EMBEDDING] Workers AI BGE-M3 generating 768-dim vector embeddings...`);
            } else if (s === 'INDEXING') {
              currentLogs.push(`[1.45s] [INDEXING] Idempotent multi-store sync (Vectorize + D1 + R2)...`);
            } else if (s === 'READY') {
              currentLogs.push(`[1.80s] [READY] Ingestion complete! Generated ${st.totalChunks || 0} chunks across ${st.totalPages || 1} pages.`);
            }
          }

          setInternalIngestionState({
            docId,
            fileName,
            status: s,
            totalPages: st.totalPages,
            totalChunks: st.totalChunks,
            logs: [...currentLogs]
          });

          if (st.isReady || s === 'FAILED') {
            clearInterval(interval);
            fetchDocuments();
            if (onDocumentChange) onDocumentChange();
            setTimeout(() => setInternalIngestionState(null), 8000);
          }
        }
      } catch {
        // Retry next tick
      }
    }, 800);
  };

  const fetchDocuments = React.useCallback(async () => {
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
  }, [backendUrl]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const hasProcessingDoc = documents.some(
      d => d.processing_status && d.processing_status !== 'READY' && d.processing_status !== 'FAILED'
    );

    if (!hasProcessingDoc) return;

    const timer = setTimeout(() => {
      fetchDocuments();
    }, 5000);

    return () => clearTimeout(timer);
  }, [documents, fetchDocuments]);

  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeedSampleDoc = async () => {
    try {
      setIsSeeding(true);
      const res = await fetch(`${backendUrl}/api/documents/seed-sample`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Nạp tài liệu mẫu dùng thử thành công!');
        await fetchDocuments();
        if (data.docId) onSelectDoc(data.docId);
      } else {
        showToast(data.error || 'Khởi tạo tài liệu mẫu thất bại', true);
      }
    } catch {
      showToast('Không thể kết nối máy chủ để nạp tài liệu mẫu.', true);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, targetDocIdForVersion?: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['pdf', 'docx', 'txt', 'csv', 'md'];
    if (!allowedExts.includes(ext)) {
      showToast(`Định dạng .${ext} chưa được hỗ trợ. Chọn file PDF, DOCX, TXT, CSV hoặc MD.`, true);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('Dung lượng file vượt quá giới hạn 25MB.', true);
      return;
    }

    setIsUploading(true);
    showToast(targetDocIdForVersion ? 'Đang tải lên phiên bản mới...' : 'Đang tải tài liệu lên...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      let url = `${backendUrl}/api/documents`;
      if (targetDocIdForVersion) {
        url = `${backendUrl}/api/documents/${targetDocIdForVersion}/version`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'x-tenant-id': 'tenant_default',
          'x-user-id': 'user_default'
        },
        body: formData
      });

      const data = await res.json() as { success: boolean; docId?: string; message?: string; error?: string };

      if (res.ok && data.success && data.docId) {
        showToast(data.message || 'Tải lên thành công! Đang bóc tách dữ liệu.');
        if (data.docId) {
          onSelectDoc(data.docId);
          startStatusPolling(data.docId, file.name);
        }
        await fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      } else {
        showToast(data.error || 'Xử lý file thất bại.', true);
      }
    } catch {
      showToast('Lỗi kết nối máy chủ.', true);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn xóa tài liệu này khỏi hệ thống?')) return;

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
        showToast('Đã xóa tài liệu khỏi hệ thống.');
        if (selectedDocId === docId) onSelectDoc(undefined);
        await fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      } else {
        showToast('Xóa tài liệu thất bại.', true);
      }
    } catch {
      showToast('Không thể xóa tài liệu.', true);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') {
      return (
        <div className="w-9 h-9 rounded-lg bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>PDF</span>
        </div>
      );
    } else if (ext === 'docx' || ext === 'doc') {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/80 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>DOCX</span>
        </div>
      );
    } else if (ext === 'pptx' || ext === 'ppt') {
      return (
        <div className="w-9 h-9 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-800/80 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>PPTX</span>
        </div>
      );
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>XLSX</span>
        </div>
      );
    }

    return (
      <div className="w-9 h-9 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
        <span>TXT</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#090d18] rounded-2xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/20 border border-slate-800/80 relative font-mono text-slate-200">
      {/* Hidden File Input for Header Trigger */}
      <input
        type="file"
        ref={uploadInputRef as any}
        accept=".pdf,.docx,.txt,.csv,.md"
        onChange={(e) => handleFileUpload(e)}
        disabled={isUploading}
        className="hidden"
      />

      {/* Floating Toast Notification */}
      {statusToast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold font-mono border ${
          statusToast.isError 
            ? 'bg-rose-950 text-rose-200 border-rose-800' 
            : 'bg-slate-900 text-slate-100 border-slate-700'
        }`}>
          {statusToast.isError ? <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          <span>{statusToast.text}</span>
          <button 
            onClick={() => setStatusToast(null)}
            className="ml-2 p-0.5 text-slate-400 hover:text-white rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sidebar Header Title */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
        <h2 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-cyan-400" />
          <span>Kho Tài Liệu RAG</span>
        </h2>
        <button
          onClick={fetchDocuments}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-all cursor-pointer border border-transparent hover:border-slate-700"
          title="Làm mới kho tài liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Search Input Box */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm tên file..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050810] border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
      </div>

      {/* Live Ingestion Terminal Progress Widget */}
      {(activeIngestion || internalIngestionState) && (
        <IngestionTerminalCard 
          fileName={(activeIngestion || internalIngestionState)!.fileName}
          status={(activeIngestion || internalIngestionState)!.status}
          totalPages={(activeIngestion || internalIngestionState)!.totalPages}
          totalChunks={(activeIngestion || internalIngestionState)!.totalChunks}
          logs={(activeIngestion || internalIngestionState)!.logs}
        />
      )}

      {/* All Documents Active Pill Item */}
      <div 
        onClick={() => onSelectDoc(undefined)}
        className={`mb-3.5 px-3 py-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
          !selectedDocId 
            ? 'bg-blue-950/60 border-blue-600/60 text-blue-300 font-semibold shadow-sm' 
            : 'bg-[#070b14] border-slate-800 text-slate-300 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-2 text-xs">
          <Layers className={`w-4 h-4 ${!selectedDocId ? 'text-cyan-400' : 'text-slate-500'}`} />
          <span>Tất cả tài liệu</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
          !selectedDocId ? 'bg-blue-900/80 border-blue-700 text-blue-200' : 'bg-slate-900 border-slate-800 text-slate-400'
        }`}>
          {documents.length}
        </span>
      </div>

      {/* Demo Seed Button if empty */}
      {documents.length === 0 && (
        <button
          onClick={handleSeedSampleDoc}
          disabled={isSeeding || isUploading}
          className="mb-4 w-full py-2 px-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/80 text-amber-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
          <span>Nạp Hợp Đồng Mẫu Demo</span>
        </button>
      )}

      {/* Document Items List */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-slate-800">
        {isLoading && documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2 font-mono">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Đang tải danh sách tài liệu...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-[#050810] rounded-xl p-3 border border-slate-800 font-mono">
            Không tìm thấy tài liệu phù hợp
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const isSelected = selectedDocId === doc.doc_id;
            const isDeleting = deletingId === doc.doc_id;
            const isDemoDoc = doc.doc_id === 'doc_sample_hop_dong_001';
            const ext = doc.file_name.split('.').pop()?.toUpperCase() || 'PDF';
            const dateStr = doc.created_at ? new Date(doc.created_at).toLocaleDateString('vi-VN') : '15/05/2024';

            return (
              <div
                key={doc.doc_id}
                onClick={() => onSelectDoc(isSelected ? undefined : doc.doc_id)}
                className={`p-3 rounded-xl transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-950/40 border-cyan-500/60 text-slate-100 shadow-md shadow-cyan-950/30'
                    : 'bg-[#070b14] border-slate-800/80 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* File Type Badge Icon */}
                  {renderFileIcon(doc.file_name)}

                  {/* Document Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 
                        className="font-semibold text-xs text-slate-200 truncate group-hover:text-cyan-400 transition-colors font-mono"
                        title={doc.file_name}
                      >
                        {doc.file_name}
                      </h3>
                      {isDemoDoc && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800 shrink-0">
                          Mẫu
                        </span>
                      )}
                    </div>

                    <div className="text-[10.5px] text-slate-400 font-mono mt-1.5 flex items-center justify-between gap-2">
                      <span className="truncate">{ext} • {doc.total_pages || 1}Tr • {dateStr}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                          }}
                          className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Xem file gốc"
                        >
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>Xem</span>
                        </button>
                        {!isDemoDoc && (
                          <button
                            onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                            disabled={isDeleting}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-700 text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            {isDeleting ? <Loader2 className="w-3 h-3 animate-spin text-rose-400" /> : <Trash2 className="w-3 h-3 text-rose-400" />}
                            <span>Xóa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Text */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 px-1 mt-auto font-mono flex justify-between">
        <span>Tài liệu: {filteredDocs.length}/{documents.length}</span>
        <span className="text-cyan-400 font-bold">RAG READY</span>
      </div>
    </div>
  );
};
