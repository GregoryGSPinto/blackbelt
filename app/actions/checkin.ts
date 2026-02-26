'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function recordCheckinAction(data: {
  sessionId: string
  membershipId: string
  academyId: string
  method?: string
}) {
  const supabase = await getSupabaseServerClient()

  if (!data.sessionId || !data.membershipId || !data.academyId) {
    return {
      success: false as const,
      error: 'sessionId, membershipId, and academyId are required',
    }
  }

  // Check for duplicate check-in
  const { data: existing } = await supabase
    .from('attendances')
    .select('id')
    .eq('session_id', data.sessionId)
    .eq('membership_id', data.membershipId)
    .maybeSingle()

  if (existing) {
    return { success: false as const, error: 'Member already checked in for this session' }
  }

  const { data: attendance, error } = await supabase
    .from('attendances')
    .insert({
      session_id: data.sessionId,
      membership_id: data.membershipId,
      academy_id: data.academyId,
      checkin_method: data.method ?? 'manual',
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: attendance }
}

export async function getSessionAttendanceAction(sessionId: string) {
  const supabase = await getSupabaseServerClient()

  if (!sessionId) {
    return { success: false as const, error: 'sessionId is required' }
  }

  const { data, error } = await supabase
    .from('attendances')
    .select('*, memberships:membership_id(*, profiles:profile_id(*))')
    .eq('session_id', sessionId)
    .order('checked_in_at', { ascending: true })

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}
