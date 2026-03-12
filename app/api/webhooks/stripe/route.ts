import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, processWebhookEvent } from '@/lib/payments/stripe-webhook';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  try {
    const event = constructWebhookEvent(rawBody, signature);
    await processWebhookEvent(event);
    return NextResponse.json({ received: true });
  } catch (err) {
    logger.error('[Stripe Webhook]', 'Webhook processing failed', err);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}
