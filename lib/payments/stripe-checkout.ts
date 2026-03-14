/**
 * Stripe Checkout and Customer Portal sessions.
 * Server-side only.
 */

import { getStripeClient } from './stripe-client';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { BillingCycle } from '@/lib/subscription/types-v3';

/**
 * Ensure an academy has a Stripe customer ID.
 * Creates one if it doesn't exist.
 */
export async function ensureStripeCustomer(academyId: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as any;

  const { data: academy } = await supabase
    .from('academies')
    .select('id, name, stripe_customer_id')
    .eq('id', academyId)
    .single();

  if (!academy) throw new Error(`Academy ${academyId} not found`);

  if (academy.stripe_customer_id) {
    return academy.stripe_customer_id;
  }

  const stripe = getStripeClient();
  const customer = await stripe.customers.create({
    name: academy.name,
    metadata: { academy_id: academyId },
  });

  await supabase
    .from('academies')
    .update({ stripe_customer_id: customer.id })
    .eq('id', academyId);

  return customer.id;
}

/**
 * Create a Stripe Checkout session for a new subscription.
 */
export async function createCheckoutSession(params: {
  academyId: string;
  planId: string;
  billingCycle: BillingCycle;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(params.academyId);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: params.priceId, quantity: 1 }],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    client_reference_id: params.academyId,
    metadata: {
      academy_id: params.academyId,
      plan_id: params.planId,
      billing_cycle: params.billingCycle,
    },
    subscription_data: {
      metadata: {
        academy_id: params.academyId,
        plan_id: params.planId,
        billing_cycle: params.billingCycle,
      },
    },
  });

  if (!session.url) throw new Error('Failed to create checkout session');
  return session.url;
}

/**
 * Create a Stripe Customer Portal session for managing subscription.
 */
export async function createPortalSession(params: {
  academyId: string;
  returnUrl: string;
}): Promise<string> {
  const stripe = getStripeClient();
  const customerId = await ensureStripeCustomer(params.academyId);

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: params.returnUrl,
  });

  return session.url;
}

export async function updateStripeSubscriptionPlan(params: {
  stripeSubscriptionId: string;
  priceId: string;
  academyId: string;
  planId: string;
  billingCycle: BillingCycle;
}): Promise<void> {
  const stripe = getStripeClient();
  const subscription = await stripe.subscriptions.retrieve(params.stripeSubscriptionId);
  const currentItem = subscription.items.data[0];

  if (!currentItem) {
    throw new Error('Stripe subscription has no billable items');
  }

  await stripe.subscriptions.update(params.stripeSubscriptionId, {
    items: [{ id: currentItem.id, price: params.priceId }],
    proration_behavior: 'create_prorations',
    metadata: {
      ...(subscription.metadata ?? {}),
      academy_id: params.academyId,
      plan_id: params.planId,
      billing_cycle: params.billingCycle,
    },
  });
}
