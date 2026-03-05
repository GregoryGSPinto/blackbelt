import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = createHandler(async (_req: NextRequest, { supabase, user }: any) => {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const conversas = (data || []).map((item: any) => {
    const conv = item.conversations;
    if (!conv) return null;
    const members = conv.conversation_members || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const otherMembers = members.filter((m: any) => m.profile_id !== user.id);

    return {
      id: conv.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      titulo: conv.title || otherMembers.map((m: any) => m.profiles?.full_name || 'Desconhecido').join(', '),
      tipo: conv.type || 'individual',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      participantes: members.map((m: any) => ({
        id: m.profile_id,
        nome: m.profiles?.full_name || '',
        avatar: m.profiles?.avatar_url || '',
      })),
      ultimaMensagem: null,
      naoLidas: 0,
      atualizadoEm: conv.updated_at,
    };
  }).filter(Boolean);

  return apiOk(conversas);
});
