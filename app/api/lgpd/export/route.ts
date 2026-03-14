import { withAuth, apiOk, apiServerError } from '@/lib/api/route-helpers';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { supabase, user } = await withAuth();

    // Create export request
    const { data, error } = await supabase
      .from('data_export_requests' as any)
      .insert({
        profile_id: user.id,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    // Gather user data for export — explicit fields to avoid leaking internal hashes
    const [profileRes, membershipsRes, attendancesRes, pointsRes] = await Promise.all([
      supabase.from('profiles' as any).select('id, full_name, phone, birth_date, gender, address, avatar_url, created_at, updated_at').eq('id', user.id).single(),
      supabase.from('memberships' as any).select('id, academy_id, role, status, belt_rank, joined_at, created_at').eq('profile_id', user.id),
      supabase.from('attendances' as any).select('id, class_id, checked_in_at, status, created_at').eq('membership_id', user.id).limit(1000),
      supabase.from('points_ledger' as any).select('id, amount, reason, created_at').eq('membership_id', user.id).limit(1000),
    ]);

    const exportData = {
      profile: profileRes.data,
      memberships: membershipsRes.data || [],
      attendances: attendancesRes.data || [],
      points: pointsRes.data || [],
      exportedAt: new Date().toISOString(),
    };

    // Mark as completed
    await supabase
      .from('data_export_requests' as any)
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', data.id);

    // Log to audit
    await supabase.from('audit_log' as any).insert({
      user_id: user.id,
      action: 'data_export',
      resource_type: 'profile',
      resource_id: user.id,
      new_value: { status: 'completed' },
    });

    return apiOk({ requestId: data.id, data: exportData });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
