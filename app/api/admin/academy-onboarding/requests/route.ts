import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

function assertAdminRole(role?: string | null) {
  if (!role || !['owner', 'admin'].includes(role)) {
    throw apiError('Sem permissão para revisar cadastros.', 'FORBIDDEN', 403);
  }
}

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  assertAdminRole(membership?.role);

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const desiredRole = url.searchParams.get('desiredRole');

  let query = supabase
    .from('academy_onboarding_requests')
    .select('id, full_name, email, phone, desired_role, status, source, requested_at, reviewed_at')
    .eq('academy_id', membership!.academy_id)
    .order('requested_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (desiredRole) query = query.eq('desired_role', desiredRole);

  const { data, error } = await query;
  if (error) throw error;

  return apiOk((data || []).map((item: any) => ({
    id: item.id,
    fullName: item.full_name,
    email: item.email,
    phone: item.phone,
    desiredRole: item.desired_role,
    status: item.status,
    source: item.source,
    requestedAt: item.requested_at,
    reviewedAt: item.reviewed_at,
  })));
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertAdminRole(membership?.role);

  const body = await req.json();
  if (!body.requestId || !body.action) {
    return apiError('requestId e action são obrigatórios.', 'VALIDATION', 400);
  }

  const { data: requestRow, error: requestError } = await supabase
    .from('academy_onboarding_requests')
    .select('*')
    .eq('id', body.requestId)
    .eq('academy_id', membership!.academy_id)
    .single();

  if (requestError || !requestRow) {
    return apiError('Solicitação não encontrada.', 'NOT_FOUND', 404);
  }

  if (body.action === 'reject') {
    const { error } = await supabase
      .from('academy_onboarding_requests')
      .update({
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        notes: body.notes || requestRow.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestRow.id);

    if (error) throw error;
    return apiOk({ ok: true });
  }

  if (body.action !== 'approve') {
    return apiError('Ação inválida.', 'VALIDATION', 400);
  }

  if (!requestRow.profile_id) {
    return apiError(
      'Este cadastro ainda não possui conta vinculada. Peça para o usuário concluir o cadastro pelo link da academia.',
      'PROFILE_REQUIRED',
      409,
    );
  }

  const { data: existingMembership } = await supabase
    .from('memberships')
    .select('id')
    .eq('academy_id', membership!.academy_id)
    .eq('profile_id', requestRow.profile_id)
    .maybeSingle();

  let approvedMembershipId = existingMembership?.id ?? null;

  if (existingMembership?.id) {
    const { error } = await supabase
      .from('memberships')
      .update({
        role: requestRow.desired_role,
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingMembership.id);

    if (error) throw error;
  } else {
    const { data: createdMembership, error: membershipError } = await supabase
      .from('memberships')
      .insert({
        academy_id: membership!.academy_id,
        profile_id: requestRow.profile_id,
        role: requestRow.desired_role,
        status: 'active',
      })
      .select('id')
      .single();

    if (membershipError) throw membershipError;
    approvedMembershipId = createdMembership.id;
  }

  const { error: updateError } = await supabase
    .from('academy_onboarding_requests')
    .update({
      status: 'approved',
      approved_membership_id: approvedMembershipId,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      notes: body.notes || requestRow.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestRow.id);

  if (updateError) throw updateError;

  return apiOk({ ok: true });
});
