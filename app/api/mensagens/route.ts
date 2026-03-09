import { NextRequest } from 'next/server';
import { createHandler, apiOk, type AuthContext } from '@/lib/api/supabase-helpers';
import type { ConversationRow, MembershipRow } from '@/src/infrastructure/supabase/types';

export const dynamic = 'force-dynamic';

interface ConversationProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ConversationMemberRow {
  profile_id: string;
  profiles: ConversationProfileRow | null;
}

interface ConversationWithMembersRow extends Pick<ConversationRow, 'id' | 'type' | 'title' | 'academy_id' | 'updated_at'> {
  conversation_members: ConversationMemberRow[] | null;
}

interface ConversationMembershipRow extends Pick<MembershipRow, never> {
  conversation_id: string;
  last_read_at: string | null;
  conversations: ConversationWithMembersRow | null;
}

export const GET = createHandler(async (_req: NextRequest, { supabase, user }: AuthContext) => {
  const { data, error } = await supabase
    .from('conversation_members')
    .select(`
      conversation_id,
      last_read_at,
      conversations (
        id, type, title, academy_id, updated_at,
        conversation_members ( profile_id, profiles:profile_id (id, full_name, avatar_url) )
      )
    `)
    .eq('profile_id', user.id)
    .order('joined_at', { ascending: false });

  if (error) throw error;

  const conversas = ((data || []) as ConversationMembershipRow[]).map((item) => {
    const conv = item.conversations;
    if (!conv) return null;
    const members = conv.conversation_members || [];
    const otherMembers = members.filter((member) => member.profile_id !== user.id);

    return {
      id: conv.id,
      titulo: conv.title || otherMembers.map((member) => member.profiles?.full_name || 'Desconhecido').join(', '),
      tipo: conv.type || 'individual',
      participantes: members.map((member) => ({
        id: member.profile_id,
        nome: member.profiles?.full_name || '',
        avatar: member.profiles?.avatar_url || '',
      })),
      ultimaMensagem: null,
      naoLidas: 0,
      atualizadoEm: conv.updated_at,
    };
  }).filter(Boolean);

  return apiOk(conversas);
});
