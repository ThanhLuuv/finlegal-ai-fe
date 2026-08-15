'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Terminal as TerminalIcon, 
  Upload, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  FileText, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check 
} from 'lucide-react';
import { ChatMessage, DocumentRecord, AgentThoughtStep } from '../types';

interface TerminalAppConsoleProps {
  backendUrl: string;
  messages: ChatMessage[];
  isStreaming: boolean;
  activeThoughts: AgentThoughtStep[];
  onSendMessage: (prompt: string, docId?: string) => void;
  uploadInputRef: React.RefObject<HTMLInputElement | null>;
  onDocumentChange?: () => void;
}

export const TerminalAppConsole: React.FC<TerminalAppConsoleProps> = ({
  backendUrl,
  messages,
  isStreaming,
  activeThoughts,
  onSendMessage,
  uploadInputRef,
  onDocumentChange
}) => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [inputPrompt, setInputPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Real-time Terminal Log Stream State
  const [terminalLogs, setTerminalLogs] = useState<Array<{
    id: string;
    timestamp: string;
    type: 'CMD' | 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM' | 'PROGRESS';
    text: string;
    details?: any;
  }>>([
    {
      id: 'log_0',
      timestamp: new Date().toLocaleTimeString(),
      type: 'SYSTEM',
      text: 'FinLegal Enterprise Engine v4.0 (Cloudflare Edge Worker + DeepSeek-v4-Flash) Online.'
    },
    {
      id: 'log_1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'INFO',
      text: 'Type a query or click "Tải tài liệu mới" to initiate real-time ingestion pipeline.'
    }
  ]);

  const [activeIngestion, setActiveIngestion] = useState<{
    fileName: string;
    status: string;
    progress: number;
    totalPages?: number;
    totalChunks?: number;
  } | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, messages, isStreaming, activeIngestion]);

  const addTerminalLog = (type: 'CMD' | 'INFO' | 'SUCCESS' | 'ERROR' | 'SYSTEM' | 'PROGRESS', text: string, details?: any) => {
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `log_${Date.now()}_${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        text,
        details
      }
    ]);
  };

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/documents`, {
        headers: { 'x-tenant-id': 'tenant_default', 'x-user-id': 'user_default' }
      });
      if (res.ok) {
        const data = await res.json() as { documents: DocumentRecord[] };
        setDocuments(data.documents || []);
      }
    } catch {}
  };

  useEffect(() => {
    fetchDocuments();
  }, [backendUrl]);

  // Sync active thoughts into terminal stream
  useEffect(() => {
    if (activeThoughts && activeThoughts.length > 0) {
      const t = activeThoughts[activeThoughts.length - 1];
      addTerminalLog('PROGRESS', `[${t.agent}] ${t.thought}`, t.data);
    }
  }, [activeThoughts]);

  // Handle File Upload with Live Terminal Logs
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    addTerminalLog('CMD', `./upload_document --filename "${file.name}" --size "${(file.size / 1024).toFixed(1)} KB"`);
    addTerminalLog('INFO', `[1/5 UPLOAD] Storing binary file to Cloudflare R2 bucket...`);

    setActiveIngestion({
      fileName: file.name,
      status: 'UPLOADED',
      progress: 20
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${backendUrl}/api/documents`, {
        method: 'POST',
        headers: { 'x-tenant-id': 'tenant_default', 'x-user-id': 'user_default' },
        body: formData
      });

      const data = await res.json() as { success: boolean; docId?: string; error?: string };

      if (res.ok && data.success && data.docId) {
        const docId = data.docId;
        setSelectedDocId(docId);
        addTerminalLog('SUCCESS', `[2/5 STATE] Initialized D1 database record (docId: ${docId})`);
        
        // Start Live Polling Ingestion Status
        startStatusPolling(docId, file.name);
      } else {
        addTerminalLog('ERROR', `Upload failed: ${data.error || 'Unknown error'}`);
        setActiveIngestion(null);
      }
    } catch (err) {
      addTerminalLog('ERROR', `Network error during file upload: ${String(err)}`);
      setActiveIngestion(null);
    } finally {
      setIsUploading(false);
      if (event.target) event.target.value = '';
    }
  };

  const startStatusPolling = (docId: string, fileName: string) => {
    const seen = new Set(['UPLOADED']);
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${backendUrl}/api/documents/${docId}/status`);
        if (res.ok) {
          const st = await res.json() as {
            status: string;
            totalPages: number;
            totalChunks: number;
            isReady: boolean;
          };

          const s = st.status || 'UPLOADED';
          let pct = 25;

          if (!seen.has(s)) {
            seen.add(s);
            if (s === 'PARSING') {
              pct = 40;
              addTerminalLog('PROGRESS', `[3/5 PARSING] Universal Fast-Path Parser (Extracting text & structure)...`);
            } else if (s === 'CHUNKING') {
              pct = 65;
              addTerminalLog('PROGRESS', `[4/5 CHUNKING] Structure-Aware Splitter (Target 700 tokens, overlap 135)...`);
            } else if (s === 'EMBEDDING' || s === 'INDEXING') {
              pct = 85;
              addTerminalLog('PROGRESS', `[5/5 EMBEDDING] Workers AI BGE-M3 768-dim embeddings & Vectorize sync...`);
            } else if (s === 'READY') {
              pct = 100;
              addTerminalLog('SUCCESS', `[COMPLETE] File ingestion READY! Generated ${st.totalChunks || 0} chunks across ${st.totalPages || 1} pages.`);
            }
          }

          setActiveIngestion({
            fileName,
            status: s,
            progress: pct,
            totalPages: st.totalPages,
            totalChunks: st.totalChunks
          });

          if (st.isReady || s === 'FAILED') {
            clearInterval(interval);
            fetchDocuments();
            if (onDocumentChange) onDocumentChange();
            setTimeout(() => setActiveIngestion(null), 5000);
          }
        }
      } catch {}
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isStreaming) return;
    const prompt = inputPrompt;
    setInputPrompt('');

    addTerminalLog('CMD', `./query_engine --prompt "${prompt}" ${selectedDocId ? `--target_doc "${selectedDocId}"` : '--scope ALL'}`);
    onSendMessage(prompt, selectedDocId);
  };

  const handleCopyLogs = () => {
    const text = terminalLogs.map(l => `[${l.timestamp}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDocName = documents.find(d => d.doc_id === selectedDocId)?.file_name;

  return (
    <div className="flex flex-col h-full bg-[#070b14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs text-slate-100">
      
      {/* Hidden File Input */}
      <input
        type="file"
        ref={uploadInputRef as any}
        accept=".pdf,.docx,.txt,.csv,.md"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="hidden"
      />

      {/* Linux Terminal Header Bar */}
      <div className="h-11 px-4 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <TerminalIcon className="w-4 h-4 text-cyan-400" />
            <span>root@lexifin-engine:~/rag-pipeline#</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Target Scope Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#03050a] border border-slate-800 text-[11px]">
            <span className="text-slate-500">Scope:</span>
            <select
              value={selectedDocId || ''}
              onChange={(e) => setSelectedDocId(e.target.value || undefined)}
              className="bg-transparent text-cyan-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#090d18] text-slate-200">Tất cả tài liệu ({documents.length})</option>
              {documents.map(d => (
                <option key={d.doc_id} value={d.doc_id} className="bg-[#090d18] text-slate-200">
                  {d.file_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => uploadInputRef.current?.click()}
            disabled={isUploading}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            <span>Tải tài liệu mới</span>
          </button>

          <button
            onClick={handleCopyLogs}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Sao chép log"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Terminal Output Console Stream Screen */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#04060c] font-mono leading-relaxed">
        
        {/* Active Ingestion Live Progress ASCII Card */}
        {activeIngestion && (
          <div className="p-3.5 rounded-xl border border-cyan-800/80 bg-[#090e1c] text-cyan-300 space-y-2 shadow-xl">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>INGESTION PIPELINE // {activeIngestion.fileName}</span>
              <span className="text-emerald-400">{activeIngestion.status}... {activeIngestion.progress}%</span>
            </div>
            
            {/* ASCII Progress Bar */}
            <div className="p-1.5 rounded bg-[#020408] border border-slate-800 text-[11px] text-cyan-400 tracking-wider">
              [{'='.repeat(Math.max(0, Math.round((activeIngestion.progress / 100) * 20) - 1))}&gt;
              {' '.repeat(Math.max(0, 20 - Math.round((activeIngestion.progress / 100) * 20)))}] {activeIngestion.progress}%
            </div>
          </div>
        )}

        {/* Live Terminal Log History */}
        {terminalLogs.map((log) => (
          <div key={log.id} className="flex items-start gap-2">
            <span className="text-slate-500 text-[10.5px] shrink-0 pt-0.5 select-none">[{log.timestamp}]</span>
            
            {log.type === 'CMD' && (
              <div className="text-cyan-400 font-bold flex items-start gap-1.5">
                <span className="text-emerald-400 select-none">$</span>
                <span>{log.text}</span>
              </div>
            )}

            {log.type === 'INFO' && <div className="text-slate-300">{log.text}</div>}
            {log.type === 'PROGRESS' && <div className="text-amber-300 font-medium">{log.text}</div>}
            {log.type === 'SUCCESS' && <div className="text-emerald-400 font-bold">{log.text}</div>}
            {log.type === 'ERROR' && <div className="text-rose-400 font-bold">{log.text}</div>}
            {log.type === 'SYSTEM' && <div className="text-purple-400 font-semibold">{log.text}</div>}
          </div>
        ))}

        {/* Chat Message History Rendered as Terminal Execution Output */}
        {messages.map((msg) => (
          <div key={msg.id} className="my-3 p-3.5 rounded-xl border border-slate-800/90 bg-[#080d19] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5">
              <span className="font-bold text-cyan-400">
                {msg.sender === 'user' ? 'USER_PROMPT' : 'DEEPSEEK_V4_RESPONSE'}
              </span>
              <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>

            {msg.sender === 'user' ? (
              <div className="text-slate-100 font-sans text-xs">
                <span className="text-cyan-400 font-bold font-mono">$ </span>
                {msg.content}
              </div>
            ) : (
              <div className="space-y-2 font-sans text-xs text-slate-200">
                {msg.content ? (
                  <div className="prose prose-invert prose-xs max-w-none prose-p:leading-relaxed prose-strong:text-cyan-300">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.isStreaming && (
                    <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                      <span>Đang bóc tách và tổng hợp câu trả lời...</span>
                    </div>
                  )
                )}

                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1 font-mono text-[10px]">
                    <span className="text-slate-500">GROUNDING:</span>
                    {msg.sources.map((s, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-700">
                        {s.displayLabel}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        <div ref={logsEndRef} />
      </div>

      {/* Terminal Input Prompt Bar */}
      <form onSubmit={handleSubmit} className="h-14 px-4 bg-[#090e1c] border-t border-slate-800 flex items-center gap-3">
        <span className="text-emerald-400 font-bold text-sm select-none">root@lexifin:~$</span>
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Nhập câu hỏi tra cứu tài liệu..."
          disabled={isStreaming}
          className="flex-1 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || isStreaming}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>EXECUTE</span>
        </button>
      </form>

    </div>
  );
};
