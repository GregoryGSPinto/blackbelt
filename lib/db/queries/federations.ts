// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

export async function getFederation(client: Client, id: string) {
  return client
    .from('federations')
    .select('*')
    .eq('id', id)
    .single()
}

export async function getFederationBySlug(client: Client, slug: string) {
  return client
    .from('federations')
    .select('*')
    .eq('slug', slug)
    .single()
}

export async function listFederations(client: Client) {
  return client
    .from('federations')
    .select('*')
    .order('name')
}

export async function createFederation(
  client: Client,
  data: { name: string; slug: string; description?: string; logo_url?: string; country?: string },
) {
  return client
    .from('federations')
    .insert(data)
    .select()
    .single()
}

export async function updateFederation(
  client: Client,
  id: string,
  updates: { name?: string; description?: string; logo_url?: string; settings?: Record<string, unknown> },
) {
  return client
    .from('federations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function deleteFederation(client: Client, id: string) {
  return client
    .from('federations')
    .delete()
    .eq('id', id)
}

// Federation Memberships

export async function listFederationAcademies(client: Client, federationId: string) {
  return client
    .from('federation_memberships')
    .select('*, academies(*)')
    .eq('federation_id', federationId)
    .order('joined_at', { ascending: false })
}

export async function addAcademyToFederation(
  client: Client,
  federationId: string,
  academyId: string,
  role: 'admin' | 'member' = 'member',
) {
  return client
    .from('federation_memberships')
    .insert({ federation_id: federationId, academy_id: academyId, role })
    .select()
    .single()
}

export async function removeAcademyFromFederation(
  client: Client,
  federationId: string,
  academyId: string,
) {
  return client
    .from('federation_memberships')
    .delete()
    .eq('federation_id', federationId)
    .eq('academy_id', academyId)
}

export async function getAcademyFederations(client: Client, academyId: string) {
  return client
    .from('federation_memberships')
    .select('*, federations(*)')
    .eq('academy_id', academyId)
}

// Federation Admins

export async function listFederationAdmins(client: Client, federationId: string) {
  return client
    .from('federation_admins')
    .select('*, profiles(*)')
    .eq('federation_id', federationId)
}

export async function addFederationAdmin(
  client: Client,
  federationId: string,
  profileId: string,
  role: 'owner' | 'admin' | 'viewer' = 'admin',
) {
  return client
    .from('federation_admins')
    .insert({ federation_id: federationId, profile_id: profileId, role })
    .select()
    .single()
}

export async function removeFederationAdmin(
  client: Client,
  federationId: string,
  profileId: string,
) {
  return client
    .from('federation_admins')
    .delete()
    .eq('federation_id', federationId)
    .eq('profile_id', profileId)
}

export async function isFederationAdmin(
  client: Client,
  federationId: string,
  profileId: string,
) {
  const { data } = await client
    .from('federation_admins')
    .select('id, role')
    .eq('federation_id', federationId)
    .eq('profile_id', profileId)
    .single()

  return data ? { isAdmin: true, role: data.role } : { isAdmin: false, role: null }
}
