'use client';

import React, { useEffect, useState } from 'react';
import { DocumentRecord } from '../types';
import { FileText, RefreshCw, CheckCircle2, Trash2, Loader2 } from 'lucide-react';

interface PDFViewerProps {
  backendUrl?: string;
  selectedDocId?: string;
  onSelectDoc: (docId: string | undefined) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  backendUrl = 'https://finlegal-backend.lvthanh-work.workers.dev',
  selectedDocId,
  onSelectDoc
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/documents`);
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

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering onSelectDoc when clicking delete button
    if (!confirm('Bạn có chắc chắn muốn xóa văn bản này khỏi hệ thống?')) return;

    setDeletingId(docId);
    try {
      const res = await fetch(`${backendUrl}/api/documents/${docId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        if (selectedDocId === docId) {
          onSelectDoc(undefined);
        }
        await fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [backendUrl]);

  return (
    <div className="p-4 rounded-xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
          <FileText className="w-4 h-4 text-[#0B1727]" />
          <span>Danh sách Tài liệu ({documents.length})</span>
        </div>
        <button
          onClick={fetchDocuments}
          className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shadow-2xs"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        <button
          onClick={() => onSelectDoc(undefined)}
          className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
            !selectedDocId
              ? 'bg-[#0B1727] text-white font-semibold shadow-sm'
              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-2xs'
          }`}
        >
          <span>Tất cả văn bản đã tải lên</span>
          {!selectedDocId && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
        </button>

        {documents.map(doc => {
          const isSelected = selectedDocId === doc.doc_id;
          const isDeleting = deletingId === doc.doc_id;

          return (
            <div
              key={doc.doc_id}
              onClick={() => onSelectDoc(doc.doc_id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer group ${
                isSelected
                  ? 'bg-[#0B1727] text-white font-semibold shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 shadow-2xs'
              }`}
            >
              <div className="truncate pr-2 flex-1">
                <p className="truncate font-medium">{doc.file_name}</p>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  Đã lưu • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                <button
                  onClick={(e) => handleDeleteDocument(doc.doc_id, e)}
                  disabled={isDeleting}
                  className={`p-1 rounded hover:bg-rose-500 hover:text-white transition-colors cursor-pointer ${
                    isSelected ? 'text-slate-300' : 'text-slate-400 opacity-60 group-hover:opacity-100'
                  }`}
                  title="Xóa tài liệu này"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
