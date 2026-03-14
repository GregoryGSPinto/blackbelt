import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { getMembersByModality } from '@/lib/modality/membership-modality.service';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const modalityIdx = segments.indexOf('modalities');
  const modalityId = segments[modalityIdx + 1];

  const members = await getMembersByModality(supabase, membership.academy_id, modalityId);
  return apiOk(members);
});
