// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type PromotionInsert = Database['public']['Tables']['promotions']['Insert']
type AssessmentInsert = Database['public']['Tables']['skill_assessments']['Insert']

export async function getBeltSystem(client: Client, martialArt: string) {
  return client
    .from('belt_systems')
    .select('*')
    .eq('martial_art', martialArt)
    .single()
}

export async function getPromotions(client: Client, membershipId: string) {
  return client
    .from('promotions')
    .select('*, belt_systems(*)')
    .eq('membership_id', membershipId)
    .order('promoted_at', { ascending: false })
}

export async function createPromotion(client: Client, data: PromotionInsert) {
  return client
    .from('promotions')
    .insert(data)
    .select()
    .single()
}

export async function getSkillTrack(client: Client, id: string) {
  return client
    .from('skill_tracks')
    .select('*')
    .eq('id', id)
    .single()
}

export async function recordAssessment(client: Client, data: AssessmentInsert) {
  return client
    .from('skill_assessments')
    .insert(data)
    .select()
    .single()
}

export async function getMilestones(client: Client, membershipId: string) {
  return client
    .from('milestones')
    .select('*')
    .eq('membership_id', membershipId)
    .order('achieved_at', { ascending: false })
}
