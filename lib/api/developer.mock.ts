/**
 * Developer Mock Data — System Audit & Monitoring
 */

import { mockDelay } from '@/lib/env';
import type {
  AuditLogEntry, LoginRecord, AIModelCard,
  SystemHealthMetric, DangerZoneInfo, ObservabilitySnapshot,
} from '@/lib/api/developer.service';

// ── Helpers ──

const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const hash = () => Math.random().toString(36).slice(2, 10);
const isoAgo = (minAgo: number) => new Date(Date.now() - minAgo * 60000).toISOString();

const ACTIONS = [
  'auth.login.success', 'auth.login.failure', 'auth.logout',
  'user.create', 'user.update', 'user.delete',
  'checkin.manual', 'checkin.qr', 'checkin.offline_sync',
  'medal.grant', 'progress.update', 'class.start', 'class.end',
  'admin.export_data', 'admin.role_change', 'admin.settings_update',
  'security.mfa_enable', 'security.password_change', 'security.session_revoke',
  'api.rate_limited', 'api.error_500', 'api.timeout',
];

const SEVERITIES: AuditLogEntry['severity'][] = ['INFO', 'INFO', 'INFO', 'WARN', 'ERROR', 'CRITICAL'];
const DEVICES = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro', 'Windows PC', 'iPad Air', 'Pixel 8'];
const OS_LIST = ['iOS 17.4', 'Android 14', 'macOS 14.3', 'Windows 11', 'iPadOS 17'];
const BROWSERS = ['Safari 17', 'Chrome 121', 'Firefox 122', 'Edge 121', 'Samsung Internet'];

// ── Mock generators ──

function generateAuditLogs(count: number): AuditLogEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `LOG_${(1000 - i).toString().padStart(4, '0')}`,
    timestamp: isoAgo(i * 3 + rnd(0, 5)),
    severity: SEVERITIES[rnd(0, SEVERITIES.length - 1)],
    actorHash: hash(),
    action: ACTIONS[rnd(0, ACTIONS.length - 1)],
    ipHash: `${hash().slice(0, 4)}:***:${hash().slice(0, 4)}`,
    deviceFingerprint: hash(),
    metadata: i % 3 === 0 ? { endpoint: `/api/v1/${ACTIONS[rnd(0, 5)].split('.')[0]}` } : undefined,
  }));
}

function generateLoginRecords(count: number): LoginRecord[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `LOGIN_${(500 - i).toString().padStart(4, '0')}`,
    timestamp: isoAgo(i * 8 + rnd(0, 10)),
    userHash: hash(),
    deviceType: DEVICES[rnd(0, DEVICES.length - 1)],
    os: OS_LIST[rnd(0, OS_LIST.length - 1)],
    browser: BROWSERS[rnd(0, BROWSERS.length - 1)],
    ipHash: `${rnd(100, 200)}.***.***.${rnd(1, 254)}`,
    success: i % 7 !== 0,
    failReason: i % 7 === 0 ? ['invalid_password', 'account_locked', 'mfa_timeout'][rnd(0, 2)] : undefined,
  }));
}

// ── Exports ──

export async function mockGetAuditLogs(page: number, severity?: string) {
  await mockDelay(300);
  let logs = generateAuditLogs(200);
  if (severity && severity !== 'ALL') {
    logs = logs.filter((l) => l.severity === severity);
  }
  const start = (page - 1) * 20;
  return { logs: logs.slice(start, start + 20), total: logs.length };
}

export async function mockGetLoginRecords(page: number) {
  await mockDelay(250);
  const records = generateLoginRecords(100);
  const start = (page - 1) * 15;
  return { records: records.slice(start, start + 15), total: records.length };
}

export async function mockGetAIModels(): Promise<AIModelCard[]> {
  await mockDelay(400);
  return [
    {
      id: 'ai-gpt4o', name: 'GPT-4o', provider: 'OpenAI', purpose: 'Análise Pedagógica',
      status: 'ONLINE', latencyMs: 1240, successRate: 98.7, failureRate: 1.3,
      lastChecked: isoAgo(2),
    },
    {
      id: 'ai-whisper', name: 'Whisper v3', provider: 'OpenAI', purpose: 'Transcrição de Áudio',
      status: 'ONLINE', latencyMs: 3200, successRate: 96.2, failureRate: 3.8,
      lastChecked: isoAgo(5),
    },
    {
      id: 'ai-rag', name: 'RAG Engine', provider: 'Internal', purpose: 'Base de Conhecimento',
      status: 'DEGRADED', latencyMs: 890, successRate: 91.4, failureRate: 8.6,
      lastError: 'Vector DB connection timeout (2x in last hour)',
      lastChecked: isoAgo(1),
    },
    {
      id: 'ai-embedding', name: 'text-embedding-3', provider: 'OpenAI', purpose: 'Embeddings de Conteúdo',
      status: 'ONLINE', latencyMs: 180, successRate: 99.9, failureRate: 0.1,
      lastChecked: isoAgo(3),
    },
    {
      id: 'ai-moderation', name: 'Content Moderation', provider: 'Internal', purpose: 'Moderação de Chat',
      status: 'MAINTENANCE', latencyMs: 0, successRate: 0, failureRate: 0,
      lastError: 'Scheduled maintenance — model retraining',
      lastChecked: isoAgo(60),
    },
  ];
}

export async function mockGetSystemHealth(): Promise<SystemHealthMetric[]> {
  await mockDelay(200);
  return [
    { name: 'CPU Usage', value: rnd(15, 45), unit: '%', status: 'healthy', trend: 'stable' },
    { name: 'Memory', value: rnd(55, 75), unit: '%', status: rnd(0, 1) ? 'healthy' : 'warning', trend: 'up' },
    { name: 'Disk', value: rnd(30, 50), unit: '%', status: 'healthy', trend: 'stable' },
    { name: 'DB Connections', value: rnd(20, 80), unit: '/100', status: rnd(0, 3) === 0 ? 'warning' : 'healthy', trend: 'stable' },
    { name: 'Cache Hit Rate', value: rnd(85, 99), unit: '%', status: 'healthy', trend: 'up' },
    { name: 'Error Rate', value: parseFloat((Math.random() * 2).toFixed(2)), unit: '%', status: 'healthy', trend: 'down' },
    { name: 'Avg Latency', value: rnd(80, 250), unit: 'ms', status: rnd(0, 2) === 0 ? 'warning' : 'healthy', trend: 'stable' },
    { name: 'Active Sessions', value: rnd(120, 350), unit: '', status: 'healthy', trend: 'up' },
  ];
}

export async function mockGetDangerZoneInfo(): Promise<DangerZoneInfo> {
  await mockDelay(150);
  return {
    commitHash: 'a3f7b2c',
    deployDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    environment: 'production',
    maintenanceMode: false,
    activeSessions: rnd(120, 350),
    nodeVersion: 'v20.11.0',
    nextVersion: '14.2.35',
  };
}

export async function mockGetObservability(): Promise<ObservabilitySnapshot> {
  await mockDelay(250);
  return {
    requestsPerMinute: rnd(80, 200),
    avgLatencyMs: rnd(80, 250),
    errorRate: parseFloat((Math.random() * 3).toFixed(2)),
    p95LatencyMs: rnd(200, 500),
    p99LatencyMs: rnd(500, 1500),
    activeConnections: rnd(50, 150),
    cacheHitRate: rnd(85, 99),
    anomaliesLast24h: rnd(0, 5),
  };
}
