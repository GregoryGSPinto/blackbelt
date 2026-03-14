import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, processWebhookEvent } from '@/lib/payments/stripe-webhook';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    logRouteEvent('warn', 'security', 'Stripe webhook rejected due to missing signature header', request, {
      event_type: 'stripe_webhook_missing_signature',
    });
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    logRouteEvent('warn', 'error', 'Stripe webhook request body could not be read', request, {
      event_type: 'stripe_webhook_body_read_failed',
    });
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  try {
    const event = constructWebhookEvent(rawBody, signature);
    logRouteEvent('info', 'business', 'Stripe webhook verified successfully', request, {
      event_type: 'stripe_webhook_verified',
      stripe_event_type: event.type,
      stripe_event_id: event.id,
    });
    await processWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    logRouteEvent('error', 'error', 'Stripe webhook processing failed', request, {
      event_type: 'stripe_webhook_failed',
      reason: err,
    });
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}
