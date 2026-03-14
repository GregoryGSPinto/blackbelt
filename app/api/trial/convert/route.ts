// ============================================================
// POST /api/trial/convert - Convert trial to paid subscription
// ============================================================

import { NextResponse } from 'next/server';
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { planService } from '@/lib/subscription/services-v3';
import { createCheckoutSession } from '@/lib/payments/stripe-checkout';
import { resolveStripePriceId } from '@/lib/payments/stripe-plan-mapping';
import { getRequiredEnv } from '@/lib/env';
import { apiServerError } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const { academy_id, billing_cycle, success_url, cancel_url } = await request.json();

    if (!academy_id || !billing_cycle) {
      return NextResponse.json(
        { error: 'Missing required fields: academy_id, billing_cycle' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(billing_cycle)) {
      return NextResponse.json(
        { error: 'Invalid billing_cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    if (academy_id !== membership.academy_id) {
      return NextResponse.json(
        { error: 'Academy mismatch for authenticated membership' },
        { status: 403 }
      );
    }

    const subscription = await planService.getSubscription(academy_id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!['trialing', 'suspended'].includes(subscription.status)) {
      return NextResponse.json(
        { error: 'Trial already converted or not in convertible state' },
        { status: 409 }
      );
    }

    if (!subscription.plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 409 }
      );
    }

    const priceId = resolveStripePriceId(subscription.plan, billing_cycle);
    const appUrl = getRequiredEnv('NEXT_PUBLIC_APP_URL');
    const checkoutUrl = await createCheckoutSession({
      academyId: academy_id,
      planId: subscription.plan.id,
      billingCycle: billing_cycle,
      priceId,
      successUrl: success_url || `${appUrl}/dashboard/admin/plano?trial=converted`,
      cancelUrl: cancel_url || `${appUrl}/dashboard/admin/plano?trial=cancelled`,
    });

    return NextResponse.json({
      checkoutUrl,
      status: 'pending_checkout',
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    return apiServerError(error);
  }
}
