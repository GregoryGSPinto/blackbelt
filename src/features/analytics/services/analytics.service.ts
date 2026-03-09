/**
 * Analytics Service — Retenção e Crescimento — FAIL-SAFE
 *
 * Retorna dados mock automaticamente se API não estiver implementada (501)
 * ou qualquer outro erro ocorrer.
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';
import type { AnalyticsRetencao } from '@/lib/__mocks__/analytics.mock';

export type { AnalyticsRetencao };

export async function getAnalytics(): Promise<AnalyticsRetencao> {
  if (useMock()) {
    await mockDelay();
    const { getAnalytics } = await import('@/lib/__mocks__/analytics.mock');
    return getAnalytics();
  }

  try {
    const { data } = await apiClient.get<AnalyticsRetencao>('/analytics/retencao');
    return data;
  } catch (err) {
    const status = (err as any)?.status;
    logger.warn(`[AnalyticsService] API falhou (${status || 'error'}), usando mock`);
    await mockDelay(200);
    const { getAnalytics } = await import('@/lib/__mocks__/analytics.mock');
    return getAnalytics();
  }
}
