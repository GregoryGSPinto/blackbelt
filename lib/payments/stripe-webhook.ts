/**
 * Stripe webhook event processing.
 * Handles invoice, subscription, and payment events.
 * Compatible with Stripe SDK v20+ (2026-02-25.clover API).
 */

import type Stripe from 'stripe';
import { getStripeClient } from './stripe-client';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
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
  switch (event.type) {
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;
  }
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
  const supabase = getSupabaseAdminClient() as any;
  const stripeSubscriptionId = getSubscriptionIdFromInvoice(invoice);

  if (!stripeSubscriptionId) return;

  // Find subscription by stripe ID
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, academy_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single();

  if (!sub) return;

  // Update or create invoice record
  const { data: inv } = await supabase
    .from('invoices')
    .upsert({
      subscription_id: sub.id,
      academy_id: sub.academy_id,
      stripe_invoice_id: invoice.id,
      amount_cents: invoice.amount_paid,
      status: 'paid',
      due_date: new Date(invoice.created * 1000).toISOString().split('T')[0],
      paid_at: new Date().toISOString(),
    }, { onConflict: 'stripe_invoice_id' })
    .select('id')
    .single();

  if (!inv) return;

  // Create payment record
  await supabase.from('payments').insert({
    invoice_id: inv.id,
    academy_id: sub.academy_id,
    amount_cents: invoice.amount_paid,
    method: 'stripe',
    external_id: invoice.id,
    paid_at: new Date().toISOString(),
  });

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
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as any;

  const statusMap: Record<string, string> = {
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'suspended',
  };

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, academy_id, plan_id, status')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  const newStatus = statusMap[subscription.status] ?? sub.status;

  await supabase
    .from('subscriptions')
    .update({ status: newStatus })
    .eq('id', sub.id);

  // Emit SubscriptionActivated if becoming active
  if (newStatus === 'active' && sub.status !== 'active') {
    const ctx = startCausationChain();
    const domainEvent = createEvent<SubscriptionActivated>(
      'SubscriptionActivated',
      sub.academy_id,
      {
        academyId: sub.academy_id,
        planId: sub.plan_id,
      },
      {
        ...ctx,
        metadata: { source: 'api' },
      },
    );
    eventBus.publish(domainEvent);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = getSupabaseAdminClient() as any;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id, academy_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  if (!sub) return;

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
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
}
