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
  X
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
    showToast(targetDocIdForVersion ? 'Đang tải lên và tạo phiên bản mới...' : 'Đang tải file lên...');

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

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Sẵn sàng</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>Lỗi</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
            <span>{status || 'Xử lý...'}</span>
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 relative">
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

      {/* Upload Box */}
      <div className="p-4 rounded-2xl bg-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span>Nạp Tài Liệu Hợp Đồng</span>
          </div>
          <button
            onClick={fetchDocuments}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <label className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-all cursor-pointer text-center group">
          <input
            type="file"
            accept=".pdf,.docx,.txt,.csv,.md"
            onChange={(e) => handleFileUpload(e)}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Đang nạp dữ liệu...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 py-1">
              <div className="p-2 rounded-xl bg-white text-slate-500 group-hover:text-blue-600 shadow-2xs transition-all">
                <UploadCloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">Tải lên file mới</span>
              <span className="text-[10px] text-slate-400">PDF, DOCX, TXT, CSV, MD (Tối đa 25MB)</span>
            </div>
          )}
        </label>

        {/* Demo Seed Sample Document Trigger */}
        <button
          onClick={handleSeedSampleDoc}
          disabled={isSeeding || isUploading}
          className="w-full py-2 px-3 rounded-xl bg-amber-50/80 hover:bg-amber-100/90 text-amber-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
        >
          {isSeeding ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          )}
          <span>Nạp Hợp Đồng Mẫu Demo</span>
        </button>
      </div>

      {/* Document List */}
      <div className="p-4 rounded-2xl bg-white shadow-sm space-y-3">
        <div className="flex items-center justify-between text-slate-900 font-bold text-xs">
          <span>Kho Văn Bản ({filteredDocs.length})</span>
          {selectedDocId && (
            <button
              onClick={() => onSelectDoc(undefined)}
              className="text-[10px] text-slate-500 hover:text-blue-600 font-medium cursor-pointer"
            >
              Bỏ chọn
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên văn bản..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:shadow-xs transition-all"
          />
        </div>

        {/* List Items */}
        <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
          {isLoading && documents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
              <span>Đang tải danh sách...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
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
                  className={`p-3 rounded-xl transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-blue-50/80 text-slate-900 shadow-2xs'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-700'
                  }`}
                >
                  {/* Top Row: Icon + Filename + Version + Status Badge */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200/70 text-slate-600'}`}>
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectDoc(doc.doc_id);
                              window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                            }}
                            className="font-bold text-xs truncate text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                            title={doc.file_name}
                          >
                            {doc.file_name}
                          </span>
                          {isDemoDoc ? (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 text-amber-800 shrink-0 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Mẫu</span>
                            </span>
                          ) : (
                            doc.version && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-slate-200/70 text-slate-600 shrink-0">
                                {doc.version}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                    {renderStatusBadge(doc.processing_status)}
                  </div>

                  {/* Bottom Row: Metadata Info + Clean Action Controls */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1.5">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {doc.total_pages || 1} trang • {doc.total_chunks || 0} chunks
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* View Original File */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`${backendUrl}/api/documents/${doc.doc_id}/view`, '_blank');
                        }}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white hover:bg-slate-200/70 text-slate-700 text-[10px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Xem file gốc trong tab mới"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>Xem</span>
                      </button>

                      {/* Up v2 Upload */}
                      <label 
                        onClick={(e) => e.stopPropagation()} 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-100/80 hover:bg-blue-200 text-blue-800 text-[10px] font-semibold transition-all cursor-pointer shadow-2xs"
                        title="Tải lên phiên bản mới (Up v2)"
                      >
                        <input 
                          type="file" 
                          accept=".pdf,.docx,.txt,.csv,.md" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, doc.doc_id)}
                        />
                        <FileUp className="w-3 h-3 text-blue-600" />
                        <span>Up v2</span>
                      </label>

                      {/* Delete */}
                      {!isDemoDoc && (
                        <button
                          onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                          disabled={isDeleting}
                          className="p-1 rounded-lg hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                          title="Xóa tài liệu"
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin text-rose-500" /> : <Trash2 className="w-3 h-3" />}
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
