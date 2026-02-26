import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>
type MembershipInsert = Database['public']['Tables']['memberships']['Insert']
type MembershipUpdate = Database['public']['Tables']['memberships']['Update']

interface ListMembersOpts {
  role?: string
  status?: string
  page?: number
  limit?: number
}

export async function getMembership(client: Client, id: string) {
  return client
    .from('memberships')
    .select('*, profiles(*)')
    .eq('id', id)
    .single()
}

export async function listMembers(
  client: Client,
  academyId: string,
  opts: ListMembersOpts = {},
) {
  const { role, status, page = 1, limit = 50 } = opts
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = client
    .from('memberships')
    .select('*, profiles(*)', { count: 'exact' })
    .eq('academy_id', academyId)

  if (role) {
    query = query.eq('role', role)
  }

  if (status) {
    query = query.eq('status', status)
  }

  return query.range(from, to).order('created_at', { ascending: false })
}

export async function createMembership(client: Client, data: MembershipInsert) {
  return client
    .from('memberships')
    .insert(data)
    .select()
    .single()
}

export async function updateMembership(
  client: Client,
  id: string,
  updates: MembershipUpdate,
) {
  return client
    .from('memberships')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

export async function getMembersByAcademy(client: Client, academyId: string) {
  return client
    .from('memberships')
    .select('*, profiles(*)')
    .eq('academy_id', academyId)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
}
