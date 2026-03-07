import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ data: null, error: null, meta: {} });

  const [achievementsRes, checkinsRes, recentAchievementsRes] = await Promise.all([
    supabase.from('member_achievements').select('id', { count: 'exact' })
      .eq('membership_id', membership.id),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership.id),
    supabase.from('member_achievements')
      .select('id, unlocked_at, achievements!inner(title, icon)')
      .eq('membership_id', membership.id)
      .order('unlocked_at', { ascending: false })
      .limit(10),
  ]);

  const starsFromAchievements = (achievementsRes.count || 0) * 3;
  const starsFromCheckins = (checkinsRes.count || 0) * 1;
  const totalStars = starsFromAchievements + starsFromCheckins;

  const historico = (recentAchievementsRes.data || []).map((a: any) => ({
    id: a.id,
    titulo: a.achievements?.title || '',
    icone: a.achievements?.icon || '⭐',
    estrelas: 3,
    data: a.unlocked_at,
  }));

  return apiOk({
    data: {
      total: totalStars,
      porConquistas: starsFromAchievements,
      porPresenca: starsFromCheckins,
      historico,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
