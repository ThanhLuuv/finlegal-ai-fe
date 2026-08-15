// Shared Types for Frontend UI & Multi-Agent Communication

export type AgentRole = 'SUPERVISOR' | 'RAG_AGENT' | 'SQL_AGENT' | 'AUDITOR';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'NONE';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'EXEC';
export type LogCategory = 'SYSTEM' | 'INGESTION' | 'VECTORIZE' | 'D1_SQL' | 'RERANK' | 'DEEPSEEK';

export interface SystemLog {
  id: string;
  timestamp: string;
  category: LogCategory;
  level: LogLevel;
  message: string;
  details?: any;
}

export interface FormattedSourceLocation {
  displayLabel: string;
  documentName: string;
  sourceType: string;
  sectionTitle?: string;
  pageStart?: number;
  pageEnd?: number;
  slideNumber?: number;
  sheetName?: string;
  cellRange?: string;
}

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
  sources?: FormattedSourceLocation[];
  timestamp: number;
  isStreaming?: boolean;
}

export interface DocumentRecord {
  doc_id: string;
  file_name: string;
  tenant_id?: string;
  user_id?: string;
  version?: string;
  is_active?: number;
  total_pages: number;
  total_chunks: number;
  processing_status?: 'UPLOADING' | 'UPLOADED' | 'PARSING' | 'EXTRACTING' | 'STRUCTURING' | 'CHUNKING' | 'EMBEDDING' | 'INDEXING' | 'READY' | 'FAILED' | 'DELETING' | 'DELETED' | string;
  created_at: string;
}
