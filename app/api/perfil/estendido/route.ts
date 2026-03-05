import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  let membershipData = null;
  if (membership) {
    const { data: mem } = await supabase
      .from('memberships')
      .select('*, academies(*)')
      .eq('id', membership.id)
      .single();
    membershipData = mem;
  }

  return apiOk({
    id: profile?.id || user.id,
    nome: profile?.full_name || '',
    email: user.email,
    telefone: profile?.phone || '',
    dataNascimento: profile?.birth_date || '',
    genero: profile?.gender || '',
    cpf: profile?.cpf || '',
    rg: profile?.rg || '',
    endereco: profile?.address || '',
    faixa: membershipData?.belt_rank || 'branca',
    graus: membershipData?.stripes || 0,
    modalidade: 'BJJ',
    categoria: 'ADULTO',
    pesoAtual: profile?.weight || null,
    alturaAtual: profile?.height || null,
    academia: membershipData?.academies?.name || '',
    avatar: profile?.avatar_url || '',
  });
});
