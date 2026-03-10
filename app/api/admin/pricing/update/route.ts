// ============================================================
// POST /api/admin/pricing/update - Update pricing (Super Admin only)
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const authSupabase = await getSupabaseServerClient();
    const supabase = getSupabaseAdminClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify super admin role
    const { data: userAcademy } = await supabase
      .from('usuarios_academia')
      .select('perfil')
      .eq('usuario_id', user.id)
      .single();

    if (userAcademy?.perfil !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Super Admin required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { config_key, new_value, reason } = body;

    if (!config_key || typeof new_value !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: config_key, new_value' },
        { status: 400 }
      );
    }

    // Update pricing
    const updated = await pricingService.updatePricing(
      config_key,
      new_value,
      user.id,
      reason
    );

    // Broadcast realtime update
    await supabase.channel('pricing_updates').send({
      type: 'broadcast',
      event: 'price_change',
      payload: { config_key, new_value, updated_at: new Date().toISOString() }
    });

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('[Admin Pricing Update API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
