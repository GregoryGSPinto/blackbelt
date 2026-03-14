/**
 * Membership-Modality Service — server-side operations for member enrollment per modality.
 * Operates on membership_modalities and modality_events tables.
 */

export async function getMemberModalities(supabase: any, membershipId: string) {
  const { data, error } = await supabase
    .from('membership_modalities')
    .select('id, membership_id, modality_id, belt_rank, stripes, status, started_at, created_at, updated_at, academy_modalities(id, name, slug, icon, is_active)')
    .eq('membership_id', membershipId)
    .order('started_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function enrollInModality(
  supabase: any,
  membershipId: string,
  modalityId: string,
  academyId: string,
  performedBy: string,
) {
  // Check enrollment_mode
  const { data: modality, error: modError } = await supabase
    .from('academy_modalities')
    .select('id, enrollment_mode, is_active')
    .eq('id', modalityId)
    .eq('academy_id', academyId)
    .single();

  if (modError || !modality) throw new Error('Modality not found in this academy');
  if (!modality.is_active) throw new Error('Modality is not active');

  const status = modality.enrollment_mode === 'approval_required' ? 'pending' : 'active';

  const { data: enrollment, error } = await supabase
    .from('membership_modalities')
    .insert({
      membership_id: membershipId,
      modality_id: modalityId,
      status,
      belt_rank: 'branca',
      stripes: 0,
    })
    .select('id, membership_id, modality_id, belt_rank, stripes, status, started_at')
    .single();

  if (error) throw error;

  // Record event
  await supabase.from('modality_events').insert({
    membership_modality_id: enrollment.id,
    academy_id: academyId,
    event_type: 'enrollment',
    payload: { status, enrollment_mode: modality.enrollment_mode },
    performed_by: performedBy,
  });

  return enrollment;
}

export async function approveEnrollment(
  supabase: any,
  membershipModalityId: string,
  academyId: string,
  performedBy: string,
) {
  const { data, error } = await supabase
    .from('membership_modalities')
    .update({ status: 'active' })
    .eq('id', membershipModalityId)
    .eq('status', 'pending')
    .select('id, membership_id, modality_id, status')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pending enrollment not found');

  await supabase.from('modality_events').insert({
    membership_modality_id: data.id,
    academy_id: academyId,
    event_type: 'enrollment',
    payload: { action: 'approved' },
    performed_by: performedBy,
  });

  return data;
}

export async function rejectEnrollment(
  supabase: any,
  membershipModalityId: string,
  academyId: string,
  performedBy: string,
) {
  const { data, error } = await supabase
    .from('membership_modalities')
    .update({ status: 'inactive' })
    .eq('id', membershipModalityId)
    .eq('status', 'pending')
    .select('id, membership_id, modality_id, status')
    .single();

  if (error) throw error;
  if (!data) throw new Error('Pending enrollment not found');

  await supabase.from('modality_events').insert({
    membership_modality_id: data.id,
    academy_id: academyId,
    event_type: 'inactivation',
    payload: { action: 'rejected' },
    performed_by: performedBy,
  });

  return data;
}

export async function removeFromModality(
  supabase: any,
  membershipId: string,
  modalityId: string,
  academyId: string,
  performedBy: string,
) {
  const { data: existing, error: findError } = await supabase
    .from('membership_modalities')
    .select('id')
    .eq('membership_id', membershipId)
    .eq('modality_id', modalityId)
    .single();

  if (findError || !existing) throw new Error('Member is not enrolled in this modality');

  const { data, error } = await supabase
    .from('membership_modalities')
    .update({ status: 'inactive' })
    .eq('id', existing.id)
    .select('id, membership_id, modality_id, status')
    .single();

  if (error) throw error;

  await supabase.from('modality_events').insert({
    membership_modality_id: existing.id,
    academy_id: academyId,
    event_type: 'inactivation',
    payload: { reason: 'removed' },
    performed_by: performedBy,
  });

  return data;
}

export async function updateBelt(
  supabase: any,
  membershipId: string,
  modalityId: string,
  academyId: string,
  belt: string,
  stripes: number,
  performedBy: string,
) {
  const { data: existing, error: findError } = await supabase
    .from('membership_modalities')
    .select('id, belt_rank, stripes')
    .eq('membership_id', membershipId)
    .eq('modality_id', modalityId)
    .eq('status', 'active')
    .single();

  if (findError || !existing) throw new Error('Active enrollment not found for this modality');

  const { data, error } = await supabase
    .from('membership_modalities')
    .update({ belt_rank: belt, stripes })
    .eq('id', existing.id)
    .select('id, membership_id, modality_id, belt_rank, stripes')
    .single();

  if (error) throw error;

  await supabase.from('modality_events').insert({
    membership_modality_id: existing.id,
    academy_id: academyId,
    event_type: 'belt_promotion',
    payload: {
      from_belt: existing.belt_rank,
      from_stripes: existing.stripes,
      to_belt: belt,
      to_stripes: stripes,
    },
    performed_by: performedBy,
  });

  return data;
}

export async function getMembersByModality(supabase: any, academyId: string, modalityId: string) {
  const { data, error } = await supabase
    .from('membership_modalities')
    .select('id, membership_id, belt_rank, stripes, status, started_at, memberships(id, profile_id, role, status, profiles(full_name, avatar_url))')
    .eq('modality_id', modalityId)
    .order('belt_rank', { ascending: true });

  if (error) throw error;

  // Filter to ensure we only return members from the correct academy
  const filtered = (data ?? []).filter((row: any) => {
    const membership = row.memberships;
    return membership && membership.status === 'active';
  });

  return filtered;
}

export async function getModalityStats(supabase: any, academyId: string) {
  const { data: modalities, error: modError } = await supabase
    .from('academy_modalities')
    .select('id, name, slug, icon, is_active')
    .eq('academy_id', academyId)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (modError) throw modError;
  if (!modalities || modalities.length === 0) return [];

  const modalityIds = modalities.map((m: any) => m.id);

  const [enrollmentsRes, schedulesRes] = await Promise.all([
    supabase
      .from('membership_modalities')
      .select('modality_id, belt_rank, status')
      .in('modality_id', modalityIds),
    supabase
      .from('class_schedules')
      .select('modality_id')
      .eq('academy_id', academyId)
      .eq('active', true)
      .in('modality_id', modalityIds),
  ]);

  const enrollments = enrollmentsRes.data ?? [];
  const schedules = schedulesRes.data ?? [];

  return modalities.map((mod: any) => {
    const modEnrollments = enrollments.filter((e: any) => e.modality_id === mod.id && e.status === 'active');
    const modSchedules = schedules.filter((s: any) => s.modality_id === mod.id);

    const beltDistribution: Record<string, number> = {};
    for (const e of modEnrollments) {
      const belt = e.belt_rank ?? 'branca';
      beltDistribution[belt] = (beltDistribution[belt] ?? 0) + 1;
    }

    return {
      ...mod,
      totalMembers: modEnrollments.length,
      totalClasses: modSchedules.length,
      beltDistribution,
    };
  });
}

export async function getChildModalities(supabase: any, parentProfileId: string) {
  // Get children of this parent via parent_child_links
  const { data: links, error: linkError } = await supabase
    .from('parent_child_links')
    .select('child_id')
    .eq('parent_id', parentProfileId);

  if (linkError || !links || links.length === 0) return [];

  const childIds = links.map((l: any) => l.child_id);

  // Get memberships for these children
  const { data: memberships, error: memError } = await supabase
    .from('memberships')
    .select('id, profile_id, academy_id, profiles(full_name, avatar_url)')
    .in('profile_id', childIds)
    .eq('status', 'active');

  if (memError || !memberships || memberships.length === 0) return [];

  const membershipIds = memberships.map((m: any) => m.id);

  // Get modality enrollments
  const { data: enrollments, error: enrError } = await supabase
    .from('membership_modalities')
    .select('id, membership_id, modality_id, belt_rank, stripes, status, started_at, academy_modalities(id, name, slug, icon)')
    .in('membership_id', membershipIds)
    .eq('status', 'active');

  if (enrError) throw enrError;

  // Group by child
  return memberships.map((m: any) => ({
    membershipId: m.id,
    profileId: m.profile_id,
    fullName: m.profiles?.full_name ?? '',
    avatarUrl: m.profiles?.avatar_url ?? null,
    modalities: (enrollments ?? []).filter((e: any) => e.membership_id === m.id),
  }));
}
