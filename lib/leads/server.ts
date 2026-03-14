import { withSuperAdminAccess } from '@/lib/api/access-context';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export async function requireSuperAdmin() {
  const { user } = await withSuperAdminAccess();
  const supabase = getSupabaseAdminClient() as any;

  return {
    user,
    supabase,
  };
}

export function asNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && value.trim()) return Number(value);
  return 0;
}

export function formatCurrency(value: number | null | undefined, currency = 'BRL') {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}
