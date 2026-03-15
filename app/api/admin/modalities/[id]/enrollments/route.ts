import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';
import { approveEnrollment, rejectEnrollment } from '@/lib/modality/membership-modality.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/modalities/[id]/enrollments?status=pending
 * List pending enrollments for a modality (admin only)
 */
export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const modalitiesIdx = segments.indexOf('modalities');
  const modalityId = segments[modalitiesIdx + 1];
  const status = url.searchParams.get('status') || 'pending';

  // Verify modality belongs to this academy
  const { data: modality } = await supabase
    .from('academy_modalities')
    .select('id')
    .eq('id', modalityId)
    .eq('academy_id', membership.academy_id)
    .maybeSingle();

  if (!modality) return apiError('Modalidade não encontrada', 'NOT_FOUND', 404);

  const { data, error } = await supabase
    .from('membership_modalities')
    .select('id, membership_id, belt_rank, stripes, status, started_at, memberships!inner(id, profile_id, academy_id, profiles(full_name, avatar_url))')
    .eq('modality_id', modalityId)
    .eq('status', status)
    .eq('memberships.academy_id', membership.academy_id);

  if (error) throw error;
  return apiOk(data || []);
});

/**
 * PUT /api/admin/modalities/[id]/enrollments
 * Approve or reject a pending enrollment
 * Body: { enrollment_id, action: 'approve' | 'reject' }
 */
export const PUT = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  const body = await req.json();
  const { enrollment_id, action } = body;

  if (!enrollment_id || !['approve', 'reject'].includes(action)) {
    return apiError('enrollment_id e action (approve|reject) são obrigatórios', 'VALIDATION', 400);
  }

  // Verify enrollment belongs to a modality in this academy
  const { data: enrollment } = await supabase
    .from('membership_modalities')
    .select('id, modality_id, academy_modalities!inner(academy_id)')
    .eq('id', enrollment_id)
    .maybeSingle();

  if (!enrollment) return apiError('Matrícula não encontrada', 'NOT_FOUND', 404);

  const enrollmentAcademyId = (enrollment as any).academy_modalities?.academy_id;
  if (enrollmentAcademyId !== membership.academy_id) {
    return apiError('Acesso restrito', 'FORBIDDEN', 403);
  }

  if (action === 'approve') {
    const result = await approveEnrollment(supabase, enrollment_id, membership.academy_id, user.id);
    return apiOk(result);
  } else {
    const result = await rejectEnrollment(supabase, enrollment_id, membership.academy_id, user.id);
    return apiOk(result);
  }
});
