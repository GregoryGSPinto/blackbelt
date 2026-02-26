import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  if (type === 'minha' || url.pathname.includes('/minha')) {
    const { data } = await supabase.from('promotions').select('*, belt_systems!inner(name, ranks)')
      .eq('membership_id', membership!.id).order('promoted_at', { ascending: false });
    return apiOk(data || []);
  }

  if (type === 'requisitos' || url.pathname.includes('/requisitos')) {
    const { data } = await supabase.from('belt_systems').select('*');
    return apiOk(data || []);
  }

  // exames
  const { data } = await supabase.from('promotions').select('*')
    .eq('academy_id', membership!.academy_id).order('promoted_at', { ascending: false });
  return apiOk(data || []);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  const { data, error } = await supabase.from('promotions').insert({
    membership_id: body.membershipId || body.alunoId,
    academy_id: membership!.academy_id,
    belt_system_id: body.beltSystemId || body.sistemaId,
    from_rank: body.fromRank || body.de,
    to_rank: body.toRank || body.para,
    promoted_by: membership!.id,
    notes: body.notes || body.observacao,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
