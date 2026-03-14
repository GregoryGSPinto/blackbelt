import { getOptionalEnv } from '@/lib/env';
import type { BillingCycle, SubscriptionPlan } from '@/lib/subscription/types-v3';

function normalizeEnvSegment(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function getCandidateKeys(plan: Pick<SubscriptionPlan, 'id' | 'name' | 'display_name'>, billingCycle: BillingCycle): string[] {
  const cycle = normalizeEnvSegment(billingCycle);
  const segments = [plan.id, plan.name, plan.display_name]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .map(normalizeEnvSegment);

  return Array.from(new Set(segments.map((segment) => `STRIPE_PRICE_${segment}_${cycle}`)));
}

export function resolveStripePriceId(
  plan: Pick<SubscriptionPlan, 'id' | 'name' | 'display_name'>,
  billingCycle: BillingCycle,
): string {
  for (const key of getCandidateKeys(plan, billingCycle)) {
    const value = getOptionalEnv(key);
    if (value) return value;
  }

  throw new Error(
    `Missing Stripe price mapping for plan ${plan.id} (${billingCycle}). Expected one of: ${getCandidateKeys(plan, billingCycle).join(', ')}`,
  );
}

export function inferBillingCycleFromPriceId(
  plan: Pick<SubscriptionPlan, 'id' | 'name' | 'display_name'>,
  priceId: string | null | undefined,
): BillingCycle | null {
  if (!priceId) return null;

  for (const cycle of ['monthly', 'annual'] as const) {
    try {
      if (resolveStripePriceId(plan, cycle) === priceId) {
        return cycle;
      }
    } catch {
      continue;
    }
  }

  return null;
}
