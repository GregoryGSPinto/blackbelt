/**
 * Alertas Inteligentes Service — Proactive pattern detection
 *
 * MOCK:  useMock() === true → dados de __mocks__/alertas-inteligentes.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-070): Implementar endpoint de alertas
 *   GET /alertas/inteligentes
 *   POST /alertas/:id/dismiss
 */

import { apiClient, ApiError } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { AlertaInteligente, TendenciaData } from '@/lib/__mocks__/alertas-inteligentes.mock';
import { logger } from '@/lib/logger';

export type { AlertaInteligente, AlertaTipo, AlertaPrioridade, AlertaCategoria, TendenciaData } from '@/lib/__mocks__/alertas-inteligentes.mock';

async function getMock() {
  return import('@/lib/__mocks__/alertas-inteligentes.mock');
}

// ── Get all proactive alerts ──

export async function getAlertas(): Promise<AlertaInteligente[]> {
  if (useMock()) {
    await mockDelay(200);
    const mock = await getMock();
    return [...mock.MOCK_ALERTAS];
  }
  try {
    const { data } = await apiClient.get<AlertaInteligente[]>('/alertas/inteligentes');
    return data;
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status !== 401 &&
      error.status !== 403
    ) {
      logger.warn('[AlertasInteligentes]', `Falha opcional no endpoint (${error.status}). Retornando lista vazia.`);
      return [];
    }
    throw error;
  }
}

// ── Dismiss an alert (24h cooldown) ──

const DISMISSED_KEY = 'blackbelt_dismissed_alerts';

export function dismissAlert(alertId: string): void {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    const dismissed: Record<string, number> = raw ? JSON.parse(raw) : {};
    dismissed[alertId] = Date.now();
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  } catch { /* ignore */ }
}

export function isDismissed(alertId: string): boolean {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const dismissed: Record<string, number> = JSON.parse(raw);
    const ts = dismissed[alertId];
    if (!ts) return false;
    // 24h cooldown
    return Date.now() - ts < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

// ── Calculate trend data ──

export function calcularTendencia(atual: number, anterior: number): TendenciaData {
  const variacao = anterior > 0 ? ((atual - anterior) / anterior) * 100 : 0;
  return { atual, anterior, variacao: Math.round(variacao * 10) / 10 };
}
