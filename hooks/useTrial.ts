// ============================================================
// Hook: useTrial - Gerenciamento de trial no frontend
// ============================================================

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { TrialStatusResponse, StartTrialResponse } from '@/lib/subscription/types-v3';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UseTrialReturn {
  trialStatus: TrialStatusResponse | null;
  loading: boolean;
  error: string | null;
  startTrial: (planId: string, academyData: {
    name: string;
    email: string;
    cnpj: string;
    phone: string;
  }) => Promise<StartTrialResponse | null>;
  convertTrial: (billingCycle: 'monthly' | 'annual') => Promise<boolean>;
  refreshStatus: () => Promise<void>;
}

export function useTrial(academyId?: string): UseTrialReturn {
  const [trialStatus, setTrialStatus] = useState<TrialStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!academyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/trial/status?academy_id=${academyId}`);
      
      if (response.ok) {
        const data = await response.json();
        setTrialStatus(data);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to fetch trial status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [academyId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startTrial = async (
    planId: string,
    academyData: { name: string; email: string; cnpj: string; phone: string }
  ): Promise<StartTrialResponse | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          academy_data: academyData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start trial');
        return null;
      }

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const convertTrial = async (billingCycle: 'monthly' | 'annual'): Promise<boolean> => {
    if (!academyId) {
      setError('No academy ID provided');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/trial/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academy_id: academyId,
          billing_cycle: billingCycle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to convert trial');
        return false;
      }

      // Refresh status after conversion
      await fetchStatus();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    trialStatus,
    loading,
    error,
    startTrial,
    convertTrial,
    refreshStatus: fetchStatus,
  };
}

// Hook para verificar limitações do trial em features
export function useTrialLimits(academyId?: string) {
  const [limits, setLimits] = useState({
    canUseFeature: true,
    message: '',
  });

  const checkLimit = useCallback(async (feature: string) => {
    if (!academyId) return;

    try {
      const response = await fetch(`/api/trial/check-limit?academy_id=${academyId}&feature=${feature}`);
      const data = await response.json();
      
      setLimits({
        canUseFeature: data.allowed,
        message: data.message || '',
      });
    } catch {
      setLimits({
        canUseFeature: false,
        message: 'Erro ao verificar limites do trial',
      });
    }
  }, [academyId]);

  return { limits, checkLimit };
}
