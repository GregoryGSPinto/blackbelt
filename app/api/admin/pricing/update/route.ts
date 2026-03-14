// ============================================================
// POST /api/admin/pricing/update - Update pricing (Super Admin only)
// ============================================================

import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/pricing/service';
import { withSuperAdminAccess } from '@/lib/api/access-context';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { apiServerError } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  try {
    const { user } = await withSuperAdminAccess(request);
    const supabase = getSupabaseAdminClient();

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
    if (error instanceof Response) {
      return error as NextResponse;
    }
    return apiServerError(error);
  }
}
