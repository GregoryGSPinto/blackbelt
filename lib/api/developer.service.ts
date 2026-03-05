/**
 * Developer Service — System Audit & Monitoring
 *
 * Endpoints exclusivos para SYS_AUDITOR.
 * Sem acesso a dados pedagógicos, financeiros ou de conteúdo.
 */

import { apiClient } from './client';
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
  const params = new URLSearchParams({ view: 'audit', page: String(page) });
  if (severity) params.set('severity', severity);
  const { data } = await apiClient.get<{ logs: AuditLogEntry[]; total: number }>(`/developer?${params}`);
  return data;
}

export async function getLoginRecords(page: number = 1): Promise<{ records: LoginRecord[]; total: number }> {
  if (useMock()) {
    const { mockGetLoginRecords } = await import('./developer.mock');
    return mockGetLoginRecords(page);
  }
  const { data } = await apiClient.get<{ records: LoginRecord[]; total: number }>(`/developer?view=logins&page=${page}`);
  return data;
}

export async function getAIModels(): Promise<AIModelCard[]> {
  if (useMock()) {
    const { mockGetAIModels } = await import('./developer.mock');
    return mockGetAIModels();
  }
  const { data } = await apiClient.get<AIModelCard[]>('/developer?view=ai-models');
  return data;
}

export async function getSystemHealth(): Promise<SystemHealthMetric[]> {
  if (useMock()) {
    const { mockGetSystemHealth } = await import('./developer.mock');
    return mockGetSystemHealth();
  }
  const { data } = await apiClient.get<SystemHealthMetric[]>('/developer?view=health');
  return data;
}

export async function getDangerZoneInfo(): Promise<DangerZoneInfo> {
  if (useMock()) {
    const { mockGetDangerZoneInfo } = await import('./developer.mock');
    return mockGetDangerZoneInfo();
  }
  const { data } = await apiClient.get<DangerZoneInfo>('/developer?view=danger-zone');
  return data;
}

export async function getObservability(): Promise<ObservabilitySnapshot> {
  if (useMock()) {
    const { mockGetObservability } = await import('./developer.mock');
    return mockGetObservability();
  }
  const { data } = await apiClient.get<ObservabilitySnapshot>('/developer?view=observability');
  return data;
}

export async function forceLogoutAll(): Promise<{ affected: number }> {
  if (useMock()) {
    await mockDelay(800);
    return { affected: Math.floor(Math.random() * 50) + 10 };
  }
  const { data } = await apiClient.post<{ affected: number }>('/developer', { action: 'force-logout' });
  return data;
}

export async function toggleMaintenanceMode(enabled: boolean): Promise<{ success: boolean }> {
  if (useMock()) {
    await mockDelay(500);
    return { success: true };
  }
  const { data } = await apiClient.post<{ success: boolean }>('/developer', { action: 'maintenance', enabled });
  return data;
}
