// ============================================================
// POST /api/subscription/downgrade - Request subscription downgrade
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { planManagement } from '@/lib/subscription/services';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin permissions
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('academia_id, perfil')
      .eq('usuario_id', user.id)
      .single();

    if (!userAcademy) {
      return NextResponse.json({ error: 'No academy found' }, { status: 404 });
    }

    const allowedProfiles = ['ADMINISTRADOR', 'OWNER', 'SUPER_ADMIN'];
    if (!allowedProfiles.includes(userAcademy.perfil)) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { targetPlanId } = body;

    if (!targetPlanId) {
      return NextResponse.json(
        { error: 'targetPlanId required' },
        { status: 400 }
      );
    }

    const academyId = userAcademy.academia_id;

    // Request downgrade (effective at end of period)
    await planManagement.requestDowngrade(academyId, targetPlanId);

    // Get subscription to return effective date
    const subscription = await planManagement.getSubscription(academyId);

    return NextResponse.json({
      success: true,
      message: 'Downgrade scheduled for end of billing period',
      effectiveDate: subscription?.current_period_ends_at
    });
  } catch (error) {
    console.error('[Subscription Downgrade API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
