// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

interface GetNotificationsOpts {
  unreadOnly?: boolean
  limit?: number
  page?: number
}

export async function getNotifications(
  client: Client,
  userId: string,
  opts: GetNotificationsOpts = {},
) {
  const { unreadOnly, limit = 50, page = 1 } = opts
  const offset = (page - 1) * limit

  let query = client
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('profile_id', userId)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  return query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })
}

export async function markAsRead(client: Client, notificationId: string) {
  return client
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select()
    .single()
}

export async function markAllAsRead(client: Client, userId: string) {
  return client
    .from('notifications')
    .update({ read: true })
    .eq('profile_id', userId)
    .eq('read', false)
}

export async function createNotification(
  client: Client,
  data: {
    profile_id: string
    academy_id?: string
    title: string
    body: string
    type?: string
    data?: Record<string, unknown>
  },
) {
  return client
    .from('notifications')
    .insert(data)
    .select()
    .single()
}

export async function getUnreadCount(client: Client, userId: string) {
  return client
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', userId)
    .eq('read', false)
}
