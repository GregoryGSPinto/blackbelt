import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, user, membership }) => {
  const url = new URL(req.url);
  const type = url.searchParams.get('type');

  // Get kids linked to this parent
  const { data: links } = await supabase.from('parent_child_links')
    .select('child_id, relationship').eq('parent_id', user.id);

  const childIds = (links || []).map((l: any) => l.child_id);
  if (childIds.length === 0) return apiOk([]);

  // Get profiles for kids
  const { data: profiles } = await supabase.from('profiles')
    .select('id, full_name, avatar_url, birth_date').in('id', childIds);

  // Get memberships for kids
  const { data: memberships } = await supabase.from('memberships')
    .select('profile_id, role, belt_rank, status')
    .in('profile_id', childIds).eq('academy_id', membership!.academy_id);

  const kids = (profiles || []).map((p: any) => {
    const mem = (memberships || []).find((m: any) => m.profile_id === p.id);
    return { ...p, role: mem?.role, belt_rank: mem?.belt_rank, status: mem?.status };
  });

  return apiOk(kids);
});
