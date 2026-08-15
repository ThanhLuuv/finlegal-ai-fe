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
  Lock,
  Search
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
  const [searchQuery, setSearchQuery] = useState('');

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
    const allowedExts = ['pdf', 'txt', 'csv', 'md'];
    if (!allowedExts.includes(ext)) {
      setStatusMessage({ text: `Định dạng .${ext} chưa được hỗ trợ. Vui lòng chọn file PDF, TXT, CSV hoặc MD.`, isError: true });
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

      if (res.ok && data.success) {
        setStatusMessage({ text: 'Nạp tài liệu thành công!' });
        await fetchDocuments();
        if (data.docId) onSelectDoc(data.docId);
        if (onDocumentChange) onDocumentChange();
      } else {
        setStatusMessage({ text: data.error || 'Xử lý file thất bại.', isError: true });
      }
    } catch {
      setStatusMessage({ text: 'Lỗi kết nối máy chủ.', isError: true });
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
        if (selectedDocId === docId) onSelectDoc(undefined);
        await fetchDocuments();
        if (onDocumentChange) onDocumentChange();
      } else {
        alert('Xóa tài liệu thất bại.');
      }
    } catch {
      alert('Không thể xóa tài liệu.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter(d => 
    d.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'READY':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Sẵn sàng</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Lỗi</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
            <span>Xử lý...</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Upload Box */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Layers className="w-4 h-4 text-slate-700" />
            <span>Nạp Tài Liệu Hợp Đồng</span>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={isLoading}
            className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer text-center group">
          <input
            type="file"
            accept=".pdf,.txt,.csv,.md"
            onChange={(e) => handleFileUpload(e)}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
              <span className="text-xs font-semibold text-slate-700">Đang nạp dữ liệu...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <UploadCloud className="w-6 h-6 text-slate-500 group-hover:text-slate-800 transition-colors" />
              <span className="text-xs font-bold text-slate-800">Tải lên file mới</span>
              <span className="text-[10px] text-slate-500">PDF, TXT, CSV, MD (Tối đa 25MB)</span>
            </div>
          )}
        </label>

        {/* Demo Seed Sample Document Trigger */}
        <button
          onClick={handleSeedSampleDoc}
          disabled={isSeeding || isUploading}
          className="w-full py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {isSeeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          )}
          <span>Nạp Hợp Đồng Mẫu Demo</span>
        </button>

        {statusMessage && (
          <div className={`p-2.5 rounded-lg text-xs font-medium border ${
            statusMessage.isError 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {statusMessage.text}
          </div>
        )}
      </div>

      {/* Document List */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-slate-900 font-bold text-xs">
          <span>Kho Văn Bản ({filteredDocs.length})</span>
          {selectedDocId && (
            <button
              onClick={() => onSelectDoc(undefined)}
              className="text-[10px] text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Bỏ chọn
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên văn bản..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-400"
          />
        </div>

        {/* List Items */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {isLoading && documents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg p-3">
              Chưa có văn bản nào trong kho
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDocId === doc.doc_id;
              const isDeleting = deletingId === doc.doc_id;
              const isDemoDoc = doc.doc_id === 'doc_sample_hop_dong_001';

              return (
                <div
                  key={doc.doc_id}
                  onClick={() => onSelectDoc(isSelected ? undefined : doc.doc_id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-50 border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-900' : 'text-slate-500'}`} />
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDoc(doc.doc_id);
                          window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                        }}
                        className="font-bold text-xs truncate text-slate-900 hover:underline cursor-pointer"
                        title="Nhấp để xem file gốc"
                      >
                        {doc.file_name}
                      </span>
                      {isDemoDoc ? (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-100 text-amber-800 border border-amber-200 shrink-0 flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Mẫu</span>
                        </span>
                      ) : (
                        doc.version && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                            {doc.version}
                          </span>
                        )
                      )}
                    </div>
                    {renderStatusBadge(doc.processing_status)}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100">
                    <span>{doc.total_pages || 1} trang • {doc.total_chunks || 0} chunks</span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold border border-slate-200 transition-colors"
                        title="Xem file gốc trong tab mới"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Xem</span>
                      </button>

                      <label 
                        onClick={(e) => e.stopPropagation()} 
                        className="hover:underline cursor-pointer text-[10px] font-semibold text-slate-700 hover:text-slate-900"
                        title="Tải lên phiên bản mới"
                      >
                        <input 
                          type="file" 
                          accept=".pdf,.txt,.csv,.md" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, doc.doc_id)}
                        />
                        <span>Up v2</span>
                      </label>

                      {!isDemoDoc && (
                        <button
                          onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                          disabled={isDeleting}
                          className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
