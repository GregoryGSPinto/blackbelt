import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  if (!membership) return apiOk({ data: null, error: 'Sem membership ativa', meta: {} });

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, streakRes, checkinsMonthRes, checkinsTodayRes, nextClassRes, achievementsRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('streaks').select('current_streak, longest_streak')
      .eq('membership_id', membership.id).single(),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership.id)
      .gte('checked_in_at', thirtyDaysAgo),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership.id)
      .gte('checked_in_at', `${today}T00:00:00`),
    supabase.from('class_enrollments')
      .select('class_schedules!inner(name, day_of_week, start_time, end_time, location)')
      .eq('membership_id', membership.id)
      .eq('status', 'active')
      .limit(1),
    supabase.from('member_achievements').select('id', { count: 'exact' })
      .eq('membership_id', membership.id),
  ]);

  return apiOk({
    data: {
      nome: profileRes.data?.full_name || '',
      avatar: profileRes.data?.avatar_url || null,
      streak: streakRes.data?.current_streak || 0,
      maiorStreak: streakRes.data?.longest_streak || 0,
      frequenciaMes: checkinsMonthRes.count || 0,
      checkinsHoje: checkinsTodayRes.count || 0,
      conquistas: achievementsRes.count || 0,
      proximaAula: nextClassRes.data?.[0]?.class_schedules || null,
      faixa: membership.role === 'student' ? (membership as any).belt_rank || 'branca' : null,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
