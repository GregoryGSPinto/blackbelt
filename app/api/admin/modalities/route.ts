import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { getAcademyModalities, createModality } from '@/lib/modality/modality.service';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const modalities = await getAcademyModalities(supabase, membership.academy_id);
  return apiOk(modalities);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const body = await req.json();
  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    return apiError('Nome da modalidade é obrigatório', 'VALIDATION', 400);
  }

  const modality = await createModality(supabase, membership.academy_id, {
    name: body.name.trim(),
    description: body.description,
    icon: body.icon,
    belt_system_id: body.belt_system_id,
    enrollment_mode: body.enrollment_mode,
  });

  return apiOk(modality, 201);
});
