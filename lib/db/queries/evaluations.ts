// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

export async function getEvaluations(client: Client, membershipId: string) {
  return client
    .from('evaluations')
    .select('*, profiles:evaluator_id (id, full_name, avatar_url)')
    .eq('student_membership_id', membershipId)
    .order('created_at', { ascending: false })
}

export async function createEvaluation(
  client: Client,
  data: {
    evaluator_id: string
    student_membership_id: string
    academy_id: string
    type: string
    status?: string
    score?: Record<string, unknown>
    notes?: string
    evaluated_at?: string
  },
) {
  return client
    .from('evaluations')
    .insert(data)
    .select()
    .single()
}

export async function updateEvaluation(
  client: Client,
  evaluationId: string,
  data: {
    status?: string
    score?: Record<string, unknown>
    notes?: string
    evaluated_at?: string
  },
) {
  return client
    .from('evaluations')
    .update(data)
    .eq('id', evaluationId)
    .select()
    .single()
}

export async function getPendingEvaluations(
  client: Client,
  professorId: string,
  academyId: string,
) {
  return client
    .from('evaluations')
    .select('*, memberships:student_membership_id (*, profiles(*))')
    .eq('evaluator_id', professorId)
    .eq('academy_id', academyId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
}
