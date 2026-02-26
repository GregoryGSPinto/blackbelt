// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type AcademyUpdate = Database['public']['Tables']['academies']['Update']

export async function getAcademy(client: Client, id: string) {
  return client
    .from('academies')
    .select('*')
    .eq('id', id)
    .single()
}

export async function getAcademyBySlug(client: Client, slug: string) {
  return client
    .from('academies')
    .select('*')
    .eq('slug', slug)
    .single()
}

export async function updateAcademy(
  client: Client,
  id: string,
  updates: AcademyUpdate,
) {
  return client
    .from('academies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function listAcademies(client: Client) {
  return client
    .from('academies')
    .select('*')
    .order('name')
}
