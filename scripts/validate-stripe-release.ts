import { readFileSync } from 'fs';
import { resolve } from 'path';

function mustContain(source: string, value: string, label: string) {
  if (!source.includes(value)) {
    throw new Error(`Missing ${label}: ${value}`);
  }
}

const webhookRoute = readFileSync(resolve('app/api/webhooks/stripe/route.ts'), 'utf8');
const webhookLib = readFileSync(resolve('lib/payments/stripe-webhook.ts'), 'utf8');

mustContain(webhookRoute, 'constructWebhookEvent', 'webhook constructor call');
mustContain(webhookLib, 'stripe.webhooks.constructEvent', 'Stripe signature verification');
mustContain(webhookLib, "case 'checkout.session.completed'", 'checkout completion handler');
mustContain(webhookLib, "case 'invoice.payment_failed'", 'invoice failure handler');

const requiredEnv = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'NEXT_PUBLIC_APP_URL'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length) {
  console.warn(`[Stripe Validation] Missing env vars for live E2E execution: ${missingEnv.join(', ')}`);
  process.exit(0);
}

console.log('[Stripe Validation] Static release checks passed. Live checkout execution requires external Stripe test runner.');
