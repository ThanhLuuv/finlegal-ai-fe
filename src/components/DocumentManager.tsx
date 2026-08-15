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
  Search,
  FileUp,
  X,
  Grid
} from 'lucide-react';

interface DocumentManagerProps {
  backendUrl: string;
  selectedDocId?: string;
  onSelectDoc: (docId: string | undefined) => void;
  onDocumentChange?: () => void;
  uploadInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  backendUrl,
  selectedDocId,
  onSelectDoc,
  onDocumentChange,
  uploadInputRef
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
    }, 6000);

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

      if (res.ok && data.success) {
        showToast(data.message || 'Tải lên thành công! Đang bóc tách dữ liệu.');
        await fetchDocuments();
        if (data.docId) onSelectDoc(data.docId);
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
        <div className="w-9 h-9 rounded-lg bg-red-50 text-red-500 border border-red-100 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>PDF</span>
        </div>
      );
    } else if (ext === 'docx' || ext === 'doc') {
      return (
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>DOCX</span>
        </div>
      );
    } else if (ext === 'pptx' || ext === 'ppt') {
      return (
        <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-500 border border-orange-100 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>PPTX</span>
        </div>
      );
    } else if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return (
        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
          <span>XLSX</span>
        </div>
      );
    }

    return (
      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px] uppercase flex flex-col items-center justify-center shrink-0">
        <span>TXT</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
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
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold ${
          statusToast.isError 
            ? 'bg-rose-900 text-white shadow-rose-950/20' 
            : 'bg-slate-900 text-white shadow-slate-950/20'
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

      {/* Sidebar Header Title - Matching Template: Tài liệu */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tài liệu</h2>
        <button
          onClick={fetchDocuments}
          disabled={isLoading}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
          title="Làm mới kho tài liệu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search Input Box - Matching Template */}
      <div className="relative mb-3.5">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm tài liệu..."
          className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* All Documents Active Pill Item - Matching Template */}
      <div 
        onClick={() => onSelectDoc(undefined)}
        className={`mb-4 px-3.5 py-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
          !selectedDocId 
            ? 'bg-blue-50/80 border-blue-200 text-blue-600 font-semibold shadow-2xs' 
            : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50 font-medium'
        }`}
      >
        <div className="flex items-center gap-2.5 text-sm">
          <Layers className={`w-4 h-4 ${!selectedDocId ? 'text-blue-600' : 'text-slate-500'}`} />
          <span>Tất cả tài liệu</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
          !selectedDocId ? 'bg-white border-blue-200 text-blue-600' : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          {documents.length}
        </span>
      </div>

      {/* Demo Seed Button if empty */}
      {documents.length === 0 && (
        <button
          onClick={handleSeedSampleDoc}
          disabled={isSeeding || isUploading}
          className="mb-4 w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-700" />}
          <span>Nạp Hợp Đồng Mẫu Demo</span>
        </button>
      )}

      {/* Document Items List - Matching Template Item Rows */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-1 divide-y divide-slate-100">
        {isLoading && documents.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Đang tải danh sách tài liệu...</span>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
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
                className={`pt-3 pb-3 px-2 rounded-xl transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-blue-50/70 border-l-4 border-blue-600 text-slate-900 font-medium'
                    : 'hover:bg-slate-50/80 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* File Type Color Badge Icon */}
                  {renderFileIcon(doc.file_name)}

                  {/* Document Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 
                        className="font-bold text-sm text-slate-800 truncate group-hover:text-blue-600 transition-colors"
                        title={doc.file_name}
                      >
                        {doc.file_name}
                      </h3>
                      {isDemoDoc && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 text-amber-800 shrink-0">
                          Mẫu
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-normal mt-0.5 flex items-center justify-between">
                      <span>{ext} • {doc.total_pages || 1} MB • {dateStr}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 pl-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                          }}
                          className="hover:text-blue-600 cursor-pointer"
                          title="Xem file gốc"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {!isDemoDoc && (
                          <button
                            onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                            disabled={isDeleting}
                            className="hover:text-rose-600 cursor-pointer"
                            title="Xóa tài liệu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Text - Matching Template: Hiển thị X / Y tài liệu */}
      <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 font-normal px-1 mt-auto">
        Hiển thị {filteredDocs.length} / {documents.length} tài liệu
      </div>
    </div>
  );
};
