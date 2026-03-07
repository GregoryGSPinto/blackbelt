import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  if (!membership) return apiOk({ data: null, error: null, meta: {} });

  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, streakRes, achievementsRes, checkinsRes, rankingRes, nextClassRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url, birth_date').eq('id', user.id).single(),
    supabase.from('streaks').select('current_streak, longest_streak')
      .eq('membership_id', membership.id).single(),
    supabase.from('member_achievements').select('id', { count: 'exact' })
      .eq('membership_id', membership.id),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership.id)
      .gte('checked_in_at', thirtyDaysAgo),
    supabase.from('memberships')
      .select('id')
      .eq('academy_id', membership.academy_id)
      .eq('role', 'student')
      .eq('status', 'active'),
    supabase.from('class_enrollments')
      .select('class_schedules!inner(name, day_of_week, start_time)')
      .eq('membership_id', membership.id)
      .eq('status', 'active')
      .limit(1),
  ]);

  // Calculate XP from achievements and attendance
  const xpFromAchievements = (achievementsRes.count || 0) * 50;
  const xpFromCheckins = (checkinsRes.count || 0) * 10;
  const xpTotal = xpFromAchievements + xpFromCheckins;
  const level = Math.floor(xpTotal / 200) + 1;

  // Simple ranking position
  const totalStudents = rankingRes.data?.length || 1;
  const rankingPosition = Math.max(1, Math.ceil(totalStudents * 0.3)); // estimate top 30%

  return apiOk({
    data: {
      nome: profileRes.data?.full_name || '',
      avatar: profileRes.data?.avatar_url || null,
      xpTotal,
      level,
      streak: streakRes.data?.current_streak || 0,
      maiorStreak: streakRes.data?.longest_streak || 0,
      conquistas: achievementsRes.count || 0,
      frequenciaMes: checkinsRes.count || 0,
      ranking: rankingPosition,
      totalAlunos: totalStudents,
      faixa: (membership as any).belt_rank || 'branca',
      proximaAula: nextClassRes.data?.[0]?.class_schedules || null,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
