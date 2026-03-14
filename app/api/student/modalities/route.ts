import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { getMemberModalities, enrollInModality } from '@/lib/modality/membership-modality.service';
import { getActiveModalities } from '@/lib/modality/modality.service';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

  const url = new URL(req.url);
  const view = url.searchParams.get('view');

  if (view === 'available') {
    const modalities = await getActiveModalities(supabase, membership.academy_id);
    return apiOk(modalities);
  }

  const modalities = await getMemberModalities(supabase, membership.id);
  return apiOk(modalities);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  if (!membership) return apiError('Sem membership ativa', 'NO_MEMBERSHIP');

  const body = await req.json();
  if (!body.modality_id) {
    return apiError('modality_id é obrigatório', 'VALIDATION', 400);
  }

  const enrollment = await enrollInModality(
    supabase,
    membership.id,
    body.modality_id,
    membership.academy_id,
    user.id,
  );

  return apiOk(enrollment, 201);
});
