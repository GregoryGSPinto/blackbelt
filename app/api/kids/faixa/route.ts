import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ data: null, error: null, meta: {} });

  const [memberRes, promotionsRes, assessmentsRes] = await Promise.all([
    supabase.from('memberships')
      .select('belt_rank')
      .eq('id', membership.id)
      .single(),
    supabase.from('promotions')
      .select('id, from_belt, to_belt, promoted_at')
      .eq('membership_id', membership.id)
      .order('promoted_at', { ascending: false }),
    supabase.from('skill_assessments')
      .select('score, skill_name')
      .eq('membership_id', membership.id)
      .order('assessed_at', { ascending: false })
      .limit(10),
  ]);

  const scores = assessmentsRes.data || [];
  const avgScore = scores.length
    ? scores.reduce((s: number, a: any) => s + (a.score || 0), 0) / scores.length
    : 0;

  // Progress estimate: average score out of 10 → percentage
  const progressoPercentual = Math.min(100, Math.round(avgScore * 10));

  return apiOk({
    data: {
      faixaAtual: memberRes.data?.belt_rank || 'branca',
      progresso: progressoPercentual,
      totalGraduacoes: (promotionsRes.data || []).length,
      historico: (promotionsRes.data || []).map((p: any) => ({
        id: p.id,
        de: p.from_belt,
        para: p.to_belt,
        data: p.promoted_at,
      })),
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
