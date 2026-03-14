import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { supabase, membership } = await withAuth(request);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');
    if (!['owner', 'admin'].includes(membership.role)) {
      return apiError('Acesso restrito a administradores', 'FORBIDDEN', 403);
    }

    const academyId = membership.academy_id;
    const today = new Date().toISOString().split('T')[0];

    const [membersRes, todayCheckinsRes, classesRes] = await Promise.all([
      supabase
        .from('memberships' as any)
        .select('role')
        .eq('academy_id', academyId)
        .eq('status', 'active'),
      supabase
        .from('attendances' as any)
        .select('id', { count: 'exact' })
        .eq('academy_id', academyId)
        .gte('checked_in_at', `${today}T00:00:00`),
      supabase
        .from('class_schedules' as any)
        .select('id', { count: 'exact' })
        .eq('academy_id', academyId)
        .eq('active', true),
    ]);

    const members = membersRes.data || [];
    const students = members.filter((m: any) => m.role === 'student').length;
    const instructors = members.filter((m: any) => m.role === 'professor').length;

    return apiOk({
      totalActiveMembers: members.length,
      students,
      instructors,
      todayCheckins: todayCheckinsRes.count || 0,
      activeClasses: classesRes.count || 0,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
