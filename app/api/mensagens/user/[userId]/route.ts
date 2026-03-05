import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, user }) => {
  const url = new URL(req.url);
  const targetUserId = url.pathname.split('/user/')[1]?.split('/')[0];

  // Find conversation between current user and target user
  const { data: myConversations } = await supabase
    .from('conversation_members')
    .select('conversation_id')
    .eq('profile_id', user.id);

  if (!myConversations || myConversations.length === 0) {
    return apiOk(null);
  }

  const convIds = myConversations.map((c: any) => c.conversation_id);

  const { data: sharedConv } = await supabase
    .from('conversation_members')
    .select('conversation_id, conversations(*)')
    .eq('profile_id', targetUserId)
    .in('conversation_id', convIds)
    .limit(1)
    .single();

  if (!sharedConv?.conversations) {
    return apiOk(null);
  }

  const conv = sharedConv.conversations as any;
  return apiOk({
    id: conv.id,
    titulo: conv.title || '',
    tipo: conv.type || 'individual',
    participantes: [],
    ultimaMensagem: null,
    naoLidas: 0,
    atualizadoEm: conv.updated_at,
  });
});
