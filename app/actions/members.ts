'use server'

import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function listMembersAction(
  academyId: string,
  opts?: {
    role?: string
    status?: string
    search?: string
    limit?: number
    offset?: number
  }
) {
  const supabase = await getSupabaseServerClient() as any

  let query = supabase
    .from('memberships')
    .select('*, profiles(*)', { count: 'exact' })
    .eq('academy_id', academyId)

  if (opts?.role) {
    query = query.eq('role', opts.role)
  }

  if (opts?.status) {
    query = query.eq('status', opts.status)
  }

  if (opts?.search) {
    query = query.ilike('profiles.full_name', `%${opts.search}%`)
  }

  if (opts?.limit) {
    query = query.limit(opts.limit)
  }

  if (opts?.offset) {
    query = query.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data, count }
}

export async function createMemberAction(data: {
  profile_id: string
  academy_id: string
  role: string
  status?: string
  belt_rank?: string
}) {
  const supabase = await getSupabaseServerClient() as any

  if (!data.profile_id || !data.academy_id || !data.role) {
    return { success: false as const, error: 'profile_id, academy_id, and role are required' }
  }

  const { data: membership, error } = await supabase
    .from('memberships')
    .insert({
      profile_id: data.profile_id,
      academy_id: data.academy_id,
      role: data.role,
      status: data.status ?? 'active',
      belt_rank: data.belt_rank ?? null,
    })
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: membership }
}

export async function updateMemberAction(
  id: string,
  updates: {
    role?: string
    status?: string
    belt_rank?: string
  }
) {
  const supabase = await getSupabaseServerClient() as any

  if (!id) {
    return { success: false as const, error: 'Membership id is required' }
  }

  const { data, error } = await supabase
    .from('memberships')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}
