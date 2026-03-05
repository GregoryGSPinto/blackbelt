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

    // Gather user data for export
    const [profileRes, membershipsRes, attendancesRes, pointsRes] = await Promise.all([
      supabase.from('profiles' as any).select('*').eq('id', user.id).single(),
      supabase.from('memberships' as any).select('*').eq('profile_id', user.id),
      supabase.from('attendances' as any).select('*').eq('membership_id', user.id).limit(1000),
      supabase.from('points_ledger' as any).select('*').eq('membership_id', user.id).limit(1000),
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
