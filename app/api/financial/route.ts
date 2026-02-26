import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const view = url.searchParams.get('view'); // 'plans' | 'subscriptions' | 'invoices' | 'dashboard'
    const alunoId = url.searchParams.get('alunoId');

    if (view === 'plans') {
      const { data, error } = await supabase
        .from('plans' as any)
        .select('*')
        .eq('academy_id', membership.academy_id)
        .eq('active', true)
        .order('price_cents');

      if (error) throw error;
      return apiOk(data);
    }

    if (view === 'subscriptions') {
      let query = supabase
        .from('subscriptions' as any)
        .select('*, plans(name, price_cents, interval_months), memberships!inner(profile_id, profiles!inner(full_name))')
        .eq('memberships.academy_id', membership.academy_id)
        .order('created_at', { ascending: false });

      if (alunoId) {
        const { data: mem } = await supabase
          .from('memberships' as any)
          .select('id')
          .eq('profile_id', alunoId)
          .eq('academy_id', membership.academy_id)
          .single();
        if (mem) query = query.eq('membership_id', mem.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return apiOk(data);
    }

    if (view === 'invoices') {
      let query = supabase
        .from('invoices' as any)
        .select('*, subscriptions!inner(membership_id, memberships!inner(profile_id, profiles!inner(full_name)))')
        .order('due_date', { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;
      return apiOk(data);
    }

    // Default: dashboard summary
    const academyId = membership.academy_id;

    const [plansRes, subsRes, invoicesRes] = await Promise.all([
      supabase.from('plans' as any).select('id', { count: 'exact' }).eq('academy_id', academyId).eq('active', true),
      supabase.from('subscriptions' as any).select('id, status', { count: 'exact' }),
      supabase.from('invoices' as any).select('id, status, amount_cents').eq('status', 'pending'),
    ]);

    const activeSubs = subsRes.data?.filter((s: any) => s.status === 'active').length || 0;
    const pendingInvoices = invoicesRes.data?.length || 0;
    const pendingAmount = invoicesRes.data?.reduce((sum: number, inv: any) => sum + (inv.amount_cents || 0), 0) || 0;

    return apiOk({
      totalPlans: plansRes.count || 0,
      activeSubscriptions: activeSubs,
      pendingInvoices,
      pendingAmountCents: pendingAmount,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
