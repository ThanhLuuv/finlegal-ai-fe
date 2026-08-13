// Shared Types for Frontend UI & Multi-Agent Communication

export type AgentRole = 'SUPERVISOR' | 'RAG_AGENT' | 'SQL_AGENT' | 'AUDITOR';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';

export interface AgentThoughtStep {
  agent: AgentRole;
  status: 'THINKING' | 'EXECUTING' | 'DONE' | 'ERROR';
  thought: string;
  data?: unknown;
  timestamp: number;
}

export interface AuditReport {
  discrepancyFound: boolean;
  pdfClaim: string;
  dbRecord: string;
  varianceUsd?: number;
  variancePercentage?: number;
  riskLevel: RiskLevel;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  thoughtProcess?: AgentThoughtStep[];
  auditReport?: AuditReport;
  timestamp: number;
  isStreaming?: boolean;
}

export interface DocumentRecord {
  doc_id: string;
  file_name: string;
  user_id?: string;
  version?: string;
  is_active?: number;
  total_pages: number;
  total_chunks: number;
  processing_status?: string;
  created_at: string;
}

