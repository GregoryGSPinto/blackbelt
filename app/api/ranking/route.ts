import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const { url } = getPagination(req);
  const path = url.pathname;

  // /api/ranking/me
  if (path.includes('/me')) {
    const { data: points } = await supabase.from('points_ledger')
      .select('points').eq('membership_id', membership!.id);
    const total = (points || []).reduce((sum: number, p: any) => sum + p.points, 0);
    const { data: streak } = await supabase.from('streaks')
      .select('current_streak, longest_streak').eq('membership_id', membership!.id).single();
    return apiOk({ totalPoints: total, streak: streak?.current_streak || 0, longestStreak: streak?.longest_streak || 0 });
  }

  // /api/ranking (leaderboard)
  const { data } = await supabase.from('leaderboard_view')
    .select('*').eq('academy_id', membership!.academy_id)
    .order('total_points', { ascending: false }).limit(50);

  return apiOk(data || []);
});
