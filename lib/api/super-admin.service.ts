/**
 * Super Admin Service — Dashboard global da plataforma
 *
 * MOCK:  isMock() / useMock() === true → dados de __mocks__/super-admin.mock.ts
 * PROD:  useMock() === false          → apiClient com fallback automático para mock
 */

import { apiClient } from './client';
import { isMock, useMock, mockDelay } from '@/lib/env';

import type {
  MockDashboardMetrics,
  MockMonthlyData,
  MockRevenueByPlan,
  MockAcademy,
} from '@/lib/__mocks__/super-admin.mock';

// DTOs expostos para a UI
export interface SuperAdminStatsDTO {
  metrics: MockDashboardMetrics;
  monthlyData: MockMonthlyData[];
  revenueByPlan: MockRevenueByPlan[];
  topAcademies: { nome: string; alunos: number; plano: string; status: string }[];
}

export type SuperAdminAcademyDTO = MockAcademy;

async function getMock() {
  return import('@/lib/__mocks__/super-admin.mock');
}

/**
 * Retorna estatísticas agregadas do dashboard do super-admin.
 * Nunca lança erro: em caso de falha, volta para os dados mockados.
 */
export const getSuperAdminStats = async (): Promise<SuperAdminStatsDTO> => {
  // Caminho mock explícito (NEXT_PUBLIC_USE_MOCK=true)
  if (isMock() || useMock()) {
    await mockDelay();
    const m = await getMock();
    if ('mockGetSuperAdminStats' in m && typeof m.mockGetSuperAdminStats === 'function') {
      return m.mockGetSuperAdminStats();
    }
    return {
      metrics: m.MOCK_DASHBOARD_METRICS,
      monthlyData: m.MOCK_MONTHLY_DATA,
      revenueByPlan: m.MOCK_REVENUE_BY_PLAN,
      topAcademies: m.MOCK_TOP_ACADEMIES,
    };
  }

  // Caminho API real com fallback silencioso para mock
  try {
    const { data } = await apiClient.get<SuperAdminStatsDTO>('/super-admin/dashboard');
    if (data && data.metrics) {
      return data;
    }
  } catch {
    // Ignora e cai no fallback de mock
  }

  const m = await getMock();
  return {
    metrics: m.MOCK_DASHBOARD_METRICS,
    monthlyData: m.MOCK_MONTHLY_DATA,
    revenueByPlan: m.MOCK_REVENUE_BY_PLAN,
    topAcademies: m.MOCK_TOP_ACADEMIES,
  };
};

/**
 * Lista academias gerenciadas pelo super-admin.
 * Nunca lança erro: em caso de falha, volta para a lista mockada.
 */
export const getSuperAdminAcademies = async (): Promise<SuperAdminAcademyDTO[]> => {
  if (isMock() || useMock()) {
    await mockDelay();
    const m = await getMock();
    if ('mockGetSuperAdminAcademies' in m && typeof m.mockGetSuperAdminAcademies === 'function') {
      return m.mockGetSuperAdminAcademies();
    }
    return [...m.MOCK_ACADEMIES];
  }

  try {
    const { data } = await apiClient.get<SuperAdminAcademyDTO[]>('/super-admin/academies');
    if (Array.isArray(data)) {
      return data;
    }
  } catch {
    // Ignora e cai no fallback de mock
  }

  const m = await getMock();
  return [...m.MOCK_ACADEMIES];
};

