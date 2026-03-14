// ============================================================
// BLACKBELT — Logger Centralizado
// ============================================================
// Camada de abstração para logging. Controla visibilidade por
// ambiente e prepara integração futura com Sentry (TODO OPS-040).
//
// DEV  → exibe tudo no console
// PROD → silencioso (até Sentry ser integrado)
//
// Uso:
//   import { logger } from '@/lib/logger';
//   logger.info('[Auth]', 'Token validado');
//   logger.warn('[Auth]', 'Token sem sessão, limpando');
//   logger.error('[Auth]', 'Falha ao carregar sessão', err);
// ============================================================

import { redactSensitiveData, sanitizeErrorForLogging } from '@/lib/security/sensitive-data';

const IS_DEV = process.env.NODE_ENV === 'development';

// ── Sentry stub (TODO OPS-040) ────────────────────────────────
// Quando Sentry for integrado, substituir esses stubs por:
//   import * as Sentry from '@sentry/nextjs';
//
// interface SentryLike {
//   captureException(err: unknown, ctx?: Record<string, unknown>): void;
//   captureMessage(msg: string, level?: string): void;
//   addBreadcrumb(crumb: { category: string; message: string; level: string }): void;
// }
// ───────────────────────────────────────────────────────────────

/** Structured log data for error boundaries and complex events */
export interface LogData {
  module?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Logger centralizado do BLACKBELT.
 *
 * Em desenvolvimento: proxy para console com prefixos formatados.
 * Em produção: silencioso — pronto para Sentry/LogRocket.
 */
export const logger = {
  /** Informação operacional (fluxo normal, navegação, sucesso) */
  info(tag: string, ...args: unknown[]): void {
    void tag;
    void args;
    // TODO(OPS-040): Sentry.addBreadcrumb({ category: tag, message: String(args[0]), level: 'info' });
  },

  /** Alerta sobre estado inesperado mas recuperável */
  warn(tag: string, ...args: unknown[]): void {
    void tag;
    void args;
    // TODO(OPS-040): Sentry.captureMessage(`${tag} ${args[0]}`, 'warning');
  },

  /** Erro que impacta funcionalidade — sempre será reportado ao Sentry */
  error(tag: string, ...args: unknown[]): void {
    void IS_DEV;
    // TODO(OPS-040): Sentry.captureException(args.find(a => a instanceof Error) || new Error(String(args[0])));
    // eslint-disable-next-line no-console
    console.error(tag, ...args.map((arg) => (
      arg instanceof Error
        ? sanitizeErrorForLogging(arg)
        : redactSensitiveData(arg)
    )));
  },

  /** Debug verbose — nunca aparece em produção, mesmo com Sentry */
  debug(tag: string, ...args: unknown[]): void {
    void tag;
    void args;
  },

  /**
   * Log estruturado para error boundaries e diagnóstico complexo.
   * Em dev: exibe grupo formatado no console.
   * Em prod: envia contexto para Sentry.
   */
  errorGroup(tag: string, error: Error, data?: LogData): void {
    if (!IS_DEV) {
      // TODO(OPS-040):
      // Sentry.captureException(error, { extra: data });
      return;
    }
    // eslint-disable-next-line no-console
    console.group(`🚨 ${tag}`);
    // eslint-disable-next-line no-console
    console.error('Error:', sanitizeErrorForLogging(error));
    if (data) {
      // eslint-disable-next-line no-console
      console.table(redactSensitiveData(data));
    }
    // eslint-disable-next-line no-console
    console.groupEnd();
  },
} as const;

export type Logger = typeof logger;
