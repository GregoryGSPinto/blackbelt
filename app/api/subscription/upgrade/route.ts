// ============================================================
// POST /api/subscription/upgrade - Upgrade subscription plan
// ============================================================

import { NextResponse } from 'next/server';
import { planService } from '@/lib/subscription/services-v3';
// BillingCycle type imported from '@/lib/subscription/types-v3'
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { resolveStripePriceId } from '@/lib/payments/stripe-plan-mapping';
import { updateStripeSubscriptionPlan } from '@/lib/payments/stripe-checkout';
import { apiServerError } from '@/lib/api/route-helpers';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

export async function POST(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);

    const body = await request.json();
    const { target_plan_id, billing_cycle } = body;

    if (!target_plan_id) {
      return NextResponse.json(
        { error: 'target_plan_id required' },
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

    if (subscription.status === 'trialing') {
      await planService.upgradePlan(academyId, target_plan_id);
      logRouteEvent('info', 'business', 'Trial plan upgraded', request, {
        event_type: 'subscription_trial_upgrade',
        academy_id: academyId,
        target_plan_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Upgrade do trial realizado com sucesso',
      });
    }

    if (!subscription.stripe_subscription_id) {
      return NextResponse.json(
        { error: 'Paid subscription is not linked to Stripe. Start billing checkout before changing plan.' },
        { status: 409 }
      );
    }

    const targetPlan = await planService.getPlan(target_plan_id);
    if (!targetPlan) {
      return NextResponse.json(
        { error: 'Target plan not found' },
        { status: 404 }
      );
    }

    const nextCycle = billing_cycle && ['monthly', 'annual'].includes(billing_cycle)
      ? billing_cycle
      : subscription.billing_cycle;
    const priceId = resolveStripePriceId(targetPlan, nextCycle);

    await updateStripeSubscriptionPlan({
      stripeSubscriptionId: subscription.stripe_subscription_id,
      academyId,
      planId: targetPlan.id,
      billingCycle: nextCycle,
      priceId,
    });

    logRouteEvent('info', 'business', 'Stripe subscription upgrade submitted', request, {
      event_type: 'subscription_stripe_upgrade',
      academy_id: academyId,
      target_plan_id: targetPlan.id,
      billing_cycle: nextCycle,
    });

    return NextResponse.json({
      success: true,
      message: 'Upgrade enviado para Stripe. Aguarde a sincronização do webhook.',
    });
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    logRouteEvent('error', 'error', 'Subscription upgrade failed unexpectedly', request, {
      event_type: 'subscription_upgrade_failed',
      reason: error,
    });
    return apiServerError(error);
  }
}
