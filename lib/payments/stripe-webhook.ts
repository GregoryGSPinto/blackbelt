/**
 * Stripe webhook event processing.
 * Handles invoice, subscription, and payment events.
 * Compatible with Stripe SDK v20+ (2026-02-25.clover API).
 */

import type Stripe from 'stripe';
import { getStripeClient } from './stripe-client';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import type { BillingCycle } from '@/lib/subscription/types-v3';
import { structuredLog } from '@/lib/monitoring/structured-logger';
import { eventBus } from '@/lib/application/events/event-bus';
import {
  createEvent,
  startCausationChain,
} from '@/lib/domain/events/domain-events';
import type {
  PaymentCompleted,
  SubscriptionActivated,
  SubscriptionCancelled,
} from '@/lib/domain/events/domain-events';
import { inferBillingCycleFromPriceId } from './stripe-plan-mapping';

/**
 * Verify and construct a Stripe webhook event from raw body.
 */
export function constructWebhookEvent(
  rawBody: string | Buffer,
  signature: string,
): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Process a verified Stripe webhook event.
 */
export async function processWebhookEvent(event: Stripe.Event): Promise<void> {
  structuredLog.business.info('Stripe webhook event received for processing', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_webhook_event_received',
    stripe_event_id: event.id,
    stripe_event_type: event.type,
  });

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }
}

type AdminClient = ReturnType<typeof getSupabaseAdminClient> & {
  from: (table: string) => any;
};

function mapStripeSubscriptionStatus(status: string): 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended' {
  const statusMap: Record<string, 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended'> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'suspended',
    incomplete: 'past_due',
    incomplete_expired: 'canceled',
    paused: 'suspended',
  };

  return statusMap[status] ?? 'past_due';
}

function toIsoTimestamp(unixSeconds: number | null | undefined): string | null {
  return typeof unixSeconds === 'number' ? new Date(unixSeconds * 1000).toISOString() : null;
}

function toIsoDate(unixSeconds: number | null | undefined): string | null {
  const timestamp = toIsoTimestamp(unixSeconds);
  return timestamp ? timestamp.split('T')[0] : null;
}

function getInvoicePeriod(invoice: Stripe.Invoice): { periodStart: string | null; periodEnd: string | null } {
  const firstLine = invoice.lines.data[0];
  return {
    periodStart: toIsoDate(firstLine?.period?.start),
    periodEnd: toIsoDate(firstLine?.period?.end),
  };
}

function getInvoiceTaxAmount(invoice: Stripe.Invoice): number {
  const taxAmounts = (invoice as any).total_tax_amounts;
  if (!Array.isArray(taxAmounts)) return 0;
  return taxAmounts.reduce((sum: number, item: { amount?: number }) => sum + (item.amount ?? 0), 0);
}

function getInvoicePaymentIntentId(invoice: Stripe.Invoice): string | null {
  const paymentIntent = (invoice as any).payment_intent;
  if (typeof paymentIntent === 'string') return paymentIntent;
  return paymentIntent?.id ?? null;
}

