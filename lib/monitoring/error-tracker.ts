// ============================================================
// Frontend Error Tracker — Observabilidade de Produção
// ============================================================
// Captura erros não tratados, promise rejections, e erros de
// componentes React (via Error Boundaries). Deduplica, enriquece
// com contexto (user, route, device), e enfileira para envio.
//
// Integração futura: Sentry, Datadog RUM, ou endpoint próprio.
//
// Uso:
//   import { errorTracker } from '@/lib/monitoring/error-tracker';
//   errorTracker.captureError(error, { component: 'CheckinFAB' });
//   errorTracker.captureMessage('Unexpected state', 'warning');
// ============================================================

type Severity = 'fatal' | 'error' | 'warning' | 'info';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  route?: string;
  extra?: Record<string, unknown>;
}

interface TrackedError {
  id: string;
  message: string;
  stack?: string;
  severity: Severity;
  context: ErrorContext;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
  count: number; // dedup counter
}

const MAX_QUEUE_SIZE = 50;
const DEDUP_WINDOW_MS = 30_000; // 30s

class ErrorTracker {
  private queue: TrackedError[] = [];
  private fingerprints = new Map<string, { idx: number; ts: number }>();
  private _initialized = false;

  /** Call once in root layout */
  init() {
    if (this._initialized || typeof window === 'undefined') return;
    this._initialized = true;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        action: 'window.onerror',
        extra: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));
      this.captureError(error, { action: 'unhandledrejection' });
    });
  }

  /** Capture an Error instance */
  captureError(error: Error, ctx: ErrorContext = {}) {
    const enriched = this.enrich(ctx);
    const fingerprint = this.getFingerprint(error);

    // Dedup: same error within window → increment count
    const existing = this.fingerprints.get(fingerprint);
    if (existing && (Date.now() - existing.ts) < DEDUP_WINDOW_MS) {
      if (this.queue[existing.idx]) {
        this.queue[existing.idx].count++;
        return;
      }
    }

    const tracked: TrackedError = {
      id: this.generateId(),
      message: error.message,
      stack: error.stack?.slice(0, 2000), // truncate stack
      severity: 'error',
      context: enriched,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      connection: this.getConnectionType(),
      count: 1,
    };

    const idx = this.queue.length;
    this.queue.push(tracked);
    this.fingerprints.set(fingerprint, { idx, ts: Date.now() });

    // Evict old entries
    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue.shift();
    }

    // Log in dev
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[ErrorTracker] ${tracked.severity}: ${tracked.message}`, enriched);
    }

    // Future: flush to backend
    // this.flush();
  }

  /** Capture a message (not an Error) */
  captureMessage(message: string, severity: Severity = 'info', ctx: ErrorContext = {}) {
    const enriched = this.enrich(ctx);

    const tracked: TrackedError = {
      id: this.generateId(),
      message,
      severity,
      context: enriched,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      connection: this.getConnectionType(),
      count: 1,
    };

    this.queue.push(tracked);

    if (this.queue.length > MAX_QUEUE_SIZE) {
      this.queue.shift();
    }
  }

  /** Set user context (call on login) */
  setUser(userId: string) {
    this._userId = userId;
  }
  private _userId?: string;

  /** Get queued errors (for debug/admin panel) */
  getErrors(): readonly TrackedError[] {
    return this.queue;
  }

  /** Get error count */
  get errorCount(): number {
    return this.queue.length;
  }

  /** Clear queue */
  clear() {
    this.queue = [];
    this.fingerprints.clear();
  }

  // ── Private ──

  private enrich(ctx: ErrorContext): ErrorContext {
    return {
      ...ctx,
      userId: ctx.userId || this._userId,
      route: typeof window !== 'undefined' ? window.location.pathname : undefined,
    };
  }

  private getFingerprint(error: Error): string {
    // Use first line of stack + message for dedup
    const stackLine = error.stack?.split('\n')[1]?.trim() || '';
    return `${error.message}|${stackLine}`;
  }

  private getConnectionType(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    const nav = navigator as typeof navigator & { connection?: { effectiveType?: string } };
    return nav.connection?.effectiveType || 'unknown';
  }

  private generateId(): string {
    return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  }

  /** Future: flush to backend endpoint */
  // private async flush() {
  //   if (this.queue.length === 0) return;
  //   const batch = [...this.queue];
  //   this.queue = [];
  //   try {
  //     await fetch('/api/errors', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ errors: batch }),
  //     });
  //   } catch {
  //     // Re-queue on failure
  //     this.queue.unshift(...batch);
  //   }
  // }
}

/** Singleton instance */
export const errorTracker = new ErrorTracker();
