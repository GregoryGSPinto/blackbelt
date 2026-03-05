// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type PointsInsert = Database['public']['Tables']['points_ledger']['Insert']
type MemberAchievementInsert = Database['public']['Tables']['member_achievements']['Insert']

interface LeaderboardOpts {
  page?: number
  limit?: number
}

export async function addPoints(client: Client, data: PointsInsert) {
  return client
    .from('points_ledger')
    .insert(data)
    .select()
    .single()
}

export async function getStreak(client: Client, membershipId: string) {
  return client
    .from('streaks')
    .select('*')
    .eq('membership_id', membershipId)
    .single()
}

export async function getLeaderboard(
  client: Client,
  academyId: string,
  opts: LeaderboardOpts = {},
) {
  const { page = 1, limit = 20 } = opts
  const from = (page - 1) * limit
  const to = from + limit - 1

  return client
    .from('leaderboard_view')
    .select('*')
    .eq('academy_id', academyId)
    .order('total_points', { ascending: false })
    .range(from, to)
}

export async function getAchievements(client: Client) {
  return client
    .from('achievements')
    .select('*')
    .order('category')
    .order('threshold')
}

export async function unlockAchievement(client: Client, data: MemberAchievementInsert) {
  return client
    .from('member_achievements')
    .insert(data)
    .select('*, achievements(*)')
    .single()
}

export async function getGamificationProfile(client: Client, membershipId: string) {
  const [pointsResult, streakResult, achievementsResult] = await Promise.all([
    client
      .from('points_ledger')
      .select('points')
      .eq('membership_id', membershipId),
    client
      .from('streaks')
      .select('*')
      .eq('membership_id', membershipId)
      .single(),
    client
      .from('member_achievements')
      .select('*, achievements(*)')
      .eq('membership_id', membershipId)
      .order('unlocked_at', { ascending: false }),
  ])

  const totalPoints = (pointsResult.data ?? []).reduce(
    (sum, row) => sum + (row.points ?? 0),
    0,
  )

  return {
    totalPoints,
    streak: streakResult.data,
    achievements: achievementsResult.data ?? [],
  }
}

export async function updateStreak(
  client: Client,
  membershipId: string,
  currentStreak: number,
  bestStreak?: number,
) {
  return client
    .from('streaks')
    .upsert(
      {
        membership_id: membershipId,
        current_streak: currentStreak,
        best_streak: bestStreak ?? currentStreak,
      },
      { onConflict: 'membership_id' },
    )
    .select()
    .single()
}

export async function getMemberAchievements(client: Client, membershipId: string) {
  return client
    .from('member_achievements')
    .select('*, achievements(*)')
    .eq('membership_id', membershipId)
    .order('unlocked_at', { ascending: false })
}

export async function getAcademyAchievements(client: Client, academyId: string) {
  return client
    .from('member_achievements')
    .select('*, achievements(*), memberships!inner(academy_id, profiles(*))')
    .eq('memberships.academy_id', academyId)
    .order('unlocked_at', { ascending: false })
}
