/**
 * Metrics Collector — Coleta de Métricas em Tempo Real
 *
 * Coleta e agrega métricas de performance e segurança:
 * - Latência por endpoint (p50, p95, p99)
 * - Taxa de erro por status code
 * - Contadores de eventos de segurança
 * - Uso de recursos (estimativa client-side)
 *
 * ARQUITETURA:
 * - Em mock: métricas em memória com ring buffer (últimas 24h)
 * - Em produção: flush periódico para backend de métricas
 *   (Prometheus/Datadog/CloudWatch)
 *
 * TODO(BE-025): Implementar backend de métricas
 *   POST /metrics/flush   (batch de métricas)
 *   GET  /metrics/query   (consulta para dashboard)
 */

// ============================================================
// TYPES
// ============================================================

export interface MetricPoint {
  name: string;
  value: number;
  tags: Record<string, string>;
  timestamp: number;
}

export interface LatencyMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  durationMs: number;
  timestamp: number;
}

export interface CounterMetric {
  name: string;
  tags: Record<string, string>;
  count: number;
  /** Janela de tempo em ms */
  windowMs: number;
}

export interface LatencyStats {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

export interface ErrorRateStats {
  total: number;
  errors: number;
  rate: number;
  byStatus: Record<number, number>;
}

export interface SystemHealth {
  uptime: number;
  memoryUsageMB: number;
  /** Estimativa baseada em event loop lag */
  cpuPressure: 'low' | 'moderate' | 'high';
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  avgLatencyMs: number;
}

// ============================================================
// RING BUFFER — Armazena últimas N entries
// ============================================================

class RingBuffer<T> {
  private buffer: T[];
  private head = 0;
  private _size = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this._size < this.capacity) this._size++;
  }

  toArray(): T[] {
    if (this._size === 0) return [];
    if (this._size < this.capacity) {
      return this.buffer.slice(0, this._size);
    }
    return [...this.buffer.slice(this.head), ...this.buffer.slice(0, this.head)];
  }

  get size(): number { return this._size; }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this._size = 0;
  }

  /** Filtra entries dentro de uma janela de tempo */
  within(windowMs: number): T[] {
    const cutoff = Date.now() - windowMs;
    return this.toArray().filter((item: T) => {
      const ts = (item as Record<string, unknown>).timestamp;
      return typeof ts === 'number' && ts >= cutoff;
    });
  }
}

// ============================================================
// METRICS STORE
// ============================================================

/** Capacidade: ~10k pontos por buffer (~24h a 1 req/10s) */
const BUFFER_SIZE = 10_000;
const startTime = Date.now();

/** Latências por endpoint */
const latencyBuffer = new RingBuffer<LatencyMetric>(BUFFER_SIZE);

/** Contadores de eventos */
const counters = new Map<string, { count: number; firstSeen: number; lastSeen: number }>();

/** Flush queue para envio ao backend */
const flushQueue: MetricPoint[] = [];

/** Intervalo de flush (30s) */
let flushInterval: ReturnType<typeof setInterval> | null = null;

// ============================================================
// PUBLIC API — Recording
// ============================================================

/**
 * Registra latência de requisição HTTP.
 * Chamado automaticamente pelo API client interceptor.
 */
export function recordLatency(
  endpoint: string,
  method: string,
  statusCode: number,
  durationMs: number
): void {
  latencyBuffer.push({
    endpoint: normalizeEndpoint(endpoint),
    method: method.toUpperCase(),
    statusCode,
    durationMs,
    timestamp: Date.now(),
  });

  // Incrementar contadores
  incrementCounter('http_requests_total', { method, status: String(statusCode) });
  if (statusCode >= 400) {
    incrementCounter('http_errors_total', { method, status: String(statusCode) });
  }
  if (statusCode >= 500) {
    incrementCounter('http_5xx_total', { method, status: String(statusCode) });
  }
}

/**
 * Incrementa contador de evento.
 */
export function incrementCounter(name: string, tags: Record<string, string> = {}): void {
  const key = `${name}:${JSON.stringify(tags)}`;
  const existing = counters.get(key);
  if (existing) {
    existing.count++;
    existing.lastSeen = Date.now();
  } else {
    counters.set(key, { count: 1, firstSeen: Date.now(), lastSeen: Date.now() });
  }
}

/**
 * Registra evento de segurança (para detecção de anomalias).
 */
export function recordSecurityEvent(
  event: string,
  tags: Record<string, string> = {}
): void {
  incrementCounter(`security_${event}`, tags);

  flushQueue.push({
    name: `security.${event}`,
    value: 1,
    tags,
    timestamp: Date.now(),
  });
}

// ============================================================
// PUBLIC API — Querying
// ============================================================

/**
 * Calcula estatísticas de latência para um período.
 *
 * @param windowMs - Janela de tempo (default: 5 min)
 * @param endpoint - Filtrar por endpoint (opcional)
 */
