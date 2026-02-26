import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  const [promotionsRes, assessmentsRes, milestonesRes] = await Promise.all([
    supabase.from('promotions').select('*')
      .eq('membership_id', membership!.id).order('promoted_at', { ascending: false }),
    supabase.from('skill_assessments').select('*, skill_tracks!inner(name, martial_art)')
      .eq('membership_id', membership!.id).order('assessed_at', { ascending: false }),
    supabase.from('milestones').select('*')
      .eq('membership_id', membership!.id).order('achieved_at', { ascending: false }),
  ]);

  return apiOk({
    promotions: promotionsRes.data || [],
    assessments: assessmentsRes.data || [],
    milestones: milestonesRes.data || [],
  });
});
