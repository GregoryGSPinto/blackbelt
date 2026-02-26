/**
 * Developer Service — System Audit & Monitoring
 *
 * Endpoints exclusivos para SYS_AUDITOR.
 * Sem acesso a dados pedagógicos, financeiros ou de conteúdo.
 *
 * TODO(BE-040): POST /dev/audit/query
 * TODO(BE-041): GET  /dev/logins?page=N
 * TODO(BE-042): GET  /dev/ai/models
 * TODO(BE-043): POST /dev/danger/force-logout
 * TODO(BE-044): POST /dev/danger/maintenance
 * TODO(BE-045): GET  /dev/observability/metrics
 */

import { useMock, mockDelay } from '@/lib/env';

// ============================================================
// DTOs
// ============================================================

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  actorHash: string;
  action: string;
  ipHash: string;
  deviceFingerprint: string;
  metadata?: Record<string, string>;
}

export interface LoginRecord {
  id: string;
  timestamp: string;
  userHash: string;
  deviceType: string;
  os: string;
  browser: string;
  ipHash: string;
  success: boolean;
  failReason?: string;
}

export interface AIModelCard {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
  latencyMs: number;
  successRate: number;
  failureRate: number;
  lastError?: string;
  lastChecked: string;
}

export interface SystemHealthMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface DangerZoneInfo {
  commitHash: string;
  deployDate: string;
  environment: string;
  maintenanceMode: boolean;
  activeSessions: number;
  nodeVersion: string;
  nextVersion: string;
}

export interface ObservabilitySnapshot {
  requestsPerMinute: number;
  avgLatencyMs: number;
  errorRate: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  activeConnections: number;
  cacheHitRate: number;
  anomaliesLast24h: number;
}

// ============================================================
// API
// ============================================================

export async function getAuditLogs(page: number = 1, severity?: string): Promise<{ logs: AuditLogEntry[]; total: number }> {
  if (useMock()) {
    const { mockGetAuditLogs } = await import('./developer.mock');
    return mockGetAuditLogs(page, severity);
  }
  throw new Error('Backend not connected');
}

export async function getLoginRecords(page: number = 1): Promise<{ records: LoginRecord[]; total: number }> {
  if (useMock()) {
    const { mockGetLoginRecords } = await import('./developer.mock');
    return mockGetLoginRecords(page);
  }
  throw new Error('Backend not connected');
}

export async function getAIModels(): Promise<AIModelCard[]> {
  if (useMock()) {
    const { mockGetAIModels } = await import('./developer.mock');
    return mockGetAIModels();
  }
  throw new Error('Backend not connected');
}

export async function getSystemHealth(): Promise<SystemHealthMetric[]> {
  if (useMock()) {
    const { mockGetSystemHealth } = await import('./developer.mock');
    return mockGetSystemHealth();
  }
  throw new Error('Backend not connected');
}

export async function getDangerZoneInfo(): Promise<DangerZoneInfo> {
  if (useMock()) {
    const { mockGetDangerZoneInfo } = await import('./developer.mock');
    return mockGetDangerZoneInfo();
  }
  throw new Error('Backend not connected');
}

export async function getObservability(): Promise<ObservabilitySnapshot> {
  if (useMock()) {
    const { mockGetObservability } = await import('./developer.mock');
    return mockGetObservability();
  }
  throw new Error('Backend not connected');
}

export async function forceLogoutAll(): Promise<{ affected: number }> {
  if (useMock()) {
    await mockDelay(800);
    return { affected: Math.floor(Math.random() * 50) + 10 };
  }
  throw new Error('Backend not connected');
}

export async function toggleMaintenanceMode(enabled: boolean): Promise<{ success: boolean }> {
  if (useMock()) {
    await mockDelay(500);
    return { success: true };
  }
  throw new Error('Backend not connected');
}
