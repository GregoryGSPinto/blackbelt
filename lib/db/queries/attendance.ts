// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type AttendanceInsert = Database['public']['Tables']['attendances']['Insert']

interface AttendanceByMemberOpts {
  from?: string
  to?: string
  page?: number
  limit?: number
}

interface AttendanceStatsOpts {
  from?: string
  to?: string
}

export async function recordAttendance(client: Client, data: AttendanceInsert) {
  return client
    .from('attendances')
    .insert(data)
    .select()
    .single()
}

export async function getAttendanceBySession(client: Client, sessionId: string) {
  return client
    .from('attendances')
    .select('*, memberships(*, profiles(*))')
    .eq('session_id', sessionId)
    .order('checked_in_at')
}

export async function getAttendanceByMember(
  client: Client,
  membershipId: string,
  opts: AttendanceByMemberOpts = {},
) {
  const { from, to, page = 1, limit = 50 } = opts
  const offset = (page - 1) * limit

  let query = client
    .from('attendances')
    .select('*, class_sessions(*, class_schedules(*))', { count: 'exact' })
    .eq('membership_id', membershipId)

  if (from) {
    query = query.gte('checked_in_at', from)
  }

  if (to) {
    query = query.lte('checked_in_at', to)
  }

  return query
    .range(offset, offset + limit - 1)
    .order('checked_in_at', { ascending: false })
}

export async function getAttendanceStats(
  client: Client,
  academyId: string,
  opts: AttendanceStatsOpts = {},
) {
  const { from, to } = opts

  let query = client
    .from('attendances')
    .select('*', { count: 'exact', head: true })
    .eq('academy_id', academyId)

  if (from) {
    query = query.gte('checked_in_at', from)
  }

  if (to) {
    query = query.lte('checked_in_at', to)
  }

  return query
}
