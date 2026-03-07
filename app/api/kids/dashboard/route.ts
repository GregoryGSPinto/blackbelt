import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  if (!membership) return apiOk({ data: null, error: null, meta: {} });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profileRes, streakRes, achievementsRes, checkinsRes, nextClassRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('streaks').select('current_streak, longest_streak')
      .eq('membership_id', membership.id).single(),
    supabase.from('member_achievements').select('id', { count: 'exact' })
      .eq('membership_id', membership.id),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership.id)
      .gte('checked_in_at', thirtyDaysAgo),
    supabase.from('class_enrollments')
      .select('class_schedules!inner(name, day_of_week, start_time)')
      .eq('membership_id', membership.id)
      .eq('status', 'active')
      .limit(1),
  ]);

  // Calculate stars from achievements and attendance
  const starsFromAchievements = (achievementsRes.count || 0) * 3;
  const starsFromCheckins = (checkinsRes.count || 0) * 1;
  const totalStars = starsFromAchievements + starsFromCheckins;

  // Animal levels based on stars
  const animalLevels = ['Gatinho', 'Coelho', 'Raposa', 'Lobo', 'Urso', 'Águia', 'Leão', 'Dragão'];
  const levelIndex = Math.min(Math.floor(totalStars / 30), animalLevels.length - 1);
  const animalLevel = animalLevels[levelIndex];

  return apiOk({
    data: {
      nome: profileRes.data?.full_name || '',
      avatar: profileRes.data?.avatar_url || null,
      estrelas: totalStars,
      nivelAnimal: animalLevel,
      nivelIndex: levelIndex,
      streak: streakRes.data?.current_streak || 0,
      conquistas: achievementsRes.count || 0,
      frequenciaMes: checkinsRes.count || 0,
      faixa: (membership as any).belt_rank || 'branca',
      proximaAula: nextClassRes.data?.[0]?.class_schedules || null,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
