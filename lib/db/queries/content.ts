// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

interface GetContentOpts {
  type?: string
  martialArt?: string
  belt?: string
  search?: string
  page?: number
  limit?: number
}

export async function getContent(
  client: Client,
  academyId: string,
  opts: GetContentOpts = {},
) {
  const { type, martialArt, belt, search, page = 1, limit = 50 } = opts
  const offset = (page - 1) * limit

  let query = client
    .from('content')
    .select('*', { count: 'exact' })
    .eq('academy_id', academyId)

  if (type) {
    query = query.eq('type', type)
  }

  if (martialArt) {
    query = query.eq('martial_art', martialArt)
  }

  if (belt) {
    query = query.eq('belt_level', belt)
  }

  if (search) {
    query = query.ilike('title', `%${search}%`)
  }

  return query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })
}

export async function getContentById(client: Client, contentId: string) {
  return client
    .from('content')
    .select('*')
    .eq('id', contentId)
    .single()
}

export async function createContent(
  client: Client,
  data: {
    academy_id: string
    title: string
    description?: string
    type?: string
    url?: string
    thumbnail_url?: string
    tags?: string[]
    martial_art?: string
    belt_level?: string
    visibility?: string
    duration_secs?: number
    created_by?: string
  },
) {
  return client
    .from('content')
    .insert(data)
    .select()
    .single()
}

export async function updateContent(
  client: Client,
  contentId: string,
  data: {
    title?: string
    description?: string
    type?: string
    url?: string
    thumbnail_url?: string
    tags?: string[]
    martial_art?: string
    belt_level?: string
    visibility?: string
    duration_secs?: number
  },
) {
  return client
    .from('content')
    .update(data)
    .eq('id', contentId)
    .select()
    .single()
}

export async function deleteContent(client: Client, contentId: string) {
  return client
    .from('content')
    .delete()
    .eq('id', contentId)
}
