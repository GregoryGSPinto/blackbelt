import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const { page, limit, offset } = getPagination(req);

  const { data, count } = await supabase.from('notifications')
    .select('*', { count: 'exact' })
    .or(`profile_id.eq.${user.id},academy_id.eq.${membership!.academy_id}`)
    .in('type', ['announcement', 'message', 'comunicado'])
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  return apiOk({ comunicados: data || [], total: count || 0, page, limit });
});

export const POST = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const body = await req.json();
  const { data, error } = await supabase.from('notifications').insert({
    profile_id: body.recipientId || user.id,
    academy_id: membership!.academy_id,
    title: body.title || body.assunto || '',
    body: body.content || body.mensagem || '',
    type: body.type || 'announcement',
    data: body,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
