// ============================================================
// POST /api/subscription/downgrade - Request subscription downgrade
// ============================================================

import { NextResponse } from 'next/server';
import { planManagement } from '@/lib/subscription/services';
import { withBillingManagerAccess } from '@/lib/api/access-context';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);

    const body = await request.json();
    const { targetPlanId } = body;

    if (!targetPlanId) {
      return NextResponse.json(
        { error: 'targetPlanId required' },
        { status: 400 }
      );
    }

    const academyId = membership.academy_id;

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
    if (error instanceof Response) {
      return error as NextResponse;
    }
    console.error('[Subscription Downgrade API]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
