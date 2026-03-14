// ============================================================
// BlackBelt Pricing v3.0 - Types
// ============================================================

export type PlanName = 'Start' | 'Medium' | 'Pro' | 'Business' | 'Enterprise' | 'Custom';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended';
export type MetricType = 'reports' | 'storage' | 'api_calls' | 'staff_users' | 'exports';
export type AddonType = 'white_label' | 'store' | 'dedicated_support' | 'marketing_automation' | 'financial_module';
export type CreditType = 'reports' | 'storage' | 'api_calls' | 'staff_users';
export type SupportLevel = 'email' | 'chat' | 'priority' | 'dedicated' | 'dedicated_sla';
export type MLLevel = 'basic' | 'full';

// ============================================================
// Features por Plano
// ============================================================
export interface PlanFeatures {
  ml_level: MLLevel;
  reports_limit: number | null; // null = ilimitado
  storage_gb: number | null;
  staff_limit: number | null;
  api_limit: number | null;
  support_level: SupportLevel;
  white_label: boolean;
  store_enabled: boolean;
  advanced_reports: boolean;
  priority_support: boolean;
}

// ============================================================
// Database Models
// ============================================================
export interface SubscriptionPlan {
  id: string;
  name: PlanName;
  display_name: string;
  student_limit: number | null;
  base_price_monthly: number; // em centavos
  base_price_annual: number; // em centavos
  setup_price: number; // em centavos
  trial_days: number;
  features: PlanFeatures;
  sort_order: number;
  is_active: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademySubscription {
  id: string;
  academy_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  billing_cycle: BillingCycle;
  
  // Trial
  trial_starts_at: string | null;
  trial_ends_at: string | null;
  trial_converted: boolean;
  trial_converted_at: string | null;
  
  // Setup
  setup_paid: boolean;
  setup_paid_at: string | null;
  setup_amount: number | null;
  
  // Period
  current_period_starts_at: string | null;
  current_period_ends_at: string | null;
  
  // Stripe
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  
  // Config
  auto_upgrade_enabled: boolean;
  auto_renew: boolean;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
  
  // Joins
  plan?: SubscriptionPlan;
}

export interface TrialTracking {
  id: string;
  academy_id: string;
  trial_plan_id: string;
  trial_plan_name: string;
  trial_started_at: string;
  trial_ends_at: string;
  converted: boolean;
  converted_at: string | null;
  converted_plan_id: string | null;
  converted_billing_cycle: BillingCycle | null;
  setup_collected: boolean;
  setup_amount: number | null;
  alerts_sent: number[];
  source: string;
  referrer_academy_id: string | null;
  cancellation_reason: string | null;
  cancellation_feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageQuota {
  id: string;
  academy_id: string;
  metric_type: MetricType;
  period_start: string;
  period_end: string;
  included_amount: number;
  used_amount: number;
  overage_amount: number;
  overage_charges: number; // em centavos
  created_at: string;
  updated_at: string;
}

export interface SubscriptionAddon {
  id: string;
  academy_id: string;
  addon_type: AddonType;
  display_name: string;
  price_monthly: number; // em centavos
  config: Record<string, unknown>;
  is_active: boolean;
  active_since: string;
  active_until: string | null;
  stripe_price_id: string | null;
  stripe_subscription_item_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionInvoice {
  id: string;
  academy_id: string;
  period_start: string;
  period_end: string;
  subscription_amount: number;
  setup_amount: number;
  overages_amount: number;
  addons_amount: number;
  discounts_amount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'void';
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  failed_at: string | null;
  refunded_at: string | null;
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
  valid_until: string | null;
  is_active: boolean;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// DTOs para APIs
// ============================================================
export interface StartTrialRequest {
  plan_id: string;
  academy_data: {
    name: string;
    email: string;
    cnpj: string;
    phone: string;
  };
  owner_profile_id: string;
  owner_name?: string;
  source?: string;
  referrer_academy_id?: string;
}

export interface StartTrialResponse {
  trial_id: string;
  academy_id: string;
  trial_ends_at: string;
  days_remaining: number;
  limitations: TrialLimitations;
}

export interface TrialLimitations {
  max_students: number;
  max_exports: number;
  api_calls_per_day: number;
  max_reports_per_day: number;
  max_storage_gb: number;
  white_label_enabled: boolean;
  store_enabled: boolean;
}

export interface TrialStatusResponse {
  is_active: boolean;
  days_remaining: number;
  trial_ends_at: string;
  plan_name: string;
  features_available: PlanFeatures;
  limitations: TrialLimitations;
  can_convert: boolean;
  alerts_sent: number[];
}

export interface ConvertTrialRequest {
  billing_cycle: BillingCycle;
  payment_method_id?: string;
  stripe_payment_method_id?: string;
}

export interface ConvertTrialResponse {
  subscription_id: string;
  first_charge_amount: number; // em centavos
  setup_charge: number; // em centavos (0 se grátis)
  invoice_url: string | null;
  status: SubscriptionStatus;
}

export interface SubscriptionResponse {
  subscription: AcademySubscription;
  plan: SubscriptionPlan;
  usage: {
    students: {
      current: number;
      limit: number | null;
      percentage: number;
    };
    quotas: UsageQuota[];
  };
  upcoming_invoice: {
    subscription_amount: number;
    setup_amount: number;
    addons_amount: number;
    overages_amount: number;
    discounts_amount: number;
    total_amount: number;
    period_start: string;
    period_end: string;
  } | null;
}

// ============================================================
// Constants
// ============================================================

// Preços dos planos (em centavos)
export const PLAN_PRICES: Record<PlanName, { monthly: number; annual: number; setup: number; trialDays: number }> = {
  Start: { monthly: 14900, annual: 149000, setup: 29700, trialDays: 14 },
  Medium: { monthly: 19900, annual: 199000, setup: 19700, trialDays: 14 },
  Pro: { monthly: 27900, annual: 279000, setup: 0, trialDays: 30 },
  Business: { monthly: 44900, annual: 449000, setup: 0, trialDays: 30 },
  Enterprise: { monthly: 69900, annual: 699000, setup: 0, trialDays: 60 },
  Custom: { monthly: 0, annual: 0, setup: 0, trialDays: 14 }
};

// Limites do trial (independente do plano selecionado)
export const TRIAL_LIMITS: TrialLimitations = {
  max_students: 50,
  max_exports: 100,
  api_calls_per_day: 100,
  max_reports_per_day: 3,
  max_storage_gb: 2,
  white_label_enabled: false,
  store_enabled: false
};

// Overages (preços em centavos)
export const OVERAGE_PRICES = {
  reports_pack_10: 3900, // R$ 39
  reports_single: 900,   // R$ 9
  deep_analytics: 8900,  // R$ 89/mês
  storage_10gb: 3900,    // R$ 39
  staff_user: 2900,      // R$ 29/mês
  api_10k: 2500,         // R$ 25
  history_24m: 4900,     // R$ 49/mês
  history_36m: 7900      // R$ 79/mês
};

// Add-ons (preços mensais em centavos)
export const ADDON_PRICES: Record<AddonType, number> = {
  white_label: 11900,        // R$ 119/mês
  store: 0,                  // 5% das vendas
  dedicated_support: 17900,  // R$ 179/mês
  marketing_automation: 4900, // R$ 49/mês
  financial_module: 5900     // R$ 59/mês
};

// Desconto anual
export const ANNUAL_DISCOUNT = 0.17; // 17% (2 meses grátis)

// Thresholds de alerta
export const ALERT_THRESHOLDS = {
  student_limit_warning: 80,   // Amarelo
  student_limit_critical: 95,  // Vermelho
  student_limit_auto_upgrade: 105 // Auto-upgrade
};

// Dias de alerta no trial
export const TRIAL_ALERT_DAYS = {
  first: 3,   // 3 dias antes do fim
  second: 1,  // 1 dia antes
  final: 0    // No dia
};

// Preservação de dados após trial
export const TRIAL_DATA_RETENTION_DAYS = 30;
