import { NextRequest } from 'next/server';
import { createHandler, apiOk, getPagination } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const academyId = membership!.academy_id;

  const { data } = await supabase
    .from('memberships')
    .select('id, profile_id, role, belt_rank, status, profiles!inner(full_name, avatar_url)')
    .eq('academy_id', academyId)
    .eq('role', 'student')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return apiOk(data || []);
});
