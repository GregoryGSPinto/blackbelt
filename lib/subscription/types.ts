// ============================================================
// Subscription Pricing System - Types
// ============================================================

export type PlanName = 'Start' | 'Medium' | 'Pro' | 'Business' | 'Enterprise' | 'Custom';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled' | 'past_due';

export type MetricType = 
  | 'custom_reports' 
  | 'api_requests' 
  | 'storage_gb' 
  | 'staff_users' 
  | 'history_months';

export type AddonType =
  | 'deep_analytics'      // R$ 49/mês - relatórios ilimitados
  | 'api_10k'            // R$ 79/mês - 10k requisições
  | 'storage_100gb'      // R$ 99/mês - 100 GB
  | 'unlimited_staff'    // R$ 99/mês - usuários ilimitados
  | 'history_24m'        // R$ 29/mês - histórico 24 meses
  | 'history_36m'        // R$ 49/mês - histórico 36 meses
  | 'white_label'        // R$ 79/mês - white label
  | 'custom_domain'      // R$ 20/mês - domínio próprio
  | 'dedicated_support'  // R$ 99/mês - suporte dedicado
  | 'account_manager'    // R$ 299/mês - account manager
  | 'onboarding';        // R$ 497 único - onboarding presencial

export type CreditType = 
  | 'api_requests' 
  | 'storage_gb' 
  | 'custom_reports' 
  | 'staff_users';

// ============================================================
// Database Models
// ============================================================

export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  display_name: string;
  student_limit: number | null;
  base_price_monthly: number;
  base_price_annual: number;
  sort_order: number;
  features: PlanFeatures;
  default_quotas: DefaultQuotas;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  student_management: boolean;
  mobile_app: boolean;
  checkin_unlimited: boolean;
  gamification: boolean;
  parent_portal: boolean;
  chat: boolean;
  schedule: boolean;
  intelligence_basic: boolean;
  api: boolean;
  standard_reports: boolean;
  support_chat_email: boolean;
}

export interface DefaultQuotas {
  custom_reports: number;
  api_requests: number;
  storage_gb: number;
  staff_users: number;
  history_months: number;
}

export interface AcademySubscription {
  id: string;
  academy_id: string;
  plan_id: string;
  student_limit_current: number;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_starts_at: string;
  current_period_ends_at: string;
  auto_upgrade_enabled: boolean;
  auto_downgrade_enabled: boolean;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  
  // Join
  plan?: SubscriptionPlan;
}

