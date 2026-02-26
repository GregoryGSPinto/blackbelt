import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  const academyId = membership!.academy_id;
  const today = new Date().toISOString().split('T')[0];

  const [profileRes, streakRes, checkinsRes, achievementsRes, notifRes] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single(),
    supabase.from('streaks').select('current_streak, longest_streak')
      .eq('membership_id', membership!.id).single(),
    supabase.from('attendances').select('id', { count: 'exact' })
      .eq('membership_id', membership!.id)
      .gte('checked_in_at', `${today}T00:00:00`),
    supabase.from('member_achievements').select('id', { count: 'exact' })
      .eq('membership_id', membership!.id),
    supabase.from('notifications').select('id, title, body, type, created_at')
      .eq('profile_id', user.id).eq('read', false).order('created_at', { ascending: false }).limit(5),
  ]);

  return apiOk({
    nome: profileRes.data?.full_name || '',
    avatar: profileRes.data?.avatar_url || null,
    sequencia: streakRes.data?.current_streak || 0,
    maiorSequencia: streakRes.data?.longest_streak || 0,
    checkinsHoje: checkinsRes.count || 0,
    conquistas: achievementsRes.count || 0,
    notificacoes: notifRes.data || [],
  });
});
