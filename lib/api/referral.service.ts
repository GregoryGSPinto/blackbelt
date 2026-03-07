/**
 * Referral Program Service
 */
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

export interface ReferralStats {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  rewards: { type: string; description: string; date: string }[];
}

export async function generateReferralCode(userId: string): Promise<string> {
  if (useMock()) {
    await mockDelay();
    return `BB-${userId.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  const { data } = await apiClient.post<{ code: string }>('/referral/generate', { userId });
  return data.code;
}

export async function applyReferralCode(code: string, newUserId: string): Promise<{ success: boolean; message: string }> {
  if (useMock()) {
    await mockDelay(300);
    return { success: true, message: 'Codigo aplicado com sucesso! Voce ganhou 1 mes gratis.' };
  }
  const { data } = await apiClient.post<{ success: boolean; message: string }>('/referral/apply', { code, newUserId });
  return data;
}

export async function getReferralStats(userId: string): Promise<ReferralStats> {
  if (useMock()) {
    await mockDelay();
    return {
      code: `BB-${userId.slice(0, 4).toUpperCase()}-X1Y2`,
      totalReferrals: 3,
      activeReferrals: 2,
      rewards: [
        { type: 'discount', description: '10% desconto na mensalidade', date: '2026-02-15' },
        { type: 'free_month', description: '1 mes gratis', date: '2026-01-20' },
      ],
    };
  }
  const { data } = await apiClient.get<ReferralStats>(`/referral/stats/${userId}`);
  return data;
}
