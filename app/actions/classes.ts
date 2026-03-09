'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function listSchedulesAction(academyId: string) {
  const supabase = await getSupabaseServerClient() as any

  if (!academyId) {
    return { success: false as const, error: 'academy_id is required' }
  }

  const { data, error } = await supabase
    .from('class_schedules')
    .select('*')
    .eq('academy_id', academyId)
    .eq('active', true)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function createScheduleAction(data: {
  academy_id: string
  name: string
  martial_art: string
  level: string
  instructor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  max_capacity?: number
  location?: string
}) {
  const supabase = await getSupabaseServerClient() as any

  if (
    !data.academy_id ||
    !data.name ||
    !data.martial_art ||
    !data.level ||
    !data.instructor_id ||
    data.day_of_week === undefined ||
    !data.start_time ||
    !data.end_time
  ) {
    return {
      success: false as const,
      error:
        'academy_id, name, martial_art, level, instructor_id, day_of_week, start_time, and end_time are required',
    }
  }

  const { data: schedule, error } = await supabase
    .from('class_schedules')
    .insert({
      academy_id: data.academy_id,
      name: data.name,
      martial_art: data.martial_art,
      level: data.level,
      instructor_id: data.instructor_id,
      day_of_week: data.day_of_week,
      start_time: data.start_time,
      end_time: data.end_time,
      max_capacity: data.max_capacity ?? 30,
      location: data.location ?? null,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: schedule }
}

export async function createSessionAction(data: {
  schedule_id: string
  academy_id: string
  date: string
  instructor_id: string
  notes?: string
}) {
  const supabase = await getSupabaseServerClient() as any

  if (!data.schedule_id || !data.academy_id || !data.date || !data.instructor_id) {
    return {
      success: false as const,
      error: 'schedule_id, academy_id, date, and instructor_id are required',
    }
  }

  const { data: session, error } = await supabase
    .from('class_sessions')
    .insert({
      schedule_id: data.schedule_id,
      academy_id: data.academy_id,
      date: data.date,
      instructor_id: data.instructor_id,
      notes: data.notes ?? null,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: session }
}
