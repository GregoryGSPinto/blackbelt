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
import { logRouteEvent } from '@/lib/monitoring/route-observability';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const { academy_id, billing_cycle, success_url, cancel_url } = await request.json();

    if (!academy_id || !billing_cycle) {
      logRouteEvent('warn', 'business', 'Trial conversion request missing required fields', request, {
        event_type: 'trial_convert_validation_failed',
        membership_id: membership.id,
        academy_id: membership.academy_id,
      });
      return NextResponse.json(
        { error: 'Missing required fields: academy_id, billing_cycle' },
        { status: 400 }
      );
    }

    if (!['monthly', 'annual'].includes(billing_cycle)) {
      logRouteEvent('warn', 'business', 'Trial conversion rejected due to invalid billing cycle', request, {
        event_type: 'trial_convert_invalid_cycle',
        membership_id: membership.id,
        academy_id: membership.academy_id,
      });
      return NextResponse.json(
        { error: 'Invalid billing_cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    if (academy_id !== membership.academy_id) {
      logRouteEvent('warn', 'security', 'Trial conversion blocked due to academy mismatch', request, {
        event_type: 'trial_convert_academy_mismatch',
        membership_id: membership.id,
        academy_id: membership.academy_id,
      });
      return NextResponse.json(
        { error: 'Academy mismatch for authenticated membership' },
        { status: 403 }
      );
    }

    const subscription = await planService.getSubscription(academy_id);
    if (!subscription) {
      logRouteEvent('warn', 'business', 'Trial conversion blocked because subscription record was not found', request, {
        event_type: 'trial_convert_subscription_missing',
        membership_id: membership.id,
        academy_id,
      });
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!['trialing', 'suspended'].includes(subscription.status)) {
      logRouteEvent('warn', 'business', 'Trial conversion blocked due to non-convertible subscription status', request, {
        event_type: 'trial_convert_invalid_status',
        membership_id: membership.id,
        academy_id,
        subscription_status: subscription.status,
      });
      return NextResponse.json(
        { error: 'Trial already converted or not in convertible state' },
        { status: 409 }
      );
    }

    if (!subscription.plan) {
      logRouteEvent('warn', 'business', 'Trial conversion blocked because subscription plan was not resolved', request, {
        event_type: 'trial_convert_plan_missing',
        membership_id: membership.id,
        academy_id,
      });
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

    logRouteEvent('info', 'business', 'Trial conversion checkout created', request, {
      event_type: 'trial_convert_checkout_created',
      membership_id: membership.id,
      academy_id,
      billing_cycle,
      plan_id: subscription.plan.id,
    });

    return NextResponse.json({
      checkoutUrl,
      status: 'pending_checkout',
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    logRouteEvent('error', 'error', 'Trial conversion failed unexpectedly', request, {
      event_type: 'trial_convert_failed',
      reason: error,
    });
    return apiServerError(error);
  }
}
