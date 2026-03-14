import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { getChildModalities } from '@/lib/modality/membership-modality.service';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  if (!membership || membership.role !== 'parent') {
    return apiError('Acesso restrito a responsáveis', 'FORBIDDEN', 403);
  }

  const children = await getChildModalities(supabase, user.id);
  return apiOk(children);
});
