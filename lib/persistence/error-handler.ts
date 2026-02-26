/**
 * Global Error Handler — Tratamento Centralizado de Erros
 *
 * PRINCÍPIO: Nunca expor detalhes internos ao frontend.
 *
 * NUNCA EXPOR:
 * ✗ Stack trace
 * ✗ Query SQL
 * ✗ Estrutura de tabelas
 * ✗ IDs internos de sistema
 * ✗ Mensagens de ORM/driver
 *
 * SEMPRE RETORNAR:
 * ✓ SafeError com mensagem amigável
 * ✓ traceId para debug (logar no servidor)
 * ✓ Código de erro padronizado
 *
 * MAPEAMENTO:
 * 409 → "Conflito de atualização detectado."
 * 403 → "Acesso não permitido."
 * 422 → "Operação inválida."
 * 400 → "Dados inválidos."
 * 500 → "Erro interno. Tente novamente."
 */

import type {
  SafeError,
  IntegrityError,
  ConflictError,
} from '@/lib/api/contracts';
import { SAFE_ERROR_MESSAGES } from '@/lib/api/contracts';
import { ApiError } from '@/lib/api/client';
import { TenantError } from './tenant-isolation';

// ============================================================
// TRACE ID
// ============================================================

/** Gera trace ID para rastreamento (UUID-like) */
function generateTraceId(): string {
  const h = () => Math.random().toString(16).slice(2, 6);
  return `trace_${h()}${h()}_${Date.now().toString(36)}`;
}

// ============================================================
// ERROR CLASSIFICATION
// ============================================================

/** Tipos de erro que o handler sabe tratar */
type KnownError =
  | ApiError
  | TenantError
  | IntegrityError
  | ConflictError
  | Error;

/**
 * Classifica um erro e retorna SafeError padronizado.
 *
 * Regra: Nunca propagar mensagem original do erro.
 * Sempre usar mapeamento definido em SAFE_ERROR_MESSAGES.
 */
export function toSafeError(error: unknown): SafeError {
  const traceId = generateTraceId();

  // ─── Log completo para debug (apenas server-side em produção) ───
  logInternalError(traceId, error);

  // ─── API Error (vindo do backend) ───
  if (error instanceof ApiError) {
    return mapApiError(error, traceId);
  }

  // ─── Tenant Violation ───
  if (error instanceof TenantError) {
    return {
      status: 403,
      code: 'UNIT_MISMATCH',
      message: SAFE_ERROR_MESSAGES.UNIT_MISMATCH,
      traceId,
    };
  }

  // ─── Integrity Error (objeto tipado) ───
  if (isIntegrityError(error)) {
    return {
      status: 422,
      code: 'INTEGRITY_VIOLATION',
      message: error.message || SAFE_ERROR_MESSAGES.INTEGRITY_VIOLATION,
      traceId,
    };
  }

  // ─── Conflict Error (objeto tipado) ───
  if (isConflictError(error)) {
    return {
      status: 409,
      code: 'CONFLICT',
      message: SAFE_ERROR_MESSAGES.CONFLICT,
      traceId,
    };
  }

  // ─── Network / Timeout ───
  if (error instanceof Error) {
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        status: 408,
        code: 'TIMEOUT',
        message: 'A operação demorou muito. Tente novamente.',
        traceId,
      };
    }

    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return {
        status: 0,
        code: 'NETWORK_ERROR',
        message: 'Erro de conexão. Verifique sua internet e tente novamente.',
        traceId,
      };
    }
  }

  // ─── Fallback: erro genérico ───
  return {
    status: 500,
    code: 'INTERNAL_ERROR',
    message: 'Ocorreu um erro inesperado. Tente novamente.',
    traceId,
  };
}

// ============================================================
// API ERROR MAPPING
// ============================================================

