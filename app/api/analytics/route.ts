import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const academyId = membership!.academy_id;

  const [membersRes, checkinsRes] = await Promise.all([
    supabase.from('memberships').select('id, status, joined_at')
      .eq('academy_id', academyId),
    supabase.from('attendances').select('id, checked_in_at', { count: 'exact' })
      .eq('academy_id', academyId),
  ]);

  const totalMembers = (membersRes.data || []).length;
  const activeMembers = (membersRes.data || []).filter((m: any) => m.status === 'active').length;

  return apiOk({
    retencao: totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0,
    totalMembers,
    activeMembers,
    totalCheckins: checkinsRes.count || 0,
  });
});
