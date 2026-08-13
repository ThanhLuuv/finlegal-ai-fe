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
  Lock
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
    }, 8000);

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
        await fetchDocuments();
        if (data.docId) onSelectDoc(data.docId);
      } else {
        alert(data.error || 'Khởi tạo tài liệu mẫu thất bại');
      }
    } catch {
      alert('Không thể kết nối máy chủ để nạp tài liệu mẫu.');
    } finally {
      setIsSeeding(false);
    }
  };

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

      if (res.ok) {
        const data = await res.json() as { docId: string };
        setStatusMessage({ text: 'Tải lên tài liệu thành công!' });
        onSelectDoc(data.docId);
        fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      } else {
        const err = await res.json() as { error?: string };
        setStatusMessage({ text: err.error || 'Lỗi khi tải tài liệu lên.', isError: true });
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
      setStatusMessage({ text: 'Lỗi kết nối khi tải tài liệu.', isError: true });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleDeleteDocument = async (docId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài liệu này không?')) return;

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
        fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const renderStatusBadge = (status?: string, isSelected?: boolean) => {
    switch (status) {
      case 'READY':
        return (
          <span className={`inline-flex items-center gap-1 shrink-0 min-w-max px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
            isSelected 
              ? 'bg-emerald-950/80 text-emerald-300' 
              : 'bg-emerald-50 text-emerald-700'
          }`}>
            <CheckCircle2 className="w-3 h-3 shrink-0" /> Sẵn sàng
          </span>
        );
      case 'EXTRACTING':
      case 'PARSING':
        return (
          <span className={`inline-flex items-center gap-1 shrink-0 min-w-max px-2.5 py-0.5 rounded-full text-[10px] font-semibold animate-pulse ${
            isSelected
              ? 'bg-blue-950/80 text-blue-300'
              : 'bg-blue-50 text-blue-700'
          }`}>
            <Loader2 className="w-3 h-3 animate-spin shrink-0" /> Trích xuất
          </span>
        );
      case 'CHUNKING':
      case 'EMBEDDING':
      case 'INDEXING':
        return (
          <span className={`inline-flex items-center gap-1 shrink-0 min-w-max px-2.5 py-0.5 rounded-full text-[10px] font-semibold animate-pulse ${
            isSelected
              ? 'bg-amber-950/80 text-amber-300'
              : 'bg-amber-50 text-amber-700'
          }`}>
            <Loader2 className="w-3 h-3 animate-spin shrink-0" /> Đang xử lý
          </span>
        );
      case 'FAILED':
        return (
          <span className={`inline-flex items-center gap-1 shrink-0 min-w-max px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
            isSelected
              ? 'bg-rose-950/80 text-rose-300'
              : 'bg-rose-50 text-rose-700'
          }`}>
            <AlertCircle className="w-3 h-3 shrink-0" /> Lỗi xử lý
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 shrink-0 min-w-max px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
            <Loader2 className="w-3 h-3 animate-spin shrink-0" /> Đang tải...
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Upload Zone */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
            <Sparkles className="w-4 h-4 text-[#0f172a]" />
            <span>Tải Lên Tài Liệu</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            PDF, TXT, CSV
          </span>
        </div>

        <div className="relative group flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-200 hover:border-[#0f172a] bg-slate-50/70 hover:bg-slate-100/60 transition-all cursor-pointer text-center">
          <input
            type="file"
            accept=".pdf,.txt,.csv"
            onChange={(e) => handleFileUpload(e)}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-[#0f172a] animate-spin" />
              <p className="text-xs font-medium text-slate-700 font-mono">Đang đọc & phân tích tài liệu...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              <div className="p-2.5 rounded-xl bg-[#0f172a] text-white shadow-xs group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-[#0f172a] transition-colors">
                  Kéo thả hoặc Nhấp để Upload file
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tối đa 25MB • Tự động trích xuất điều khoản
                </p>
              </div>
            </div>
          )}
        </div>

        {statusMessage && (
          <div className={`flex items-center gap-2 text-xs p-2.5 rounded-xl text-[11px] ${
            statusMessage.isError 
              ? 'bg-rose-50 text-rose-700' 
              : 'bg-slate-100 text-slate-800'
          }`}>
            {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> : <FileText className="w-4 h-4 shrink-0 text-[#0f172a]" />}
            <span className="truncate">{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* Document List & Scope Selection */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0f172a]">
            <FileText className="w-4 h-4 text-[#0f172a]" />
            <span>Kho Tài Liệu ({documents.length})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleSeedSampleDoc}
              disabled={isSeeding}
              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold transition-all flex items-center gap-1 border border-emerald-200 cursor-pointer shadow-2xs"
              title="Nạp lại tài liệu hợp đồng mẫu dùng thử"
            >
              {isSeeding ? <Loader2 className="w-3 h-3 animate-spin text-emerald-600" /> : <Sparkles className="w-3 h-3 text-emerald-600" />}
              <span>Nạp file mẫu</span>
            </button>
            <button
              onClick={fetchDocuments}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer border border-slate-200"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {/* All documents option */}
          <button
            onClick={() => onSelectDoc(undefined)}
            className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer border ${
              !selectedDocId
                ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs font-semibold'
                : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
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
            const isDemoDoc = Number((doc as any).is_demo) === 1 || doc.doc_id.toLowerCase().includes('demo');

            return (
              <div
                key={doc.doc_id}
                onClick={() => onSelectDoc(doc.doc_id)}
                className={`w-full p-3 rounded-xl text-xs transition-all flex flex-col gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0f172a] text-white border-[#0f172a] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDoc(doc.doc_id);
                        window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                      }}
                      className={`font-semibold truncate hover:underline cursor-pointer ${isSelected ? 'text-white' : 'text-slate-900'}`}
                      title="Nhấp để chọn & mở xem file gốc"
                    >
                      {doc.file_name}
                    </span>
                    {isDemoDoc ? (
                      <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded shrink-0 flex items-center gap-0.5 ${
                        isSelected 
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <Lock className="w-2.5 h-2.5" />
                        <span>Mẫu</span>
                      </span>
                    ) : (
                      doc.version && (
                        <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded shrink-0 ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-slate-200 text-slate-800'
                        }`}>
                          {doc.version}
                        </span>
                      )
                    )}
                  </div>
                  {renderStatusBadge(doc.processing_status, isSelected)}
                </div>

                <div className={`flex items-center justify-between text-[11px] pt-1 border-t ${
                  isSelected ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-500'
                }`}>
                  <span>{doc.total_pages || 1} trang • {doc.total_chunks || 0} chunks</span>

                  <div className="flex items-center gap-2">
                    {/* View / Preview button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                      }}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        isSelected ? 'hover:bg-slate-800 text-slate-200 bg-white/10' : 'hover:bg-slate-200 text-slate-700 bg-slate-100'
                      }`}
                      title="Xem file gốc trong tab mới"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-semibold">Xem file</span>
                    </button>

                    {/* Version upload trigger button */}
                    <label 
                      onClick={(e) => e.stopPropagation()} 
                      className={`hover:underline cursor-pointer p-0.5 rounded font-medium text-[10px] ${
                        isSelected ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-slate-900'
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

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                      disabled={isDeleting}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isSelected ? 'hover:bg-slate-800 text-white' : 'hover:bg-rose-100 hover:text-rose-600 text-slate-400'
                      }`}
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
