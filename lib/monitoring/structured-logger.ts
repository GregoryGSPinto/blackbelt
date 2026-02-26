/**
 * Structured Logger — Centralização de Logs
 *
 * Logs em formato JSON estruturado para ingestão por
 * serviços de agregação (CloudWatch, Datadog, ELK, Loki).
 *
 * FORMATO:
 * {
 *   "timestamp": "2026-02-15T12:00:00.000Z",
 *   "level": "warn",
 *   "category": "security",
 *   "message": "Login falhou",
 *   "context": { "userId": "...", "ip": "..." },
 *   "traceId": "trace_abc123",
 *   "unitId": "unit_001",
 *   "environment": "production"
 * }
 *
 * CATEGORIAS:
 * - security:  eventos de auth, RBAC, anomalias
 * - audit:     operações de escrita auditadas
 * - http:      requests/responses
 * - error:     erros de aplicação
 * - system:    health checks, startup, shutdown
 * - business:  eventos de negócio (graduação, matrícula)
 *
 * TODO(BE-027): Implementar shipping de logs
 *   - Fluent Bit / Fluentd para ingestão
 *   - CloudWatch Logs ou Loki para armazenamento
 *   - Retention: 90 dias online, 1 ano archived
 */

// ============================================================
// TYPES
// ============================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogCategory = 'security' | 'audit' | 'http' | 'error' | 'system' | 'business';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  traceId?: string;
  unitId?: string;
  userId?: string;
  environment: string;
  /** Duração em ms (para logs de timing) */
  durationMs?: number;
}

// ============================================================
// CONFIGURATION
// ============================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0, info: 1, warn: 2, error: 3, fatal: 4,
};

let minLevel: LogLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
const environment = process.env.NODE_ENV || 'development';

/** Buffer para batch shipping */
const logBuffer: StructuredLog[] = [];
const MAX_BUFFER = 500;

/** External log handlers */
const logHandlers: Array<(log: StructuredLog) => void> = [];

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Logger principal com categorias.
 *
 * @example
 * ```ts
 * structuredLog.security.warn('Login falhou', { email: 'masked', ip: '1.2.3.4' });
 * structuredLog.audit.info('Progresso atualizado', { alunoId, oldValue, newValue });
 * structuredLog.http.info('Request', { method: 'GET', path: '/api/alunos', status: 200, durationMs: 45 });
 * structuredLog.error.error('Unhandled exception', { traceId, stack: '[redacted]' });
 * ```
 */
export const structuredLog = {
  security: createCategoryLogger('security'),
  audit: createCategoryLogger('audit'),
  http: createCategoryLogger('http'),
  error: createCategoryLogger('error'),
  system: createCategoryLogger('system'),
  business: createCategoryLogger('business'),
};

function createCategoryLogger(category: LogCategory) {
  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      log('debug', category, message, context),
    info: (message: string, context?: Record<string, unknown>) =>
      log('info', category, message, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      log('warn', category, message, context),
    error: (message: string, context?: Record<string, unknown>) =>
      log('error', category, message, context),
    fatal: (message: string, context?: Record<string, unknown>) =>
      log('fatal', category, message, context),
  };
}

/**
 * Log com timing automático.
 *
 * @example
 * ```ts
 * const end = structuredLog.startTimer('http', 'Database query');
 * await db.query(...);
 * end({ rows: 42 }); // Loga automaticamente com durationMs
 * ```
 */
export function startTimer(
  category: LogCategory,
  message: string
): (context?: Record<string, unknown>) => void {
  const start = Date.now();
  return (context?: Record<string, unknown>) => {
    log('info', category, message, { ...context, durationMs: Date.now() - start });
  };
}

// ============================================================
// CORE
// ============================================================

function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  context?: Record<string, unknown>
): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[minLevel]) return;

  const entry: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    environment,
    ...(context && { context: sanitizeContext(context) }),
    ...(context?.traceId ? { traceId: String(context.traceId) } : {}),
    ...(context?.unitId ? { unitId: String(context.unitId) } : {}),
    ...(context?.userId ? { userId: String(context.userId) } : {}),
    ...(context?.durationMs ? { durationMs: Number(context.durationMs) } : {}),
  };

  // Output
  outputLog(entry);

  // Buffer for shipping
  logBuffer.push(entry);
  if (logBuffer.length > MAX_BUFFER) {
    logBuffer.splice(0, logBuffer.length - MAX_BUFFER);
  }

  // External handlers
  for (const handler of logHandlers) {
    try { handler(entry); } catch { /* non-blocking */ }
  }
}

function outputLog(entry: StructuredLog): void {
  if (environment === 'production') {
    // Produção: JSON puro (para Fluent Bit / CloudWatch)
    const method = entry.level === 'error' || entry.level === 'fatal' ? 'error'
      : entry.level === 'warn' ? 'warn' : 'log';
    // eslint-disable-next-line no-console
    console[method](JSON.stringify(entry));
  } else {
    // Dev: output legível com cor
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[90m', info: '\x1b[36m', warn: '\x1b[33m',
      error: '\x1b[31m', fatal: '\x1b[41m\x1b[37m',
    };
    const reset = '\x1b[0m';
    const prefix = `${colors[entry.level]}[${entry.level.toUpperCase()}]${reset} [${entry.category}]`;
    const ctx = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
    // eslint-disable-next-line no-console
    console.log(`${prefix} ${entry.message}${ctx}`);
  }
}

/** Remove dados sensíveis do contexto */
function sanitizeContext(ctx: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...ctx };
  const SENSITIVE = ['password', 'senha', 'token', 'refreshToken', 'secret', 'cpf', 'authorization'];
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  return sanitized;
}

// ============================================================
// MANAGEMENT
// ============================================================

/** Altera nível mínimo de log */
export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

/** Registra handler externo para logs */
export function addLogHandler(handler: (log: StructuredLog) => void): () => void {
  logHandlers.push(handler);
  return () => {
    const idx = logHandlers.indexOf(handler);
    if (idx >= 0) logHandlers.splice(idx, 1);
  };
}

/** Retorna buffer de logs recentes (para dashboard) */
export function getRecentLogs(count = 50, level?: LogLevel, category?: LogCategory): StructuredLog[] {
  let filtered = [...logBuffer];
  if (level) filtered = filtered.filter(l => l.level === level);
  if (category) filtered = filtered.filter(l => l.category === category);
  return filtered.slice(-count).reverse();
}

/** Contagem de logs por nível (últimos N) */
export function getLogCounts(count = 100): Record<LogLevel, number> {
  const recent = logBuffer.slice(-count);
  return {
    debug: recent.filter(l => l.level === 'debug').length,
    info: recent.filter(l => l.level === 'info').length,
    warn: recent.filter(l => l.level === 'warn').length,
    error: recent.filter(l => l.level === 'error').length,
    fatal: recent.filter(l => l.level === 'fatal').length,
  };
}

/** Flush buffer para backend */
export function flushLogs(): StructuredLog[] {
  return logBuffer.splice(0);
}
