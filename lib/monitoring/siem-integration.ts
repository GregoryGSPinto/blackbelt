/**
 * BLACKBELT — SIEM Integration Layer
 * Fase 2: Fortalecimento
 *
 * Ships structured logs to external SIEM systems.
 * Supports: CloudWatch, Datadog, ELK/OpenSearch, Grafana Loki.
 *
 * Architecture:
 *   structured-logger.ts → siem-integration.ts → External SIEM
 *                                ↓
 *                          batch + retry + format adapters
 *
 * Integra com: lib/monitoring/structured-logger.ts (getRecentLogs, flush)
 * Referência: BE-027 (log shipping)
 */

import { logger } from '@/lib/logger';

// ============================================================
// TYPES
// ============================================================

export type SIEMProvider = 'cloudwatch' | 'datadog' | 'elk' | 'loki' | 'stdout';

export interface SIEMConfig {
  provider: SIEMProvider;
  /** Endpoint URL (ex: https://logs.datadoghq.com/v1/input) */
  endpoint: string;
  /** API key or auth token */
  apiKey: string;
  /** CloudWatch: log group name. Datadog: service tag. ELK: index. Loki: job label. */
  target: string;
  /** Batch size before flush (default: 50) */
  batchSize: number;
  /** Flush interval in ms (default: 10_000) */
  flushIntervalMs: number;
  /** Max retries on failure (default: 3) */
  maxRetries: number;
  /** Retry backoff base in ms (default: 1000) */
  retryBackoffMs: number;
  /** Include hostname in logs */
  hostname: string;
  /** Environment tag */
  environment: 'production' | 'staging' | 'development';
}

export interface SIEMLogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  context: Record<string, unknown>;
  traceId?: string;
  unitId?: string;
  environment: string;
  hostname: string;
  service: string;
}

interface ShipmentResult {
  success: boolean;
  entriesShipped: number;
  provider: SIEMProvider;
  error?: string;
  retries: number;
  durationMs: number;
}

// ============================================================
// DEFAULT CONFIG
// ============================================================

const DEFAULT_CONFIG: SIEMConfig = {
  provider: 'stdout',
  endpoint: '',
  apiKey: '',
  target: 'blackbelt',
  batchSize: 50,
  flushIntervalMs: 10_000,
  maxRetries: 3,
  retryBackoffMs: 1000,
  hostname: typeof window !== 'undefined' ? 'browser' : 'server',
  environment: (process.env.NODE_ENV as SIEMConfig['environment']) || 'development',
};

// ============================================================
// FORMAT ADAPTERS
// ============================================================

function formatForCloudWatch(entries: SIEMLogEntry[], config: SIEMConfig): object {
  return {
    logGroupName: config.target,
    logStreamName: `${config.hostname}-${new Date().toISOString().split('T')[0]}`,
    logEvents: entries.map(e => ({
      timestamp: new Date(e.timestamp).getTime(),
      message: JSON.stringify(e),
    })),
  };
}

function formatForDatadog(entries: SIEMLogEntry[], config: SIEMConfig): object[] {
  return entries.map(e => ({
    ddsource: 'nodejs',
    ddtags: `env:${config.environment},service:${config.target},unit:${e.unitId || 'global'}`,
    hostname: config.hostname,
    message: e.message,
    service: config.target,
    status: e.level,
    ...e.context,
    timestamp: e.timestamp,
    traceId: e.traceId,
    category: e.category,
  }));
}

function formatForELK(entries: SIEMLogEntry[], config: SIEMConfig): string {
  // NDJSON bulk format for Elasticsearch
  return entries.map(e => {
    const meta = JSON.stringify({ index: { _index: `${config.target}-${new Date().toISOString().split('T')[0]}` } });
    const doc = JSON.stringify({
      '@timestamp': e.timestamp,
      level: e.level,
      category: e.category,
      message: e.message,
      host: { name: config.hostname },
      service: { name: config.target },
      environment: config.environment,
      trace: { id: e.traceId },
      blackbelt: { unitId: e.unitId, ...e.context },
    });
    return `${meta}\n${doc}`;
  }).join('\n') + '\n';
}

function formatForLoki(entries: SIEMLogEntry[], config: SIEMConfig): object {
  // Group by category for Loki stream labels
  const streams: Record<string, Array<[string, string]>> = {};
  for (const e of entries) {
    const key = `${e.category}_${e.level}`;
    if (!streams[key]) streams[key] = [];
    streams[key].push([
      String(new Date(e.timestamp).getTime() * 1_000_000), // Nanoseconds
      JSON.stringify(e),
    ]);
  }

  return {
    streams: Object.entries(streams).map(([key, values]) => {
      const [category, level] = key.split('_');
      return {
        stream: {
          job: config.target,
          environment: config.environment,
          host: config.hostname,
          category,
          level,
        },
        values,
      };
    }),
  };
}

// ============================================================
// SIEM SHIPPER
// ============================================================

