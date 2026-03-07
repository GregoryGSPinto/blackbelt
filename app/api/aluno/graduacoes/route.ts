import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ data: [], error: null, meta: {} });

  const [promotionsRes, memberRes] = await Promise.all([
    supabase.from('promotions')
      .select('id, from_belt, to_belt, promoted_at, promoted_by, notes')
      .eq('membership_id', membership.id)
      .order('promoted_at', { ascending: false }),
    supabase.from('memberships')
      .select('belt_rank')
      .eq('id', membership.id)
      .single(),
  ]);

  const promotions = (promotionsRes.data || []).map((p: any) => ({
    id: p.id,
    de: p.from_belt,
    para: p.to_belt,
    data: p.promoted_at,
    avaliador: p.promoted_by,
    observacao: p.notes || '',
  }));

  return apiOk({
    data: {
      faixaAtual: memberRes.data?.belt_rank || 'branca',
      historico: promotions,
      totalGraduacoes: promotions.length,
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
