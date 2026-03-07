import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk({ data: [], error: null, meta: {} });

  const [challengesRes, completedRes] = await Promise.all([
    supabase.from('challenges')
      .select('id, title, description, xp_reward, type, difficulty, starts_at, ends_at')
      .eq('academy_id', membership.academy_id)
      .eq('active', true)
      .order('starts_at', { ascending: false })
      .limit(20),
    supabase.from('challenge_completions')
      .select('challenge_id, completed_at')
      .eq('membership_id', membership.id),
  ]);

  const completedIds = new Set((completedRes.data || []).map((c: any) => c.challenge_id));

  const desafios: any[] = (challengesRes.data || []).map((ch: any) => ({
    id: ch.id,
    titulo: ch.title,
    descricao: ch.description,
    xp: ch.xp_reward || 0,
    tipo: ch.type || 'geral',
    dificuldade: ch.difficulty || 'medio',
    inicio: ch.starts_at,
    fim: ch.ends_at,
    completado: completedIds.has(ch.id),
  }));

  return apiOk({
    data: {
      ativos: desafios.filter(d => !d.completado),
      completados: desafios.filter(d => d.completado),
      totalXpGanho: desafios.filter(d => d.completado).reduce((s, d) => s + d.xp, 0),
    },
    error: null,
    meta: { timestamp: new Date().toISOString() },
  });
});
