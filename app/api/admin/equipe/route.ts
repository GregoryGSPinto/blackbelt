import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

function assertAdminRole(role?: string | null) {
  if (!role || !['owner', 'admin'].includes(role)) {
    throw apiError('Sem permissão para gerenciar equipe.', 'FORBIDDEN', 403);
  }
}

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  assertAdminRole(membership?.role);

  const [{ data: academy, error: academyError }, { data: members, error: membersError }, { data: invites, error: inviteError }] =
    await Promise.all([
      supabase.from('academies').select('id, name').eq('id', membership!.academy_id).single(),
      supabase
        .from('memberships')
        .select('id, profile_id, role, status, joined_at, profiles!inner(full_name, phone)')
        .eq('academy_id', membership!.academy_id)
        .in('role', ['professor', 'admin', 'owner'])
        .order('joined_at', { ascending: false }),
      supabase
        .from('academy_onboarding_requests')
        .select('id, full_name, email, phone, desired_role, status, requested_at')
        .eq('academy_id', membership!.academy_id)
        .eq('desired_role', 'professor')
        .in('status', ['pending', 'approved'])
        .order('requested_at', { ascending: false }),
    ]);

  if (academyError) throw academyError;
  if (membersError) throw membersError;
  if (inviteError) throw inviteError;

  return apiOk({
    academy,
    members: (members || []).map((item: any) => ({
      id: item.id,
      profileId: item.profile_id,
      fullName: item.profiles?.full_name || 'Professor sem nome',
      phone: item.profiles?.phone || null,
      role: item.role,
      status: item.status,
      joinedAt: item.joined_at,
    })),
    invites: (invites || []).map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      desiredRole: item.desired_role,
      status: item.status,
      requestedAt: item.requested_at,
    })),
  });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  assertAdminRole(membership?.role);

  const body = await req.json();
  if (!body.fullName || !body.email) {
    return apiError('Nome e e-mail são obrigatórios.', 'VALIDATION', 400);
  }

  const { data, error } = await supabase
    .from('academy_onboarding_requests')
    .insert({
      academy_id: membership!.academy_id,
      email: String(body.email).toLowerCase().trim(),
      full_name: String(body.fullName).trim(),
      phone: body.phone ? String(body.phone).trim() : null,
      desired_role: 'professor',
      status: 'pending',
      source: 'staff_invite',
      metadata: {
        invitedBy: membership!.id,
      },
    })
    .select('id, full_name, email, phone, desired_role, status, requested_at')
    .single();

  if (error) throw error;

  return apiOk({
    id: data.id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    desiredRole: data.desired_role,
    status: data.status,
    requestedAt: data.requested_at,
  });
});

export const PUT = createHandler(async (req: NextRequest, { supabase, membership }) => {
  assertAdminRole(membership?.role);

  const body = await req.json();
  if (!body.membershipId || !body.status) {
    return apiError('membershipId e status são obrigatórios.', 'VALIDATION', 400);
  }

  const normalizedStatus = body.status === 'inactive' ? 'inactive' : 'active';

  const { data, error } = await supabase
    .from('memberships')
    .update({
      status: normalizedStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.membershipId)
    .eq('academy_id', membership!.academy_id)
    .select('id, profile_id, role, status, joined_at, profiles!inner(full_name, phone)')
    .single();

  if (error) throw error;

  return apiOk({
    id: data.id,
    profileId: data.profile_id,
    fullName: (data as any).profiles?.full_name || 'Professor sem nome',
    phone: (data as any).profiles?.phone || null,
    role: data.role,
    status: data.status,
    joinedAt: data.joined_at,
  });
});
