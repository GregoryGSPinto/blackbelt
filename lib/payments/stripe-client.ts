/**
 * Server-side Stripe client singleton.
 * Only import this file from server-side code (API routes, server actions).
 */

import Stripe from 'stripe';
import { getRequiredEnv } from '@/lib/env';

let stripeInstance: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (stripeInstance) return stripeInstance;

  const secretKey = getRequiredEnv('STRIPE_SECRET_KEY');

  stripeInstance = new Stripe(secretKey);

  return stripeInstance;
}
