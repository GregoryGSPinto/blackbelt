import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { getMemberModalities, enrollInModality, removeFromModality } from '@/lib/modality/membership-modality.service';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const membersIdx = segments.indexOf('members');
  const memberId = segments[membersIdx + 1];

  // Find the membership for this member in the same academy
  const { data: targetMembership, error } = await supabase
    .from('memberships')
    .select('id')
    .eq('profile_id', memberId)
    .eq('academy_id', membership.academy_id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!targetMembership) return apiError('Membro não encontrado nesta academia', 'NOT_FOUND', 404);

  const modalities = await getMemberModalities(supabase, targetMembership.id);
  return apiOk(modalities);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const membersIdx = segments.indexOf('members');
  const memberId = segments[membersIdx + 1];

  const body = await req.json();
  if (!body.modality_id) {
    return apiError('modality_id é obrigatório', 'VALIDATION', 400);
  }

  // Find target membership
  const { data: targetMembership, error } = await supabase
    .from('memberships')
    .select('id')
    .eq('profile_id', memberId)
    .eq('academy_id', membership.academy_id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!targetMembership) return apiError('Membro não encontrado nesta academia', 'NOT_FOUND', 404);

  const enrollment = await enrollInModality(
    supabase,
    targetMembership.id,
    body.modality_id,
    membership.academy_id,
    user.id,
  );

  return apiOk(enrollment, 201);
});

export const DELETE = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const membersIdx = segments.indexOf('members');
  const memberId = segments[membersIdx + 1];
  const body = await req.json();

  if (!body.modality_id) {
    return apiError('modality_id é obrigatório', 'VALIDATION', 400);
  }

  const { data: targetMembership, error } = await supabase
    .from('memberships')
    .select('id')
    .eq('profile_id', memberId)
    .eq('academy_id', membership.academy_id)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  if (!targetMembership) return apiError('Membro não encontrado nesta academia', 'NOT_FOUND', 404);

  const result = await removeFromModality(
    supabase,
    targetMembership.id,
    body.modality_id,
    membership.academy_id,
    user.id,
  );

  return apiOk(result);
});