function mapApiError(error: ApiError, traceId: string): SafeError {
  const statusMap: Record<number, { code: string; message: string }> = {
    400: { code: 'VALIDATION_ERROR', message: SAFE_ERROR_MESSAGES.VALIDATION_ERROR },
    401: { code: 'UNAUTHORIZED', message: SAFE_ERROR_MESSAGES.UNAUTHORIZED },
    403: { code: 'FORBIDDEN', message: SAFE_ERROR_MESSAGES.FORBIDDEN },
    404: { code: 'NOT_FOUND', message: SAFE_ERROR_MESSAGES.NOT_FOUND },
    409: { code: 'CONFLICT', message: SAFE_ERROR_MESSAGES.CONFLICT },
    422: { code: 'INTEGRITY_VIOLATION', message: extractSafeMessage(error) },
    429: { code: 'RATE_LIMITED', message: SAFE_ERROR_MESSAGES.RATE_LIMITED },
  };

  const mapped = statusMap[error.status];
  if (mapped) {
    return { status: error.status, ...mapped, traceId };
  }

  // 5xx → Nunca expor detalhes
  if (error.status >= 500) {
    return {
      status: error.status,
      code: 'SERVER_ERROR',
      message: 'Erro no servidor. Tente novamente em alguns instantes.',
      traceId,
    };
  }

  return {
    status: error.status,
    code: 'UNKNOWN_ERROR',
    message: 'Ocorreu um erro. Tente novamente.',
    traceId,
  };
}

/**
 * Extrai mensagem segura do corpo do erro 422.
 * Aceita mensagens pré-definidas do backend (como bloqueio de exclusão).
 */
function extractSafeMessage(error: ApiError): string {
  if (error.data && typeof error.data === 'object') {
    const data = error.data as Record<string, unknown>;

    // Backend pode retornar mensagem segura para o usuário
    if (typeof data.message === 'string') {
      // Verificar se a mensagem é uma das nossas mensagens seguras
      const safeMessages = Object.values(SAFE_ERROR_MESSAGES);
      if (safeMessages.includes(data.message)) {
        return data.message;
      }

      // Mensagens de integridade do nosso sistema são seguras
      if (data.message.startsWith('Não é possível')) {
        return data.message;
      }
    }
  }

  return SAFE_ERROR_MESSAGES.INTEGRITY_VIOLATION;
}

// ============================================================
// TYPE GUARDS
// ============================================================

function isIntegrityError(error: unknown): error is IntegrityError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Record<string, unknown>).code === 'INTEGRITY_VIOLATION'
  );
}

function isConflictError(error: unknown): error is ConflictError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as Record<string, unknown>).code === 'CONFLICT'
  );
}

// ============================================================
// INTERNAL LOGGING (nunca exposto ao frontend)
// ============================================================

/**
 * Loga erro completo para rastreamento interno.
 *
 * Em produção: enviar para serviço de monitoramento (Sentry, Datadog, etc.)
 * Em dev: console.error com trace ID
 */
function logInternalError(traceId: string, error: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(`[ERROR ${traceId}]`, error);
  }

  // TODO(BE-022): Em produção, enviar para serviço de monitoramento
  // Sentry.captureException(error, { extra: { traceId } });
}

// ============================================================
// REACT INTEGRATION — Hook-friendly error handling
// ============================================================

/**
 * Converte SafeError em mensagem para o usuário.
 * Usado em catch blocks de React components.
 *
 * @example
 * ```tsx
 * try {
 *   await updateProgress(...)
 * } catch (err) {
 *   setError(getUserMessage(err));
 * }
 * ```
 */
export function getUserMessage(error: unknown): string {
  const safe = toSafeError(error);
  return safe.message;
}

/**
 * Verifica se o erro é de um tipo específico.
 */
export function isConflict(error: unknown): boolean {
  if (error instanceof ApiError) return error.status === 409;
  return isConflictError(error);
}

export function isIntegrityViolation(error: unknown): boolean {
  if (error instanceof ApiError) return error.status === 422;
  return isIntegrityError(error);
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

export function isForbidden(error: unknown): boolean {
  return error instanceof ApiError && error.status === 403;
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}
