import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type ScheduleInsert = Database['public']['Tables']['class_schedules']['Insert']
type SessionInsert = Database['public']['Tables']['class_sessions']['Insert']

interface ListSchedulesOpts {
  martialArt?: string
  level?: string
  dayOfWeek?: number
  active?: boolean
}

interface ListSessionsOpts {
  date?: string
  scheduleId?: string
}

export async function getSchedule(client: Client, id: string) {
  return client
    .from('class_schedules')
    .select('*')
    .eq('id', id)
    .single()
}

export async function listSchedules(
  client: Client,
  academyId: string,
  opts: ListSchedulesOpts = {},
) {
  const { martialArt, level, dayOfWeek, active } = opts

  let query = client
    .from('class_schedules')
    .select('*')
    .eq('academy_id', academyId)

  if (martialArt) {
    query = query.eq('martial_art', martialArt)
  }

  if (level) {
    query = query.eq('level', level)
  }

  if (dayOfWeek !== undefined) {
    query = query.eq('day_of_week', dayOfWeek)
  }

  if (active !== undefined) {
    query = query.eq('active', active)
  }

  return query.order('day_of_week').order('start_time')
}

export async function createSchedule(client: Client, data: ScheduleInsert) {
  return client
    .from('class_schedules')
    .insert(data)
    .select()
    .single()
}

export async function getSession(client: Client, id: string) {
  return client
    .from('class_sessions')
    .select('*, class_schedules(*)')
    .eq('id', id)
    .single()
}

export async function listSessions(
  client: Client,
  academyId: string,
  opts: ListSessionsOpts = {},
) {
  const { date, scheduleId } = opts

  let query = client
    .from('class_sessions')
    .select('*, class_schedules(*)')
    .eq('academy_id', academyId)

  if (date) {
    query = query.eq('date', date)
  }

  if (scheduleId) {
    query = query.eq('schedule_id', scheduleId)
  }

  return query.order('date', { ascending: false })
}

export async function createSession(client: Client, data: SessionInsert) {
  return client
    .from('class_sessions')
    .insert(data)
    .select()
    .single()
}

export async function getEnrollments(client: Client, scheduleId: string) {
  return client
    .from('class_enrollments')
    .select('*, memberships(*, profiles(*))')
    .eq('schedule_id', scheduleId)
    .eq('status', 'active')
    .order('enrolled_at')
}
