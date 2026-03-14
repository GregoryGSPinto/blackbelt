// ============================================================
// POST /api/subscription/upgrade - Upgrade subscription plan
// ============================================================

import { NextResponse } from 'next/server';
import { planService } from '@/lib/subscription/services-v3';
// BillingCycle type imported from '@/lib/subscription/types-v3'
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { withBillingManagerAccess } from '@/lib/api/access-context';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const supabase = getSupabaseAdminClient();

    const body = await request.json();
    const { target_plan_id, billing_cycle } = body;

    if (!target_plan_id) {
      return NextResponse.json(
        { error: 'target_plan_id required' },
        { status: 400 }
      );
    }

    const academyId = membership.academy_id;

    // Perform upgrade
    await planService.upgradePlan(academyId, target_plan_id);

    // If billing cycle changed, update it
    if (billing_cycle && ['monthly', 'annual'].includes(billing_cycle)) {
      await supabase
        .from('academy_subscriptions')
        .update({ billing_cycle })
        .eq('academy_id', academyId);
    }

    return NextResponse.json({
      success: true,
      message: 'Upgrade realizado com sucesso',
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Subscription Upgrade API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
