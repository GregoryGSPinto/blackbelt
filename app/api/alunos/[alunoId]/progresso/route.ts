import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const url = new URL(req.url);
  const alunoId = url.pathname.split('/alunos/')[1]?.split('/progresso')[0];

  if (!membership) return apiOk({ mediaGeral: 0, historico: [] });

  // Get skill assessments for this student
  const { data: assessments } = await supabase
    .from('skill_assessments')
    .select('*')
    .eq('membership_id', alunoId)
    .order('assessed_at', { ascending: false });

  const items = assessments || [];

  const tecnica = items.filter((a: any) => a.skill_name === 'tecnica');
  const comportamento = items.filter((a: any) => a.skill_name === 'comportamento');
  const fisico = items.filter((a: any) => a.skill_name === 'fisico');

  const avg = (arr: any[]) => arr.length ? arr.reduce((s, a) => s + (a.score ?? 0), 0) / arr.length : 0;

  const mediaTecnica = avg(tecnica);
  const mediaComportamento = avg(comportamento);
  const mediaFisico = avg(fisico);
  const mediaGeral = items.length ? (mediaTecnica + mediaComportamento + mediaFisico) / 3 : 0;

  // Simple trend: compare last 5 vs previous 5
  const recent = items.slice(0, 5);
  const previous = items.slice(5, 10);
  const recentAvg = avg(recent);
  const prevAvg = avg(previous);
  const tendencia = previous.length === 0 ? 'stable' : recentAvg > prevAvg ? 'up' : recentAvg < prevAvg ? 'down' : 'stable';

  const historico = items.map((a: any) => ({
    id: a.id,
    alunoId,
    categoria: a.skill_name || 'tecnica',
    nota: a.score ?? 0,
    observacao: a.notes || '',
    professorId: a.assessed_by || '',
    data: a.assessed_at ? new Date(a.assessed_at).toLocaleDateString('pt-BR') : '',
  }));

  return apiOk({
    alunoId,
    mediaGeral: Math.round(mediaGeral * 10) / 10,
    mediaTecnica: Math.round(mediaTecnica * 10) / 10,
    mediaComportamento: Math.round(mediaComportamento * 10) / 10,
    mediaFisico: Math.round(mediaFisico * 10) / 10,
    totalAvaliacoes: items.length,
    tendencia,
    historico,
  });
});

export const POST = createHandler(async (req: NextRequest, { supabase, user }) => {
  const url = new URL(req.url);
  const alunoId = url.pathname.split('/alunos/')[1]?.split('/progresso')[0];
  const body = await req.json();

  const { data, error } = await supabase
    .from('skill_assessments')
    .insert({
      membership_id: alunoId,
      skill_name: body.categoria || 'tecnica',
      score: body.nota || 0,
      notes: body.observacao || null,
      assessed_by: user.id,
      assessed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;

  return apiOk({
    id: data.id,
    alunoId,
    categoria: data.skill_name,
    nota: data.score,
    observacao: data.notes || '',
    professorId: data.assessed_by,
    data: new Date(data.assessed_at).toLocaleDateString('pt-BR'),
  });
});
