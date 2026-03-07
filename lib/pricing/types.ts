// ============================================================
// Pricing System Types
// ============================================================

export type PlanName = 'start' | 'medium' | 'pro' | 'business' | 'enterprise' | 'custom';
export type ConfigType = 'monthly' | 'annual' | 'setup' | 'trial' | 'overage' | 'addon';

export interface PricingConfig {
  id: string;
  config_key: string;
  config_value: number;
  config_type: ConfigType;
  plan_name: PlanName | null;
  display_name: string;
  description: string | null;
  is_active: boolean;
  effective_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingHistory {
  id: string;
  config_key: string;
  old_value: number;
  new_value: number;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
}

// Estrutura formatada de preços por plano
export interface PlanPricing {
  monthly: number;
  annual: number;
  setup: number;
  trial: number;
}

export type PricingByPlan = Record<PlanName, PlanPricing>;

// Overages
export interface OveragePricing {
  reports_pack: number;
  reports_single: number;
  bi: number;
  storage: number;
  user: number;
  api: number;
  history_24: number;
  history_36: number;
}

// Add-ons
export interface AddonPricing {
  whitelabel: number;
  support: number;
  marketing: number;
  financial: number;
}

// Resposta completa da API
export interface PricingResponse {
  start: PlanPricing;
  medium: PlanPricing;
  pro: PlanPricing;
  business: PlanPricing;
  enterprise: PlanPricing;
  custom?: PlanPricing;
  overages: OveragePricing;
  addons: AddonPricing;
}

// DTOs para APIs
export interface UpdatePricingRequest {
  config_key: string;
  new_value: number;
  reason?: string;
}

export interface UpdatePricingResponse {
  success: boolean;
  data?: PricingConfig;
  error?: string;
}

// Academy data for super admin
export interface AcademyWithSubscription {
  id: string;
  academy_id: string;
  plan_id: string;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'suspended';
  billing_cycle: 'monthly' | 'annual';
  trial_ends_at: string | null;
  current_period_ends_at: string | null;
  student_count: number;
  plan_limit: number;
  academy: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    owner_email?: string;
  };
  plan?: {
    id: string;
    name: string;
    display_name: string;
  };
}

// Realtime payload
export interface PricingRealtimePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: PricingConfig | null;
  old: PricingConfig | null;
}

// Constantes
export const PLAN_NAMES: PlanName[] = ['start', 'medium', 'pro', 'business', 'enterprise', 'custom'];

export const PLAN_DISPLAY_NAMES: Record<PlanName, string> = {
  start: 'Start',
  medium: 'Medium', 
  pro: 'Pro',
  business: 'Business',
  enterprise: 'Enterprise',
  custom: 'Custom'
};

// Helper para formatar centavos em reais
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// Helper para formatar config em estrutura de plano
export function formatPricingConfig(configs: PricingConfig[]): PricingResponse {
  const result: Partial<PricingResponse> = {};

  // Inicializar planos
  PLAN_NAMES.forEach(plan => {
    result[plan] = {
      monthly: 0,
      annual: 0,
      setup: 0,
      trial: 0
    };
  });

  // Preencher valores
  configs.forEach(config => {
    const { config_key, config_value, config_type, plan_name } = config;

    if (plan_name && PLAN_NAMES.includes(plan_name)) {
      const plan = result[plan_name]!;
      if (config_type === 'monthly') plan.monthly = config_value;
      if (config_type === 'annual') plan.annual = config_value;
      if (config_type === 'setup') plan.setup = config_value;
      if (config_type === 'trial') plan.trial = config_value;
    }

    // Overages
    if (config_type === 'overage') {
      if (!result.overages) result.overages = {} as OveragePricing;
      if (config_key === 'overage_reports_pack') result.overages.reports_pack = config_value;
      if (config_key === 'overage_reports_single') result.overages.reports_single = config_value;
      if (config_key === 'overage_bi') result.overages.bi = config_value;
      if (config_key === 'overage_storage') result.overages.storage = config_value;
      if (config_key === 'overage_user') result.overages.user = config_value;
      if (config_key === 'overage_api') result.overages.api = config_value;
      if (config_key === 'overage_history_24') result.overages.history_24 = config_value;
      if (config_key === 'overage_history_36') result.overages.history_36 = config_value;
    }

    // Add-ons
    if (config_type === 'addon') {
      if (!result.addons) result.addons = {} as AddonPricing;
      if (config_key === 'addon_whitelabel') result.addons.whitelabel = config_value;
      if (config_key === 'addon_support') result.addons.support = config_value;
      if (config_key === 'addon_marketing') result.addons.marketing = config_value;
      if (config_key === 'addon_financial') result.addons.financial = config_value;
    }
  });

  return result as PricingResponse;
}
