/**
 * Pricing plans and rules for BBOS platform.
 *
 * Each academy subscribes to a plan that determines their feature set
 * and usage limits. Usage-based billing can be layered on top.
 */

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  intervalMonths: number;
  features: string[];
  limits: {
    activeMembers: number;
    checkinsPerMonth: number;
    storageMb: number;
    pushPerMonth: number;
  };
}

export const PLANS: Record<string, PricingPlan> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Para academias iniciando na plataforma',
    priceCents: 9900,
    intervalMonths: 1,
    features: ['check-in', 'attendance', 'basic-reports'],
    limits: {
      activeMembers: 50,
      checkinsPerMonth: 500,
      storageMb: 500,
      pushPerMonth: 1000,
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Para academias em crescimento',
    priceCents: 19900,
    intervalMonths: 1,
    features: ['check-in', 'attendance', 'reports', 'gamification', 'push', 'billing'],
    limits: {
      activeMembers: 200,
      checkinsPerMonth: 5000,
      storageMb: 2000,
      pushPerMonth: 10000,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para redes de academias',
    priceCents: 49900,
    intervalMonths: 1,
    features: ['check-in', 'attendance', 'reports', 'gamification', 'push', 'billing', 'api', 'white-label', 'video'],
    limits: {
      activeMembers: -1, // unlimited
      checkinsPerMonth: -1,
      storageMb: 10000,
      pushPerMonth: -1,
    },
  },
};

export function getPlan(planId: string): PricingPlan | undefined {
  return PLANS[planId];
}

export function formatPrice(priceCents: number): string {
  return `R$ ${(priceCents / 100).toFixed(2).replace('.', ',')}`;
}
