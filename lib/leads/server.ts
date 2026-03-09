import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function requireSuperAdmin() {
  const authClient = await getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error('UNAUTHORIZED');
  }

  const supabase = getSupabaseAdminClient() as any;
  const { data: access, error: accessError } = await supabase
    .from('usuarios_academia')
    .select('perfil')
    .eq('usuario_id', user.id)
    .eq('perfil', 'SUPER_ADMIN')
    .single();

  if (accessError || !access) {
    throw new Error('FORBIDDEN');
  }

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
