// ============================================================
// Pricing Hooks
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PricingResponse, AcademyWithSubscription } from './types';
import { logger } from '@/lib/logger';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseBrowserClient()[prop as keyof ReturnType<typeof getSupabaseBrowserClient>];
  },
});

/**
 * Hook to subscribe to realtime pricing updates
 */
export function useRealtimePricing(onUpdate?: (payload: any) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('pricing_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pricing_config' },
        (payload: any) => {
          logger.info('[Pricing]', 'Realtime update received', payload);
          onUpdate?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onUpdate]);
}

/**
 * Hook to fetch and manage current pricing
 */
export function usePricing() {
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pricing/current');
      if (!response.ok) throw new Error('Failed to fetch pricing');
      const data = await response.json();
      setPricing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  // Subscribe to realtime updates
  useRealtimePricing(() => {
    // Refetch pricing when there's an update
    fetchPricing();
  });

  return { pricing, loading, error, refetch: fetchPricing };
}

/**
 * Hook for super admin to manage pricing
 */
export function usePricingAdmin() {
  const [updating, setUpdating] = useState(false);

  const updatePrice = async (
    configKey: string, 
    newValue: number, 
    reason?: string
  ): Promise<boolean> => {
    try {
      setUpdating(true);
      const response = await fetch('/api/admin/pricing/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config_key: configKey, new_value: newValue, reason })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update pricing');
      }

      return true;
    } catch (error) {
      console.error('Update pricing error:', error);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  return { updatePrice, updating };
}

/**
 * Hook to fetch academies for super admin
 */
export function useAcademies(filters?: {
  plan?: string;
  status?: string;
  search?: string;
}) {
  const [academies, setAcademies] = useState<AcademyWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAcademies = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters?.plan) params.append('plan', filters.plan);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/super-admin/academies?${params}`);
      if (!response.ok) throw new Error('Failed to fetch academies');
      
      const { data } = await response.json();
      setAcademies(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [filters?.plan, filters?.status, filters?.search]);

  useEffect(() => {
    fetchAcademies();
  }, [fetchAcademies]);

  return { academies, loading, error, refetch: fetchAcademies };
}

/**
 * Hook to check if user is super admin
 */
export function useIsSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsSuperAdmin(false);
          return;
        }

        const { data } = await supabase
          .from('memberships')
          .select('role')
          .eq('profile_id', session.user.id)
          .eq('status', 'active')
          .eq('role', 'super_admin')
          .maybeSingle();

        setIsSuperAdmin(data?.role === 'super_admin');
      } catch {
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  return { isSuperAdmin, loading };
}
