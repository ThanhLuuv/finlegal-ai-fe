// Custom SSE Hook for Real-time Multi-Agent Thought & Response Streaming

import { useState, useCallback } from 'react';
import { AgentThoughtStep, AuditReport, ChatMessage } from '../types';

export function useSSE(backendUrl = 'https://finlegal-backend.lvthanh-work.workers.dev') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeThoughts, setActiveThoughts] = useState<AgentThoughtStep[]>([]);
  const [latestAuditReport, setLatestAuditReport] = useState<AuditReport | null>(null);

  const sendMessage = useCallback(async (prompt: string, docId?: string, turnstileToken?: string) => {
    if (!prompt.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      content: prompt,
      timestamp: Date.now(),
    };

    const assistantMessageId = crypto.randomUUID();
    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      sender: 'assistant',
      content: '',
      thoughtProcess: [],
      timestamp: Date.now(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, initialAssistantMessage]);
    setIsStreaming(true);
    setActiveThoughts([]);
    setLatestAuditReport(null);

    try {
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json' 
      };

      if (turnstileToken) {
        headers['X-Turnstile-Token'] = turnstileToken;
      }

      const response = await fetch(`${backendUrl}/api/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt, docId }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsedData = JSON.parse(dataStr);

              if (currentEvent === 'thought') {
                const thought = parsedData as AgentThoughtStep;
                setActiveThoughts(prev => [...prev, thought]);
                
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return {
                      ...msg,
                      thoughtProcess: [...(msg.thoughtProcess || []), thought]
                    };
                  }
                  return msg;
                }));
              } else if (currentEvent === 'audit_report') {
                const audit = parsedData as AuditReport;
                setLatestAuditReport(audit);
                
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return { ...msg, auditReport: audit };
                  }
                  return msg;
                }));
              } else if (currentEvent === 'final_answer') {
                const { answer } = parsedData;
                setMessages(prev => prev.map(msg => {
                  if (msg.id === assistantMessageId) {
                    return {
                      ...msg,
                      content: answer,
                      isStreaming: false
                    };
                  }
                  return msg;
                }));
              }
            } catch (err) {
              console.warn('Failed to parse SSE payload:', dataStr);
            }
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === assistantMessageId) {
          return {
            ...msg,
            content: `Error: Unable to connect to FinLegal Engine (${errorMsg}).`,
            isStreaming: false
          };
        }
        return msg;
      }));
    } finally {
      setIsStreaming(false);
    }
  }, [backendUrl, isStreaming]);

  return {
    messages,
    isStreaming,
    activeThoughts,
    latestAuditReport,
    sendMessage
  };
}
