import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';
import { getMemberAchievements } from '@/lib/db/queries/gamification';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiOk([]);

  const { data, error } = await getMemberAchievements(supabase, membership.id);
  if (error) throw error;

  const conquistas = (data || []).map((a: any) => ({
    id: a.id,
    titulo: a.achievements?.title || '',
    descricao: a.achievements?.description || '',
    icone: a.achievements?.icon || '🏆',
    desbloqueadoEm: a.unlocked_at,
    categoria: a.achievements?.category || 'geral',
  }));

  return apiOk(conquistas);
});
