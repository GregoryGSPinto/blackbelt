import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const { url, page, limit, offset } = getPagination(req);
  const path = url.pathname;
  const academyId = membership!.academy_id;

  // /api/pagamentos/planos
  if (path.includes('/planos')) {
    const { data } = await supabase.from('plans').select('*')
      .eq('academy_id', academyId).eq('active', true);
    return apiOk(data || []);
  }

  // /api/pagamentos/assinaturas
  if (path.includes('/assinaturas')) {
    const { data } = await supabase.from('subscriptions').select('*, plans!inner(name, price_cents)')
      .eq('academy_id', academyId).order('created_at', { ascending: false });
    return apiOk(data || []);
  }

  // Default: invoices
  const { data, count } = await supabase.from('invoices')
    .select('*, subscriptions!inner(membership_id)', { count: 'exact' })
    .eq('academy_id', academyId)
    .range(offset, offset + limit - 1)
    .order('due_date', { ascending: false });

  return apiOk({ faturas: data || [], total: count || 0, page, limit });
});
