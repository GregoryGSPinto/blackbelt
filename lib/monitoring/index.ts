/**
 * Monitoring Module — "O OLHO" do BlackBelt
 *
 * Sistema de observabilidade e detecção de anomalias.
 *
 * 4ª CAMADA DA ARQUITETURA DE SEGURANÇA:
 * ┌─────────────────────────────────────────┐
 * │  1. O CORAÇÃO — Middleware Zero Trust   │
 * │  2. O MOTOR   — Auth + Sessions         │
 * │  3. A MEMÓRIA — Persistence + Audit     │
 * │  4. O OLHO    — Monitoring + Detection  │ ← ESTA CAMADA
 * └─────────────────────────────────────────┘
 *
 * MÓDULOS:
 * - metrics.ts           → Coleta de latência, erros, contadores
 * - anomaly-detector.ts  → Detecção de padrões suspeitos (8 regras)
 * - structured-logger.ts → Logs JSON para agregação centralizada
 * - http-interceptor.ts  → Wiring no ciclo de requisições
 * - dashboard-service.ts → Aggregação de dados para painel admin
 */

// ─── Metrics ───
export {
  recordLatency,
  incrementCounter,
  recordSecurityEvent,
  getLatencyStats,
  getErrorRate,
  getCounter,
  getCountersByPrefix,
  getRequestsPerMinute,
  getSystemHealth,
  getLatencyTimeSeries,
  startFlush,
  stopFlush,
  resetMetrics,
} from './metrics';

export type {
  MetricPoint,
  LatencyMetric,
  CounterMetric,
  LatencyStats,
  ErrorRateStats,
  SystemHealth,
} from './metrics';

// ─── Anomaly Detector ───
export {
  onLoginFailure,
  onCrossUnitAttempt,
  onServerError,
  onConcurrencyConflict,
  onDeletionBlocked,
  onSuspiciousLogin,
  onRequestFlood,
  onPrivilegeEscalation,
  getAnomalies,
  getAnomaliesBySeverity,
  getActiveAnomalyCount,
  getAnomalyCountBySeverity,
  resolveAnomaly,
  resolveAll,
  onAlert,
  resetDetector,
  DETECTION_RULES,
} from './anomaly-detector';

export type {
  AnomalyType,
  AlertSeverity,
  Anomaly,
  DetectionRule,
} from './anomaly-detector';

// ─── Structured Logger ───
export {
  structuredLog,
  startTimer,
  setLogLevel,
  addLogHandler,
  getRecentLogs,
  getLogCounts,
  flushLogs,
} from './structured-logger';

export type {
  LogLevel,
  LogCategory,
  StructuredLog,
} from './structured-logger';

// ─── HTTP Interceptor ───
export {
  wrapWithMonitoring,
  interceptResponse,
  interceptLoginFailure,
  interceptLoginSuccess,
  interceptCrossUnitAttempt,
} from './http-interceptor';

// ─── Dashboard Service ───
export {
  getDashboardData,
  getMockDashboardData,
} from './dashboard-service';

export type {
  DashboardData,
  SecurityCounters,
} from './dashboard-service';
