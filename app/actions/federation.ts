'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { Json } from '@/lib/supabase/types'

export async function createFederationAction(data: {
  name: string
  slug: string
  description?: string
  country?: string
}) {
  const supabase = await getSupabaseServerClient() as any
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) return { success: false as const, error: 'Not authenticated' }

  const { data: federation, error } = await supabase
    .from('federations')
    .insert(data)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }

  // Add creator as owner
  await supabase.from('federation_admins').insert({
    federation_id: federation.id,
    profile_id: user.user.id,
    role: 'owner',
  })

  return { success: true as const, data: federation }
}

export async function updateFederationAction(
  federationId: string,
  updates: { name?: string; description?: string; logo_url?: string; settings?: Json },
) {
  const supabase = await getSupabaseServerClient() as any

  const { data, error } = await supabase
    .from('federations')
    .update(updates)
    .eq('id', federationId)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function addAcademyToFederationAction(
  federationId: string,
  academyId: string,
) {
  const supabase = await getSupabaseServerClient() as any

  const { data, error } = await supabase
    .from('federation_memberships')
    .insert({ federation_id: federationId, academy_id: academyId, role: 'member' })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function removeAcademyFromFederationAction(
  federationId: string,
  academyId: string,
) {
  const supabase = await getSupabaseServerClient() as any

  const { error } = await supabase
    .from('federation_memberships')
    .delete()
    .eq('federation_id', federationId)
    .eq('academy_id', academyId)

  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function addFederationAdminAction(
  federationId: string,
  profileId: string,
  role: 'admin' | 'viewer' = 'admin',
) {
  const supabase = await getSupabaseServerClient() as any

  const { data, error } = await supabase
    .from('federation_admins')
    .insert({ federation_id: federationId, profile_id: profileId, role })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function removeFederationAdminAction(
  federationId: string,
  profileId: string,
) {
  const supabase = await getSupabaseServerClient() as any

  const { error } = await supabase
    .from('federation_admins')
    .delete()
    .eq('federation_id', federationId)
    .eq('profile_id', profileId)

  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function listFederationsAction() {
  const supabase = await getSupabaseServerClient() as any

  const { data, error } = await supabase
    .from('federations')
    .select('*')
    .order('name')

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: data ?? [] }
}

export async function getFederationWithAcademiesAction(federationId: string) {
  const supabase = await getSupabaseServerClient() as any

  const [fedResult, membersResult, adminsResult] = await Promise.all([
    supabase.from('federations').select('*').eq('id', federationId).single(),
    supabase.from('federation_memberships').select('*, academies(*)').eq('federation_id', federationId),
    supabase.from('federation_admins').select('*, profiles(*)').eq('federation_id', federationId),
  ])

  if (fedResult.error) return { success: false as const, error: fedResult.error.message }

  return {
    success: true as const,
    data: {
      federation: fedResult.data,
      academies: membersResult.data ?? [],
      admins: adminsResult.data ?? [],
    },
  }
}