let _config: SIEMConfig = { ...DEFAULT_CONFIG };
let _buffer: SIEMLogEntry[] = [];
let _flushTimer: ReturnType<typeof setInterval> | null = null;
let _shipmentStats = { total: 0, success: 0, failed: 0, retries: 0 };

/**
 * Initialize SIEM integration with config.
 * Call once at app startup.
 */
export function initSIEM(config: Partial<SIEMConfig>): void {
  _config = { ...DEFAULT_CONFIG, ...config };

  // Start periodic flush
  if (_flushTimer) clearInterval(_flushTimer);
  _flushTimer = setInterval(() => {
    if (_buffer.length > 0) flushToSIEM();
  }, _config.flushIntervalMs);

  logger.debug(`[SIEM] Initialized: provider=${_config.provider}, target=${_config.target}, batchSize=${_config.batchSize}`);
}

/**
 * Enqueue a log entry for shipping.
 * Auto-flushes when buffer reaches batchSize.
 */
export function shipLog(entry: {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  context: Record<string, unknown>;
  traceId?: string;
  unitId?: string;
}): void {
  const siemEntry: SIEMLogEntry = {
    ...entry,
    environment: _config.environment,
    hostname: _config.hostname,
    service: _config.target,
  };

  _buffer.push(siemEntry);

  if (_buffer.length >= _config.batchSize) {
    flushToSIEM();
  }
}

/**
 * Flush buffered logs to SIEM.
 * Called automatically on interval and when buffer is full.
 */
export async function flushToSIEM(): Promise<ShipmentResult> {
  if (_buffer.length === 0) {
    return { success: true, entriesShipped: 0, provider: _config.provider, retries: 0, durationMs: 0 };
  }

  const entries = [..._buffer];
  _buffer = [];

  const start = Date.now();
  let lastError = '';
  let retries = 0;

  for (let attempt = 0; attempt <= _config.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        retries++;
        _shipmentStats.retries++;
        const backoff = _config.retryBackoffMs * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, backoff));
      }

      await sendToProvider(entries);

      _shipmentStats.total += entries.length;
      _shipmentStats.success += entries.length;

      return {
        success: true,
        entriesShipped: entries.length,
        provider: _config.provider,
        retries,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
    }
  }

  // All retries exhausted — put entries back in buffer
  _buffer.unshift(...entries);
  _shipmentStats.failed += entries.length;

  return {
    success: false,
    entriesShipped: 0,
    provider: _config.provider,
    error: lastError,
    retries,
    durationMs: Date.now() - start,
  };
}

async function sendToProvider(entries: SIEMLogEntry[]): Promise<void> {
  switch (_config.provider) {
    case 'stdout':
      for (const e of entries) {
        process.stdout?.write?.(JSON.stringify(e) + '\n');
      }
      return;

    case 'cloudwatch': {
      const payload = formatForCloudWatch(entries, _config);
      await httpPost(_config.endpoint, payload, {
        'X-Amz-Target': 'Logs_20140328.PutLogEvents',
        'Content-Type': 'application/x-amz-json-1.1',
      });
      return;
    }

    case 'datadog': {
      const payload = formatForDatadog(entries, _config);
      await httpPost(_config.endpoint, payload, {
        'DD-API-KEY': _config.apiKey,
        'Content-Type': 'application/json',
      });
      return;
    }

    case 'elk': {
      const payload = formatForELK(entries, _config);
      await httpPost(_config.endpoint + '/_bulk', payload, {
        'Content-Type': 'application/x-ndjson',
        ...((_config.apiKey) ? { Authorization: `ApiKey ${_config.apiKey}` } : {}),
      });
      return;
    }

    case 'loki': {
      const payload = formatForLoki(entries, _config);
      await httpPost(_config.endpoint + '/loki/api/v1/push', payload, {
        'Content-Type': 'application/json',
        ...((_config.apiKey) ? { Authorization: `Bearer ${_config.apiKey}` } : {}),
      });
      return;
    }

    default:
      throw new Error(`Unknown SIEM provider: ${_config.provider}`);
  }
}

async function httpPost(url: string, body: unknown, headers: Record<string, string>): Promise<void> {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: payload,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`SIEM ${_config.provider} error: ${res.status} ${text.substring(0, 200)}`);
  }
}

/**
 * Get shipping statistics.
 */
export function getSIEMStats() {
  return {
    ..._shipmentStats,
    bufferSize: _buffer.length,
    provider: _config.provider,
    target: _config.target,
  };
}

/**
 * Graceful shutdown — flush remaining logs.
 */
export async function shutdownSIEM(): Promise<void> {
  if (_flushTimer) {
    clearInterval(_flushTimer);
    _flushTimer = null;
  }
  if (_buffer.length > 0) {
    await flushToSIEM();
  }
  logger.debug(`[SIEM] Shutdown: ${_shipmentStats.total} entries shipped, ${_shipmentStats.failed} failed.`);
}
