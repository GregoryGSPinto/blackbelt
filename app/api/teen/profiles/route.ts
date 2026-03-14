import { NextRequest } from 'next/server';
import { createHandler, apiOk, type AuthContext } from '@/lib/api/supabase-helpers';
import type { MembershipRow } from '@/src/infrastructure/supabase/types';

export const dynamic = 'force-dynamic';

interface ParentChildLinkRow {
  child_membership_id: string;
}

interface MembershipProfileRow {
  full_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
}

interface MembershipParentLinkRow {
  parent_profile_id: string | null;
}

interface TeenMembershipRow extends Pick<MembershipRow, 'id' | 'belt_rank'> {
  profiles: MembershipProfileRow | null;
  parent_child_links: MembershipParentLinkRow[] | null;
}

function calculateAge(birthDate: string | null): number {
  if (!birthDate) return 0;
  const diff = Date.now() - new Date(birthDate).getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

export const GET = createHandler(async (req: NextRequest, { supabase, membership }: AuthContext) => {
  const url = new URL(req.url);
  const responsavelId = url.searchParams.get('responsavelId');

  if (!membership) return apiOk([]);

  let query = supabase
    .from('memberships')
    .select('id, belt_rank, profiles(full_name, avatar_url, birth_date), parent_child_links!child_membership_id(parent_profile_id)')
    .eq('academy_id', membership.academy_id)
    .eq('status', 'active');

  if (responsavelId) {
    // Get children of this parent
    const { data: links } = await supabase
      .from('parent_child_links')
      .select('child_membership_id')
      .eq('parent_profile_id', responsavelId);

    if (!links || links.length === 0) return apiOk([]);
    const childIds = (links as unknown as ParentChildLinkRow[]).map((link) => link.child_membership_id);
    query = query.in('id', childIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  const profiles = ((data || []) as unknown as TeenMembershipRow[]).map((membershipRow) => ({
    id: membershipRow.id,
    nome: membershipRow.profiles?.full_name || '',
    avatar: membershipRow.profiles?.avatar_url || '',
    idade: calculateAge(membershipRow.profiles?.birth_date || null),
    faixa: membershipRow.belt_rank || 'branca',
    nivel: 'iniciante',
    xp: 0,
    frequencia: 0,
    responsavelId: membershipRow.parent_child_links?.[0]?.parent_profile_id || null,
  }));

  return apiOk(profiles);
});
