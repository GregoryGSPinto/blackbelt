import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { updateModality, deactivateModality } from '@/lib/modality/modality.service';

export const dynamic = 'force-dynamic';

export const PUT = createHandler(async (req: NextRequest, ctx) => {
  const { supabase, membership } = ctx;
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const id = url.pathname.split('/').at(-1)!;
  const body = await req.json();

  const modality = await updateModality(supabase, id, membership.academy_id, body);
  return apiOk(modality);
});

export const DELETE = createHandler(async (req: NextRequest, ctx) => {
  const { supabase, membership } = ctx;
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const id = url.pathname.split('/').at(-1)!;

  const modality = await deactivateModality(supabase, id, membership.academy_id);
  return apiOk(modality);
});
