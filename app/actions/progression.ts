// @ts-nocheck
'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function grantPromotionAction(data: {
  membership_id: string
  academy_id: string
  belt_system_id: string
  from_rank?: string
  to_rank: string
  promoted_by: string
  notes?: string
}) {
  const supabase = await getSupabaseServerClient()

  if (
    !data.membership_id ||
    !data.academy_id ||
    !data.belt_system_id ||
    !data.to_rank ||
    !data.promoted_by
  ) {
    return {
      success: false as const,
      error:
        'membership_id, academy_id, belt_system_id, to_rank, and promoted_by are required',
    }
  }

  // Insert the promotion record
  const { data: promotion, error: promotionError } = await supabase
    .from('promotions')
    .insert({
      membership_id: data.membership_id,
      academy_id: data.academy_id,
      belt_system_id: data.belt_system_id,
      from_rank: data.from_rank ?? null,
      to_rank: data.to_rank,
      promoted_by: data.promoted_by,
      notes: data.notes ?? null,
    })
    .select()
    .single()

  if (promotionError) return { success: false as const, error: promotionError.message }

  // Update the member's current belt_rank
  const { error: updateError } = await supabase
    .from('memberships')
    .update({ belt_rank: data.to_rank })
    .eq('id', data.membership_id)

  if (updateError) return { success: false as const, error: updateError.message }

  return { success: true as const, data: promotion }
}

export async function recordAssessmentAction(data: {
  membership_id: string
  skill_track_id: string
  skill_key: string
  score: number
  assessed_by: string
  notes?: string
}) {
  const supabase = await getSupabaseServerClient()

  if (
    !data.membership_id ||
    !data.skill_track_id ||
    !data.skill_key ||
    data.score === undefined ||
    !data.assessed_by
  ) {
    return {
      success: false as const,
      error:
        'membership_id, skill_track_id, skill_key, score, and assessed_by are required',
    }
  }

  const { data: assessment, error } = await supabase
    .from('skill_assessments')
    .insert({
      membership_id: data.membership_id,
      skill_track_id: data.skill_track_id,
      skill_key: data.skill_key,
      score: data.score,
      assessed_by: data.assessed_by,
      notes: data.notes ?? null,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: assessment }
}

export async function getStudentProgressionAction(membershipId: string) {
  const supabase = await getSupabaseServerClient()

  if (!membershipId) {
    return { success: false as const, error: 'membershipId is required' }
  }

  const [promotionsResult, assessmentsResult, milestonesResult] = await Promise.all([
    supabase
      .from('promotions')
      .select('*')
      .eq('membership_id', membershipId)
      .order('promoted_at', { ascending: false }),
    supabase
      .from('skill_assessments')
      .select('*, skill_tracks:skill_track_id(*)')
      .eq('membership_id', membershipId)
      .order('assessed_at', { ascending: false }),
    supabase
      .from('milestones')
      .select('*')
      .eq('membership_id', membershipId)
      .order('achieved_at', { ascending: false }),
  ])

  if (promotionsResult.error) {
    return { success: false as const, error: promotionsResult.error.message }
  }
  if (assessmentsResult.error) {
    return { success: false as const, error: assessmentsResult.error.message }
  }
  if (milestonesResult.error) {
    return { success: false as const, error: milestonesResult.error.message }
  }

  return {
    success: true as const,
    data: {
      promotions: promotionsResult.data,
      assessments: assessmentsResult.data,
      milestones: milestonesResult.data,
    },
  }
}
