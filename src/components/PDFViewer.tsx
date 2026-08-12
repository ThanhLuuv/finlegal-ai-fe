'use client';

import React, { useEffect, useState } from 'react';
import { DocumentRecord } from '../types';
import { FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

interface PDFViewerProps {
  backendUrl?: string;
  selectedDocId?: string;
  onSelectDoc: (docId: string | undefined) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  backendUrl = 'http://localhost:8787',
  selectedDocId,
  onSelectDoc
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    fetchDocuments();
  }, [backendUrl]);

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
          <FileText className="w-4 h-4 text-slate-700" />
          <span>Danh sách Tài liệu ({documents.length})</span>
        </div>
        <button
          onClick={fetchDocuments}
          className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
          title="Tải lại danh sách"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
        <button
          onClick={() => onSelectDoc(undefined)}
          className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between border ${
            !selectedDocId
              ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-sm'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <span>Tất cả văn bản đã tải lên</span>
          {!selectedDocId && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
        </button>

        {documents.map(doc => {
          const isSelected = selectedDocId === doc.doc_id;
          return (
            <button
              key={doc.doc_id}
              onClick={() => onSelectDoc(doc.doc_id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between border ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white font-medium shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="truncate pr-2">
                <p className="truncate font-medium">{doc.file_name}</p>
                <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  Đã lưu • {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
              {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