async function getAcademySubscriptionByAcademyId(supabase: AdminClient, academyId: string) {
  const { data, error } = await supabase
    .from('academy_subscriptions')
    .select('id, academy_id, plan_id, status, billing_cycle, current_period_starts_at, current_period_ends_at, trial_converted, trial_converted_at, metadata')
    .eq('academy_id', academyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getAcademySubscriptionByStripeId(supabase: AdminClient, stripeSubscriptionId: string) {
  const { data, error } = await supabase
    .from('academy_subscriptions')
    .select('id, academy_id, plan_id, status, billing_cycle, metadata')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getPlanSummary(supabase: AdminClient, planId: string) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('id, name, display_name')
    .eq('id', planId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function resolveSubscriptionPlanId(
  supabase: AdminClient,
  explicitPlanId: string | null | undefined,
  subscription: Stripe.Subscription,
  fallbackPlanId: string | null | undefined,
): Promise<string | null> {
  if (explicitPlanId) return explicitPlanId;

  if (fallbackPlanId) {
    const fallbackPlan = await getPlanSummary(supabase, fallbackPlanId);
    const cycle = inferBillingCycleFromPriceId(fallbackPlan ?? { id: fallbackPlanId, name: fallbackPlanId, display_name: fallbackPlanId }, subscription.items.data[0]?.price.id);
    if (cycle) {
      return fallbackPlanId;
    }
  }

  const { data: plans, error } = await supabase
    .from('subscription_plans')
    .select('id, name, display_name');

  if (error) throw error;

  const priceId = subscription.items.data[0]?.price.id;
  if (!priceId) return fallbackPlanId ?? null;

  for (const plan of plans ?? []) {
    if (inferBillingCycleFromPriceId(plan, priceId)) {
      return plan.id;
    }
  }

  return fallbackPlanId ?? null;
}

function resolveBillingCycle(
  explicitCycle: string | null | undefined,
  subscription: Stripe.Subscription,
  existingCycle: BillingCycle | null | undefined,
): BillingCycle {
  if (explicitCycle === 'monthly' || explicitCycle === 'annual') {
    return explicitCycle;
  }

  const interval = subscription.items.data[0]?.price.recurring?.interval;
  if (interval === 'year') return 'annual';
  if (interval === 'month') return 'monthly';

  return existingCycle ?? 'monthly';
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as AdminClient;

  const academyId = session.metadata?.academy_id;
  const planId = session.metadata?.plan_id ?? null;
  const billingCycle = session.metadata?.billing_cycle === 'annual' ? 'annual' : 'monthly';
  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null;
  const stripeCustomerId =
    typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id ?? null;

  if (!academyId || !stripeSubscriptionId) {
    structuredLog.business.warn('Stripe checkout completion ignored because tenant context was incomplete', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_checkout_missing_tenant_context',
      academy_id: academyId ?? null,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_checkout_session_id: session.id,
    });
    return;
  }

  const existing = await getAcademySubscriptionByAcademyId(supabase, academyId);
  const resolvedPlanId = planId ?? existing?.plan_id ?? null;

  if (!resolvedPlanId) {
    throw new Error(`Unable to resolve subscription plan for academy ${academyId}`);
  }

  await supabase
    .from('academies')
    .update({ stripe_customer_id: stripeCustomerId })
    .eq('id', academyId);

  const payload = {
    academy_id: academyId,
    plan_id: resolvedPlanId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_customer_id: stripeCustomerId,
    status: session.payment_status === 'paid' ? 'active' : 'past_due',
    billing_cycle: billingCycle,
    current_period_starts_at: existing?.current_period_starts_at ?? new Date().toISOString(),
    current_period_ends_at: existing?.current_period_ends_at ?? null,
    trial_converted: existing?.status === 'trialing' ? true : existing?.trial_converted ?? false,
    trial_converted_at: existing?.status === 'trialing' ? new Date().toISOString() : existing?.trial_converted_at ?? null,
    metadata: {
      ...(existing?.metadata ?? {}),
      last_checkout_session_id: session.id,
    },
  };

  if (existing?.id) {
    await supabase.from('academy_subscriptions').update(payload).eq('id', existing.id);
  } else {
    await supabase.from('academy_subscriptions').insert(payload);
  }

  structuredLog.business.info('Stripe checkout completion synced academy subscription', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_checkout_synced',
    academy_id: academyId,
    stripe_subscription_id: stripeSubscriptionId,
    stripe_checkout_session_id: session.id,
    plan_id: resolvedPlanId,
  });
}

function getSubscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const subDetails = invoice.parent?.subscription_details;
  if (!subDetails) return null;
  return typeof subDetails.subscription === 'string'
    ? subDetails.subscription
    : subDetails.subscription?.id ?? null;
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as AdminClient;
  const stripeSubscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!stripeSubscriptionId) {
    structuredLog.business.warn('Stripe invoice paid event ignored because no subscription id was present', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_invoice_paid_missing_subscription',
      stripe_invoice_id: invoice.id,
    });
    return;
  }

  const sub = await getAcademySubscriptionByStripeId(supabase, stripeSubscriptionId);

  if (!sub) {
    structuredLog.business.warn('Stripe invoice paid event ignored because academy subscription was not found', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_invoice_paid_subscription_missing',
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: stripeSubscriptionId,
    });
    return;
  }

  const { periodStart, periodEnd } = getInvoicePeriod(invoice);

  const { data: inv } = await supabase
    .from('subscription_invoices')
    .upsert({
      academy_id: sub.academy_id,
      period_start: periodStart,
      period_end: periodEnd,
      subscription_amount: invoice.subtotal ?? invoice.amount_paid,
      setup_amount: 0,
      overages_amount: 0,
      addons_amount: 0,
      discounts_amount: 0,
      subtotal: invoice.subtotal ?? invoice.amount_paid,
      tax_amount: getInvoiceTaxAmount(invoice),
      total_amount: invoice.amount_paid,
      status: 'paid',
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: getInvoicePaymentIntentId(invoice),
      paid_at: new Date().toISOString(),
    }, { onConflict: 'stripe_invoice_id' })
    .select('id')
    .single();

  if (!inv) return;

  await supabase
    .from('academy_subscriptions')
    .update({
      status: 'active',
      current_period_starts_at: periodStart ? `${periodStart}T00:00:00.000Z` : undefined,
      current_period_ends_at: periodEnd ? `${periodEnd}T00:00:00.000Z` : undefined,
    })
    .eq('id', sub.id);

  // Emit domain event
  const ctx = startCausationChain();
  const domainEvent = createEvent<PaymentCompleted>(
    'PaymentCompleted',
    sub.academy_id,
    {
      invoiceId: inv.id,
      amount: invoice.amount_paid,
      method: 'stripe',
    },
    {
      ...ctx,
      metadata: { source: 'api' },
    },
  );
  eventBus.publish(domainEvent);

  structuredLog.business.info('Stripe invoice paid synchronized billing state', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_invoice_paid_synced',
    academy_id: sub.academy_id,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: stripeSubscriptionId,
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as AdminClient;
  const stripeSubscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!stripeSubscriptionId) {
    structuredLog.business.warn('Stripe invoice failure event ignored because no subscription id was present', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_invoice_failed_missing_subscription',
      stripe_invoice_id: invoice.id,
    });
    return;
  }

  const sub = await getAcademySubscriptionByStripeId(supabase, stripeSubscriptionId);

  if (!sub) {
    structuredLog.business.warn('Stripe invoice failure event ignored because academy subscription was not found', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_invoice_failed_subscription_missing',
      stripe_invoice_id: invoice.id,
      stripe_subscription_id: stripeSubscriptionId,
    });
    return;
  }

  const { periodStart, periodEnd } = getInvoicePeriod(invoice);

  await supabase
    .from('academy_subscriptions')
    .update({ status: 'past_due' })
    .eq('id', sub.id);

  await supabase
    .from('subscription_invoices')
    .upsert({
      academy_id: sub.academy_id,
      period_start: periodStart,
      period_end: periodEnd,
      subscription_amount: invoice.subtotal ?? invoice.amount_due,
      setup_amount: 0,
      overages_amount: 0,
      addons_amount: 0,
      discounts_amount: 0,
      subtotal: invoice.subtotal ?? invoice.amount_due,
      tax_amount: getInvoiceTaxAmount(invoice),
      total_amount: invoice.amount_due,
      status: 'failed',
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: getInvoicePaymentIntentId(invoice),
      failed_at: new Date().toISOString(),
    }, { onConflict: 'stripe_invoice_id' });

  structuredLog.business.warn('Stripe invoice payment failure marked academy subscription as past due', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_invoice_failed_synced',
    academy_id: sub.academy_id,
    stripe_invoice_id: invoice.id,
    stripe_subscription_id: stripeSubscriptionId,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as AdminClient;

  const sub = await getAcademySubscriptionByStripeId(supabase, subscription.id);

  if (!sub) {
    structuredLog.business.warn('Stripe subscription update ignored because academy subscription was not found', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_subscription_update_missing',
      stripe_subscription_id: subscription.id,
    });
    return;
  }

  const planId = await resolveSubscriptionPlanId(
    supabase,
    subscription.metadata?.plan_id,
    subscription,
    sub.plan_id,
  );
  const newStatus = mapStripeSubscriptionStatus(subscription.status);
  const billingCycle = resolveBillingCycle(subscription.metadata?.billing_cycle, subscription, sub.billing_cycle);

  await supabase
    .from('academy_subscriptions')
    .update({
      status: newStatus,
      plan_id: planId ?? sub.plan_id,
      billing_cycle: billingCycle,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id ?? null,
      current_period_starts_at: toIsoTimestamp((subscription as any).current_period_start) ?? undefined,
      current_period_ends_at: toIsoTimestamp((subscription as any).current_period_end) ?? undefined,
      auto_renew: !subscription.cancel_at_period_end,
      metadata: {
        ...(sub.metadata ?? {}),
        cancel_at_period_end: subscription.cancel_at_period_end,
      },
    })
    .eq('id', sub.id);

  // Emit SubscriptionActivated if becoming active
  if (newStatus === 'active' && sub.status !== 'active') {
    const ctx = startCausationChain();
    const domainEvent = createEvent<SubscriptionActivated>(
      'SubscriptionActivated',
      sub.academy_id,
      {
        academyId: sub.academy_id,
        planId: planId ?? sub.plan_id,
      },
      {
        ...ctx,
        metadata: { source: 'api' },
      },
    );
    eventBus.publish(domainEvent);
  }

  structuredLog.business.info('Stripe subscription update synchronized academy billing state', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_subscription_updated_synced',
    academy_id: sub.academy_id,
    stripe_subscription_id: subscription.id,
    subscription_status: newStatus,
    plan_id: planId ?? sub.plan_id,
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as AdminClient;

  const sub = await getAcademySubscriptionByStripeId(supabase, subscription.id);

  if (!sub) {
    structuredLog.business.warn('Stripe subscription deletion ignored because academy subscription was not found', {
      route: '/api/webhooks/stripe',
      event_type: 'stripe_subscription_deleted_missing',
      stripe_subscription_id: subscription.id,
    });
    return;
  }

  await supabase
    .from('academy_subscriptions')
    .update({
      status: 'canceled',
      auto_renew: false,
      current_period_ends_at: toIsoTimestamp((subscription as any).current_period_end) ?? undefined,
      metadata: {
        ...(sub.metadata ?? {}),
        canceled_at: new Date().toISOString(),
        cancellation_reason: subscription.cancellation_details?.reason ?? 'customer_request',
      },
    })
    .eq('id', sub.id);

  const ctx = startCausationChain();
  const domainEvent = createEvent<SubscriptionCancelled>(
    'SubscriptionCancelled',
    sub.academy_id,
    {
      academyId: sub.academy_id,
      reason: subscription.cancellation_details?.reason ?? 'customer_request',
    },
    {
      ...ctx,
      metadata: { source: 'api' },
    },
  );
  eventBus.publish(domainEvent);

  structuredLog.business.warn('Stripe subscription deletion synchronized academy cancellation state', {
    route: '/api/webhooks/stripe',
    event_type: 'stripe_subscription_deleted_synced',
    academy_id: sub.academy_id,
    stripe_subscription_id: subscription.id,
  });
}
