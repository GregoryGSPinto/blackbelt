// ============================================================
// Subscription Infrastructure Types
// Re-exports from lib/subscription/types-v3 + additional types
// needed by services-impl.ts
// ============================================================

export type {
  PlanName,
  BillingCycle,
  SubscriptionStatus,
  MetricType,
  AddonType,
  CreditType,
  SupportLevel,
  PlanFeatures,
  SubscriptionPlan,
  PrepaidCredit,
} from '@/lib/subscription/types-v3';

import type { AcademySubscription as BaseAcademySubscription } from '@/lib/subscription/types-v3';

// Extend with field used by services-impl
export interface AcademySubscription extends BaseAcademySubscription {
  student_limit_current?: number;
}

// Extended UsageQuota with fields used by services-impl
// (overrides the simpler version in types-v3)
export interface UsageQuota {
  id: string;
  academy_id: string;
  metric_type: import('@/lib/subscription/types-v3').MetricType;
  included_amount: number;
  used_amount: number;
  overage_amount: number;
  overage_rate: number;
  overage_charges: number;
  reset_date: string;
  alert_80_sent_at: string | null;
  alert_95_sent_at: string | null;
  alert_100_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Additional types used by services-impl
// ============================================================

export interface UsageAddon {
  id: string;
  academy_id: string;
  addon_type: string;
  display_name: string;
  price: number;
  billing_cycle: 'monthly' | 'annual' | 'one_time';
  is_active: boolean;
  active_since: string;
  active_until: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface StoreTransaction {
  id: string;
  academy_id: string;
  order_id: string;
  transaction_amount: number;
  platform_fee_percent: number;
  platform_fee_amount: number;
  net_amount: number;
  status: 'pending' | 'processed' | 'paid_out' | 'refunded';
  transaction_date: string;
  processed_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Constants used by services-impl
// ============================================================

import type { MetricType, AddonType } from '@/lib/subscription/types-v3';

export const OVERAGE_RATES: Record<MetricType, number> = {
  reports: 900,       // R$ 9 per report
  storage: 390,       // R$ 3.90 per GB
  api_calls: 25,      // R$ 0.25 per 1k calls
  staff_users: 2900,  // R$ 29 per user
  exports: 500,       // R$ 5 per export
};

export const ADDON_CONFIG: Record<AddonType, {
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual' | 'one_time';
  description: string;
}> = {
  white_label: {
    name: 'White Label',
    price: 11900,
    billingCycle: 'monthly',
    description: 'Remove a marca BlackBelt e use sua identidade visual.',
  },
  store: {
    name: 'Loja Virtual',
    price: 0,
    billingCycle: 'monthly',
    description: 'Venda produtos e equipamentos na plataforma (5% por venda).',
  },
  dedicated_support: {
    name: 'Suporte Dedicado',
    price: 17900,
    billingCycle: 'monthly',
    description: 'Canal exclusivo de atendimento com SLA garantido.',
  },
  marketing_automation: {
    name: 'Automação de Marketing',
    price: 4900,
    billingCycle: 'monthly',
    description: 'Campanhas automatizadas, e-mails e notificações segmentadas.',
  },
  financial_module: {
    name: 'Módulo Financeiro Avançado',
    price: 5900,
    billingCycle: 'monthly',
    description: 'Relatórios financeiros avançados, DRE e fluxo de caixa.',
  },
};

export const STORE_CONFIG = {
  platformFeePercent: 5,
  minimumSalesThreshold: 50000, // R$ 500
  minimumMonthlyFee: 2900,      // R$ 29
};

export const PREPAID_DISCOUNT = 0.20; // 20% discount on prepaid credits

export const AUTO_UPGRADE_THRESHOLD = 1.05; // 105% of student limit