export interface UsageQuota {
  id: string;
  academy_id: string;
  metric_type: MetricType;
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

export interface UsageAddon {
  id: string;
  academy_id: string;
  addon_type: AddonType;
  display_name: string;
  price: number;
  billing_cycle: 'monthly' | 'annual' | 'one_time';
  is_active: boolean;
  active_since: string;
  active_until: string | null;
  metadata: Record<string, unknown>;
  stripe_price_id: string | null;
  stripe_subscription_item_id: string | null;
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
  status: 'pending' | 'processed' | 'paid_out' | 'refunded' | 'cancelled';
  transaction_date: string;
  processed_at: string | null;
  paid_out_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PrepaidCredit {
  id: string;
  academy_id: string;
  credit_type: CreditType;
  amount: number;
  amount_used: number;
  amount_remaining: number;
  price_paid: number;
  effective_rate: number;
  valid_until: string | null;
  is_active: boolean;
  stripe_payment_intent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionChange {
  id: string;
  academy_id: string;
  previous_plan_id: string | null;
  new_plan_id: string | null;
  change_type: 'upgrade' | 'downgrade' | 'cancellation' | 'reactivation';
  reason: 'manual' | 'auto_limit' | 'billing_issue' | 'business_rule' | null;
  previous_price: number | null;
  new_price: number | null;
  prorated_amount: number | null;
  effective_at: string;
  applied_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface OverageInvoice {
  id: string;
  academy_id: string;
  period_start: string;
  period_end: string;
  subscription_amount: number;
  overages_breakdown: OveragesBreakdown;
  total_overage: number;
  addons_amount: number;
  discounts_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  failed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OveragesBreakdown {
  [metricType: string]: {
    included: number;
    used: number;
    overage: number;
    rate: number;
    charge: number;
  };
}

// ============================================================
// DTOs
// ============================================================

export interface SubscriptionResponse {
  subscription: AcademySubscription;
  quotas: UsageQuota[];
  addons: UsageAddon[];
  upcomingInvoice: {
    subscriptionAmount: number;
    addonsAmount: number;
    overagesAmount: number;
    totalAmount: number;
    periodStart: string;
    periodEnd: string;
  } | null;
}

export interface UsageResponse {
  quotas: UsageQuota[];
  alerts: UsageAlert[];
  forecast: {
    projectedOverage: number;
    confidence: number; // 0-1
  };
}

export interface UsageAlert {
  metric_type: MetricType;
  threshold: 80 | 95 | 100;
  current_usage: number;
  limit: number;
  message: string;
}

export interface BuyCreditsRequest {
  creditType: CreditType;
  amount: number;
}

export interface BuyCreditsResponse {
  credit: PrepaidCredit;
  clientSecret: string | null; // Stripe
}

export interface AddonToggleRequest {
  addonType: AddonType;
  active: boolean;
}

export interface BillingForecastResponse {
  currentPeriod: {
    start: string;
    end: string;
  };
  subscription: {
    plan: PlanName;
    cycle: BillingCycle;
    baseAmount: number;
  };
  addons: {
    addonType: AddonType;
    name: string;
    price: number;
  }[];
  usage: {
    metricType: MetricType;
    included: number;
    projected: number;
    overageRate: number;
    projectedCharge: number;
  }[];
  projectedTotal: number;
}

export interface UpgradePlanRequest {
  targetPlanId: string;
  billingCycle?: BillingCycle;
}

export interface UpgradePlanResponse {
  success: boolean;
  proratedAmount: number;
  newAmount: number;
  effectiveDate: string;
  clientSecret: string | null;
}

// ============================================================
// Constants
// ============================================================

export const ADDON_CONFIG: Record<AddonType, { name: string; price: number; billingCycle: 'monthly' | 'annual' | 'one_time'; description: string }> = {
  deep_analytics: {
    name: 'Deep Analytics',
    price: 49,
    billingCycle: 'monthly',
    description: 'Relatórios customizados ilimitados'
  },
  api_10k: {
    name: 'API 10K',
    price: 79,
    billingCycle: 'monthly',
    description: '10.000 requisições API por mês'
  },
  storage_100gb: {
    name: 'Storage 100GB',
    price: 99,
    billingCycle: 'monthly',
    description: '100 GB de armazenamento'
  },
  unlimited_staff: {
    name: 'Usuários Ilimitados',
    price: 99,
    billingCycle: 'monthly',
    description: 'Usuários staff ilimitados'
  },
  history_24m: {
    name: 'Histórico 24 Meses',
    price: 29,
    billingCycle: 'monthly',
    description: '24 meses de histórico de dados'
  },
  history_36m: {
    name: 'Histórico 36 Meses',
    price: 49,
    billingCycle: 'monthly',
    description: '36 meses de histórico de dados'
  },
  white_label: {
    name: 'White Label',
    price: 79,
    billingCycle: 'monthly',
    description: 'Logo, cores e splash screen customizados'
  },
  custom_domain: {
    name: 'Domínio Próprio',
    price: 20,
    billingCycle: 'monthly',
    description: 'Use seu próprio domínio'
  },
  dedicated_support: {
    name: 'Suporte Dedicado',
    price: 99,
    billingCycle: 'monthly',
    description: 'Suporte telefone/SLA 2h'
  },
  account_manager: {
    name: 'Account Manager',
    price: 299,
    billingCycle: 'monthly',
    description: 'Gerente de conta dedicado'
  },
  onboarding: {
    name: 'Onboarding Presencial',
    price: 497,
    billingCycle: 'one_time',
    description: 'Onboarding completo presencial'
  }
};

export const OVERAGE_RATES: Record<MetricType, number> = {
  custom_reports: 5.00,    // R$ 5 por relatório extra
  api_requests: 0.01,      // R$ 0.01 por requisição
  storage_gb: 2.00,        // R$ 2 por GB
  staff_users: 15.00,      // R$ 15 por usuário
  history_months: 0        // calculado via add-on
};

export const STORE_CONFIG = {
  platformFeePercent: 3,
  minimumMonthlyFee: 29,
  minimumSalesThreshold: 1000
};

export const PREPAID_DISCOUNT = 0.20; // 20% de desconto

export const AUTO_UPGRADE_THRESHOLD = 1.05; // 105% do limite
export const AUTO_DOWNGRADE_MONTHS = 2; // média de 2 meses abaixo do limite