export function getLatencyStats(windowMs = 300_000, endpoint?: string): LatencyStats {
  let entries = latencyBuffer.within(windowMs);
  if (endpoint) {
    entries = entries.filter(e => e.endpoint === normalizeEndpoint(endpoint));
  }

  if (entries.length === 0) {
    return { count: 0, min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
  }

  const durations = entries.map(e => e.durationMs).sort((a, b) => a - b);
  const sum = durations.reduce((a, b) => a + b, 0);

  return {
    count: durations.length,
    min: durations[0],
    max: durations[durations.length - 1],
    avg: Math.round(sum / durations.length),
    p50: percentile(durations, 50),
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
  };
}

/**
 * Calcula taxa de erro para um período.
 */
export function getErrorRate(windowMs = 300_000): ErrorRateStats {
  const entries = latencyBuffer.within(windowMs);
  const total = entries.length;
  const errors = entries.filter(e => e.statusCode >= 400);

  const byStatus: Record<number, number> = {};
  for (const e of errors) {
    byStatus[e.statusCode] = (byStatus[e.statusCode] || 0) + 1;
  }

  return {
    total,
    errors: errors.length,
    rate: total > 0 ? errors.length / total : 0,
    byStatus,
  };
}

/**
 * Retorna valor de um contador.
 */
export function getCounter(name: string, tags: Record<string, string> = {}): number {
  const key = `${name}:${JSON.stringify(tags)}`;
  return counters.get(key)?.count || 0;
}

/**
 * Retorna todos os contadores que matcham um prefixo.
 */
export function getCountersByPrefix(prefix: string): CounterMetric[] {
  const result: CounterMetric[] = [];
  for (const [key, val] of Array.from(counters.entries())) {
    const [name, tagsJson] = key.split(':');
    if (name.startsWith(prefix)) {
      result.push({
        name,
        tags: tagsJson ? JSON.parse(tagsJson) : {},
        count: val.count,
        windowMs: val.lastSeen - val.firstSeen,
      });
    }
  }
  return result;
}

/**
 * Requests por minuto (últimos 5 minutos).
 */
export function getRequestsPerMinute(): number {
  const fiveMin = latencyBuffer.within(300_000);
  return Math.round(fiveMin.length / 5);
}

/**
 * Health check geral do sistema.
 */
export function getSystemHealth(): SystemHealth {
  const latency = getLatencyStats(300_000);
  const errorRate = getErrorRate(300_000);

  // Estimativa de memória (browser)
  let memoryMB = 0;
  if (typeof performance !== 'undefined' && 'memory' in performance) {
    const mem = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
    memoryMB = Math.round(mem.usedJSHeapSize / 1024 / 1024);
  }

  return {
    uptime: Date.now() - startTime,
    memoryUsageMB: memoryMB,
    cpuPressure: memoryMB > 200 ? 'high' : memoryMB > 100 ? 'moderate' : 'low',
    activeConnections: latencyBuffer.within(10_000).length,
    requestsPerMinute: getRequestsPerMinute(),
    errorRate: errorRate.rate,
    avgLatencyMs: latency.avg,
  };
}

/**
 * Retorna série temporal de latência para gráficos.
 *
 * @param windowMs - Período total
 * @param bucketMs - Tamanho de cada bucket (default: 1 min)
 */
export function getLatencyTimeSeries(
  windowMs = 3_600_000,
  bucketMs = 60_000
): Array<{ time: string; avg: number; p95: number; count: number; errors: number }> {
  const entries = latencyBuffer.within(windowMs);
  const now = Date.now();
  const buckets: Array<{ time: string; avg: number; p95: number; count: number; errors: number }> = [];

  for (let t = now - windowMs; t < now; t += bucketMs) {
    const bucketEnd = t + bucketMs;
    const inBucket = entries.filter(e => e.timestamp >= t && e.timestamp < bucketEnd);

    const durations = inBucket.map(e => e.durationMs).sort((a, b) => a - b);
    const errors = inBucket.filter(e => e.statusCode >= 400).length;

    buckets.push({
      time: new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      avg: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
      p95: durations.length > 0 ? percentile(durations, 95) : 0,
      count: inBucket.length,
      errors,
    });
  }

  return buckets;
}

// ============================================================
// FLUSH — Envio para backend de métricas
// ============================================================

/**
 * Inicia flush periódico (30s) para backend de métricas.
 * Em mock: apenas limpa a queue.
 */
export function startFlush(intervalMs = 30_000): void {
  if (flushInterval) return;
  flushInterval = setInterval(() => {
    if (flushQueue.length === 0) return;

    const batch = flushQueue.splice(0, 100);

    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.debug(`[METRICS] Flush ${batch.length} points`);
    }

    // TODO(BE-025): POST /metrics/flush com batch
  }, intervalMs);
}

export function stopFlush(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
}

// ============================================================
// RESET (para testes)
// ============================================================

export function resetMetrics(): void {
  latencyBuffer.clear();
  counters.clear();
  flushQueue.length = 0;
}

// ============================================================
// INTERNAL
// ============================================================

/** Normaliza endpoint removendo IDs dinâmicos */
function normalizeEndpoint(endpoint: string): string {
  return endpoint
    .replace(/\/[a-f0-9-]{36}/g, '/:id')
    .replace(/\/[a-f0-9]{24}/g, '/:id')
    .replace(/\/\d+/g, '/:id')
    .replace(/\?.*$/, '');
}

/** Calcula percentil de um array ordenado */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}
