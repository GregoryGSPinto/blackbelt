// ============================================================
// POST /api/subscription/downgrade - Request subscription downgrade
// ============================================================

import { NextResponse } from 'next/server';
import { planManagement } from '@/lib/subscription/services';
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { planService } from '@/lib/subscription/services-v3';
import { createPortalSession } from '@/lib/payments/stripe-checkout';
import { getRequiredEnv } from '@/lib/env';

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
    const subscription = await planService.getSubscription(academyId);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'trialing') {
      if (!subscription.stripe_customer_id) {
        return NextResponse.json(
          { error: 'Paid subscription is not linked to Stripe portal. Manual downgrade scheduling would be unsafe.' },
          { status: 409 }
        );
      }

      const appUrl = getRequiredEnv('NEXT_PUBLIC_APP_URL');
      const portalUrl = await createPortalSession({
        academyId,
        returnUrl: `${appUrl}/dashboard/admin/plano?portal=return`,
      });

      return NextResponse.json({
        success: true,
        portalUrl,
        message: 'Use o portal Stripe para agendar downgrade/cancelamento com sincronização segura.',
      });
    }

    // Request downgrade (effective at end of period)
    await planManagement.requestDowngrade(academyId, targetPlanId);

    // Get subscription to return effective date
    const currentSubscription = await planManagement.getSubscription(academyId);

    return NextResponse.json({
      success: true,
      message: 'Downgrade scheduled for end of billing period',
      effectiveDate: currentSubscription?.current_period_ends_at
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
