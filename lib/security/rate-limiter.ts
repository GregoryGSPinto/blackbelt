/**
 * Rate Limiter — Proteção contra força bruta (client-side)
 *
 * Tracking local de tentativas de login.
 * Backend TAMBÉM implementa rate limiting (é a camada principal).
 * Este é complementar — reduz chamadas desnecessárias ao servidor.
 *
 * Configuração:
 * - 5 tentativas máximas
 * - Bloqueio de 15 minutos após exceder
 * - Reset automático após período de bloqueio
 */

import type { RateLimitStatus } from '@/lib/api/contracts';
import { getSecurityConfig } from './token-store';

interface AttemptTracker {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil: number | null;
}

// In-memory tracking (reset ao fechar aba — intencional)
const trackers = new Map<string, AttemptTracker>();

/** Identifica o contexto (IP/email) para rate limiting */
function getTracker(key: string): AttemptTracker {
  const existing = trackers.get(key);
  if (existing) return existing;
  const fresh: AttemptTracker = { attempts: 0, firstAttemptAt: 0, blockedUntil: null };
  trackers.set(key, fresh);
  return fresh;
}

/** Verifica se pode tentar login */
export function checkRateLimit(key: string): RateLimitStatus {
  const config = getSecurityConfig();
  const tracker = getTracker(key);
  const now = Date.now();

  // Se bloqueado, verificar se já expirou
  if (tracker.blockedUntil && now < tracker.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(tracker.blockedUntil).toISOString(),
      blocked: true,
      blockedUntil: new Date(tracker.blockedUntil).toISOString(),
    };
  }

  // Se bloqueio expirou, resetar
  if (tracker.blockedUntil && now >= tracker.blockedUntil) {
    tracker.attempts = 0;
    tracker.firstAttemptAt = 0;
    tracker.blockedUntil = null;
  }

  const remaining = config.maxLoginAttempts - tracker.attempts;
  return {
    allowed: remaining > 0,
    remaining: Math.max(0, remaining),
    resetAt: tracker.firstAttemptAt
      ? new Date(tracker.firstAttemptAt + config.lockoutDuration * 1000).toISOString()
      : new Date(now + config.lockoutDuration * 1000).toISOString(),
    blocked: false,
  };
}

/** Registra uma tentativa de login */
export function recordAttempt(key: string): RateLimitStatus {
  const config = getSecurityConfig();
  const tracker = getTracker(key);
  const now = Date.now();

  if (tracker.attempts === 0) {
    tracker.firstAttemptAt = now;
  }

  tracker.attempts++;

  // Excedeu limite → bloquear
  if (tracker.attempts >= config.maxLoginAttempts) {
    tracker.blockedUntil = now + config.lockoutDuration * 1000;
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(tracker.blockedUntil).toISOString(),
      blocked: true,
      blockedUntil: new Date(tracker.blockedUntil).toISOString(),
    };
  }

  return checkRateLimit(key);
}

/** Registra login bem-sucedido (reseta contador) */
export function recordSuccess(key: string): void {
  trackers.delete(key);
}

/** Tempo restante de bloqueio em segundos */
export function getBlockTimeRemaining(key: string): number {
  const tracker = trackers.get(key);
  if (!tracker?.blockedUntil) return 0;
  const remaining = Math.max(0, tracker.blockedUntil - Date.now());
  return Math.ceil(remaining / 1000);
}

/** Limpa todos os trackers (útil para testes) */
export function clearAllTrackers(): void {
  trackers.clear();
}
