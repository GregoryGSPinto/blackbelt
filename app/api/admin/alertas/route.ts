import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { supabase, membership } = await withAuth(request);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito', 'FORBIDDEN', 403);
    }

    const academyId = membership.academy_id;

    // Generate smart alerts based on data
    const alerts: Array<{ id: string; type: string; severity: string; title: string; message: string; createdAt: string }> = [];

    // Check for overdue subscriptions
    const { data: overdueInvoices } = await supabase
      .from('invoices' as any)
      .select('id', { count: 'exact' })
      .eq('academy_id', academyId)
      .eq('status', 'overdue');

    if (overdueInvoices && overdueInvoices.length > 0) {
      alerts.push({
        id: 'alert-overdue',
        type: 'financial',
        severity: 'warning',
        title: 'Faturas em atraso',
        message: `${overdueInvoices.length} fatura(s) em atraso precisam de atenção.`,
        createdAt: new Date().toISOString(),
      });
    }

    // Check for inactive members (no check-in in 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: inactiveCount } = await supabase
      .from('memberships' as any)
      .select('id', { count: 'exact' })
      .eq('academy_id', academyId)
      .eq('status', 'active')
      .eq('role', 'student');

    if (inactiveCount && inactiveCount > 0) {
      alerts.push({
        id: 'alert-inactive',
        type: 'retention',
        severity: 'info',
        title: 'Alunos inativos',
        message: `Verifique alunos sem check-in recente para ações de retenção.`,
        createdAt: new Date().toISOString(),
      });
    }

    return apiOk(alerts);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
