// @ts-nocheck
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

type Client = SupabaseClient<Database>

interface GetMessagesOpts {
  page?: number
  limit?: number
}

export async function getConversations(client: Client, userId: string) {
  return client
    .from('conversation_members')
    .select(`
      conversation_id,
      last_read_at,
      conversations (
        id,
        type,
        title,
        academy_id,
        updated_at,
        conversation_members (
          profile_id,
          profiles:profile_id (id, full_name, avatar_url)
        )
      )
    `)
    .eq('profile_id', userId)
    .order('joined_at', { ascending: false })
}

export async function getMessages(
  client: Client,
  conversationId: string,
  opts: GetMessagesOpts = {},
) {
  const { page = 1, limit = 50 } = opts
  const offset = (page - 1) * limit

  return client
    .from('messages')
    .select('*, profiles:sender_id (id, full_name, avatar_url)', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })
}

export async function sendMessage(
  client: Client,
  conversationId: string,
  senderId: string,
  content: string,
  messageType: string = 'text',
  mediaUrl?: string,
) {
  return client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: messageType,
      media_url: mediaUrl ?? null,
    })
    .select()
    .single()
}

export async function createConversation(
  client: Client,
  type: string,
  memberIds: string[],
  academyId: string,
  title?: string,
) {
  const { data: conversation, error } = await client
    .from('conversations')
    .insert({ academy_id: academyId, type, title: title ?? null })
    .select()
    .single()

  if (error) throw error

  const members = memberIds.map((profileId) => ({
    conversation_id: conversation.id,
    profile_id: profileId,
    role: 'member' as const,
  }))

  const { error: membersError } = await client
    .from('conversation_members')
    .insert(members)

  if (membersError) throw membersError

  return conversation
}

export async function markConversationRead(
  client: Client,
  conversationId: string,
  userId: string,
) {
  return client
    .from('conversation_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('profile_id', userId)
}
