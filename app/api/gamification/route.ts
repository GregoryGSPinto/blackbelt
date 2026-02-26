import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function GET(req: NextRequest) {
  try {
    const { supabase, membership } = await withAuth(req);
    if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

    const url = new URL(req.url);
    const memberId = url.searchParams.get('memberId') || membership.id;

    // Points total
    const { data: pointsData } = await supabase
      .from('points_ledger' as any)
      .select('points')
      .eq('membership_id', memberId);

    const totalPoints = pointsData?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) || 0;

    // Streak
    const { data: streak } = await supabase
      .from('streaks' as any)
      .select('*')
      .eq('membership_id', memberId)
      .maybeSingle();

    // Achievements
    const { data: memberAchievements } = await supabase
      .from('member_achievements' as any)
      .select('*, achievements(key, name, threshold, points)')
      .eq('membership_id', memberId)
      .order('unlocked_at', { ascending: false });

    // All available achievements
    const { data: allAchievements } = await supabase
      .from('achievements' as any)
      .select('*')
      .order('threshold');

    // Recent points history
    const { data: recentPoints } = await supabase
      .from('points_ledger' as any)
      .select('*')
      .eq('membership_id', memberId)
      .order('created_at', { ascending: false })
      .limit(20);

    return apiOk({
      totalPoints,
      streak: streak || { current_streak: 0, longest_streak: 0, last_activity_date: null },
      unlockedAchievements: memberAchievements || [],
      availableAchievements: allAchievements || [],
      recentPoints: recentPoints || [],
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
