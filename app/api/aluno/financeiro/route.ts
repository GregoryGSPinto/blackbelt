import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  if (!membership) return apiOk({ data: null, error: null, meta: {} });

  const [subscriptionRes, invoicesRes, paymentsRes] = await Promise.all([
    supabase.from('subscriptions')
      .select('id, plan_id, status, current_period_start, current_period_end, amount')
      .eq('membership_id', membership.id)
      .eq('status', 'active')
      .limit(1)
      .single(),
    supabase.from('invoices')
      .select('id, amount, status, due_date, paid_at, description')
      .eq('membership_id', membership.id)
      .order('due_date', { ascending: false })
      .limit(12),
    supabase.from('payments')
      .select('id, amount, status, paid_at, method')
      .eq('profile_id', user.id)
      .order('paid_at', { ascending: false })
      .limit(12),
  ]);

  return apiOk({
    data: {
      planoAtual: subscriptionRes.data ? {
        id: subscriptionRes.data.id,
        status: subscriptionRes.data.status,
        valor: subscriptionRes.data.amount,
        inicioPeríodo: subscriptionRes.data.current_period_start,
        fimPeríodo: subscriptionRes.data.current_period_end,
      } : null,
      faturas: (invoicesRes.data || []).map((i: any) => ({
        id: i.id,
        valor: i.amount,
        status: i.status,
        vencimento: i.due_date,
        pagamento: i.paid_at,
        descricao: i.description,
      })),
      pagamentos: (paymentsRes.data || []).map((p: any) => ({
        id: p.id,
        valor: p.amount,
        status: p.status,
        data: p.paid_at,
        metodo: p.method,
      })),
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
