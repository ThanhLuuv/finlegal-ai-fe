'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSSE } from '../hooks/useSSE';
import { Header } from '../components/Header';
import { SecurityGate } from '../components/SecurityGate';
import { TerminalAppConsole } from '../components/TerminalAppConsole';
import { TerminalConsoleModal } from '../components/TerminalConsoleModal';
import { SystemLog } from '../types';

export default function HomePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finlegal-backend.lvthanh-work.workers.dev';
  const { messages, isStreaming, activeThoughts, sendMessage } = useSSE(backendUrl);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: 'init_1',
      timestamp: new Date().toLocaleTimeString(),
      category: 'SYSTEM',
      level: 'SUCCESS',
      message: 'FinLegal Edge Engine v4.0 (Cloudflare Worker + Vectorize + D1 + R2) initialized.'
    },
    {
      id: 'init_2',
      timestamp: new Date().toLocaleTimeString(),
      category: 'DEEPSEEK',
      level: 'INFO',
      message: 'Primary LLM Engine online: DeepSeek-v4-Flash (sk-0e39... API connected).'
    }
  ]);

  const [isVerified, setIsVerified] = useState(false);
  const [isTurnstilePassed, setIsTurnstilePassed] = useState(false);

  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).onTurnstileSuccess = (_token: string) => {
        setIsTurnstilePassed(true);
        setTimeout(() => {
          setIsVerified(true);
        }, 600);
      };

      (window as any).onTurnstileExpired = () => {
        setIsTurnstilePassed(false);
      };

      (window as any).onTurnstileError = () => {
        setIsTurnstilePassed(false);
      };
    }
  }, []);

  if (!isVerified) {
    return (
      <SecurityGate 
        isTurnstilePassed={isTurnstilePassed} 
        onTurnstileSuccess={() => setIsVerified(true)} 
      />
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header 
        onOpenLogs={() => setIsTerminalModalOpen(true)} 
        onUploadClick={() => uploadInputRef.current?.click()}
      />

      {/* Main Single Terminal Workspace Screen */}
      <div className="flex-1 p-3 sm:p-5 bg-[#f8fafc] overflow-hidden flex flex-col">
        <TerminalAppConsole
          backendUrl={backendUrl}
          messages={messages}
          isStreaming={isStreaming}
          activeThoughts={activeThoughts}
          onSendMessage={(prompt, docId) => sendMessage(prompt, docId)}
          uploadInputRef={uploadInputRef}
        />
      </div>

      {/* Full Developer Terminal Logs Modal */}
      <TerminalConsoleModal
        isOpen={isTerminalModalOpen}
        onClose={() => setIsTerminalModalOpen(false)}
        logs={systemLogs}
        onClearLogs={() => setSystemLogs([])}
      />
    </div>
  );
}
