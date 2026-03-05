import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const GET = createHandler(async (req: NextRequest, { supabase }: any) => {
  const url = new URL(req.url);
  const conversaId = url.pathname.split('/mensagens/')[1]?.split('/')[0];
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from('messages')
    .select('*, profiles:sender_id (id, full_name, avatar_url)')
    .eq('conversation_id', conversaId)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mensagens = (data || []).map((msg: any) => ({
    id: msg.id,
    conversaId: msg.conversation_id,
    remetenteId: msg.sender_id,
    remetenteNome: msg.profiles?.full_name || '',
    remetenteTipo: 'instrutor',
    conteudo: msg.content || '',
    tipo: msg.message_type || 'texto',
    criadoEm: msg.created_at,
  }));

  return apiOk(mensagens);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = createHandler(async (req: NextRequest, { supabase, user }: any) => {
  const url = new URL(req.url);
  const conversaId = url.pathname.split('/mensagens/')[1]?.split('/')[0];
  const body = await req.json();

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversaId,
      sender_id: user.id,
      content: body.conteudo || body.content || '',
      message_type: body.tipo === 'template' ? 'template' : 'text',
    })
    .select()
    .single();

  if (error) throw error;

  return apiOk({
    id: data.id,
    conversaId: data.conversation_id,
    remetenteId: data.sender_id,
    remetenteNome: body.remetenteNome || '',
    remetenteTipo: body.remetenteTipo || 'instrutor',
    conteudo: data.content,
    tipo: data.message_type || 'texto',
    criadoEm: data.created_at,
  });
});
