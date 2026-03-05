import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const url = new URL(req.url);
  const responsavelId = url.searchParams.get('responsavelId');

  if (!membership) return apiOk([]);

  let query = supabase
    .from('memberships')
    .select('*, profiles(*), parent_child_links!child_membership_id(*)')
    .eq('academy_id', membership.academy_id)
    .eq('status', 'active');

  if (responsavelId) {
    // Get children of this parent
    const { data: links } = await supabase
      .from('parent_child_links')
      .select('child_membership_id')
      .eq('parent_profile_id', responsavelId);

    if (!links || links.length === 0) return apiOk([]);
    const childIds = links.map((l: any) => l.child_membership_id);
    query = query.in('id', childIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  const profiles = (data || []).map((m: any) => ({
    id: m.id,
    nome: m.profiles?.full_name || '',
    avatar: m.profiles?.avatar_url || '',
    idade: m.profiles?.birth_date ? Math.floor((Date.now() - new Date(m.profiles.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
    faixa: m.belt_rank || 'branca',
    nivel: 'iniciante',
    xp: 0,
    frequencia: 0,
    responsavelId: m.parent_child_links?.[0]?.parent_profile_id || null,
  }));

  return apiOk(profiles);
});
