/**
 * Analytics Service — Retenção e Crescimento
 * TODO(BE-028): Implementar endpoints analytics
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type { AnalyticsRetencao } from '@/lib/__mocks__/analytics.mock';

export type { AnalyticsRetencao };

export async function getAnalytics(): Promise<AnalyticsRetencao> {
  if (useMock()) {
    await mockDelay();
    const { getAnalytics } = await import('@/lib/__mocks__/analytics.mock');
    return getAnalytics();
  }
  const { data } = await apiClient.get<AnalyticsRetencao>('/analytics/retencao');
  return data;
}
