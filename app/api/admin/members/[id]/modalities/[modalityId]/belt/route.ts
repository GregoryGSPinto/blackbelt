import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { updateBelt } from '@/lib/modality/membership-modality.service';

export const dynamic = 'force-dynamic';

export const PUT = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const membersIdx = segments.indexOf('members');
  const memberId = segments[membersIdx + 1];
  const modalitiesIdx = segments.indexOf('modalities');
  const modalityId = segments[modalitiesIdx + 1];

  const body = await req.json();
  if (!body.belt_rank || typeof body.belt_rank !== 'string') {
    return apiError('belt_rank é obrigatório', 'VALIDATION', 400);
  }

  const stripes = typeof body.stripes === 'number' ? body.stripes : 0;

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

  const result = await updateBelt(
    supabase,
    targetMembership.id,
    modalityId,
    membership.academy_id,
    body.belt_rank,
    stripes,
    user.id,
  );

  return apiOk(result);
});
