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
