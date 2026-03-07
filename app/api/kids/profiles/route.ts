import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const url = new URL(req.url);
  const parentId = url.searchParams.get('parentId');

  if (!membership) return apiOk([]);

  let query = supabase
    .from('memberships')
    .select('id, profile_id, role, belt_rank, academy_id, profiles!inner(full_name, avatar_url, birth_date)')
    .eq('academy_id', membership.academy_id)
    .eq('role', 'student')
    .eq('status', 'active');

  if (parentId) {
    const { data: children } = await supabase
      .from('family_links')
      .select('child_profile_id')
      .eq('parent_profile_id', parentId);

    const childIds = (children || []).map((c: any) => c.child_profile_id);
    if (childIds.length === 0) return apiOk([]);
    query = query.in('profile_id', childIds);
  }

  const { data, error } = await query;
  if (error) throw error;

  return apiOk(data || []);
});
