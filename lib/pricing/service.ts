// ============================================================
// Pricing Service
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { 
  PricingConfig, 
  PricingHistory, 
  PricingResponse,
  AcademyWithSubscription
} from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class PricingService {
  /**
   * Get all active pricing configs
   */
  async getCurrentPricing(): Promise<PricingConfig[]> {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('is_active', true)
      .order('plan_name', { ascending: true })
      .order('config_type', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get formatted pricing response
   */
  async getFormattedPricing(): Promise<PricingResponse> {
    const configs = await this.getCurrentPricing();
    
    const result: Partial<PricingResponse> = {};

    // Initialize plans
    ['start', 'medium', 'pro', 'business', 'enterprise'].forEach(plan => {
      result[plan as keyof PricingResponse] = {
        monthly: 0,
        annual: 0,
        setup: 0,
        trial: 0
      } as any;
    });

    // Fill values
    configs.forEach(config => {
      const { config_key, config_value, config_type, plan_name } = config;

      if (plan_name && ['start', 'medium', 'pro', 'business', 'enterprise'].includes(plan_name)) {
        const plan = result[plan_name as keyof PricingResponse] as any;
        if (config_type === 'monthly') plan.monthly = config_value;
        if (config_type === 'annual') plan.annual = config_value;
        if (config_type === 'setup') plan.setup = config_value;
        if (config_type === 'trial') plan.trial = config_value;
      }

      // Overages
      if (config_type === 'overage') {
        if (!result.overages) result.overages = {} as any;
        const overages = result.overages as any;
        if (config_key === 'overage_reports_pack') overages.reports_pack = config_value;
        if (config_key === 'overage_reports_single') overages.reports_single = config_value;
        if (config_key === 'overage_bi') overages.bi = config_value;
        if (config_key === 'overage_storage') overages.storage = config_value;
        if (config_key === 'overage_user') overages.user = config_value;
        if (config_key === 'overage_api') overages.api = config_value;
        if (config_key === 'overage_history_24') overages.history_24 = config_value;
        if (config_key === 'overage_history_36') overages.history_36 = config_value;
      }

      // Add-ons
      if (config_type === 'addon') {
        if (!result.addons) result.addons = {} as any;
        const addons = result.addons as any;
        if (config_key === 'addon_whitelabel') addons.whitelabel = config_value;
        if (config_key === 'addon_support') addons.support = config_value;
        if (config_key === 'addon_marketing') addons.marketing = config_value;
        if (config_key === 'addon_financial') addons.financial = config_value;
      }
    });

    return result as PricingResponse;
  }

  /**
   * Update a pricing config
   */
  async updatePricing(
    configKey: string, 
    newValue: number, 
    userId: string,
    reason?: string
  ): Promise<PricingConfig> {
    const { data, error } = await supabase
      .from('pricing_config')
      .update({
        config_value: newValue,
        created_by: userId,
        updated_at: new Date().toISOString()
      })
      .eq('config_key', configKey)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get pricing history
   */
  async getPricingHistory(limit: number = 50): Promise<PricingHistory[]> {
    const { data, error } = await supabase
      .from('pricing_history')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get single pricing config by key
   */
  async getConfigByKey(configKey: string): Promise<PricingConfig | null> {
    const { data, error } = await supabase
      .from('pricing_config')
      .select('*')
      .eq('config_key', configKey)
      .single();

    if (error) return null;
    return data;
  }

  /**
   * Get academies with subscriptions
   */
  async getAcademies(filters?: {
    plan?: string;
    status?: string;
    search?: string;
  }): Promise<AcademyWithSubscription[]> {
    let query = supabase
      .from('academy_subscriptions')
      .select(`
        *,
        academy:academias(id, nome, email, telefone),
        plan:subscription_plans(id, name, display_name)
      `)
      .order('created_at', { ascending: false });

    if (filters?.plan) {
      query = query.eq('plan_id', filters.plan);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      // Search requires joining with academias, simplified here
      query = query.ilike('academy.nome', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform data to match interface
    return (data || []).map((item: any) => ({
      id: item.id,
      academy_id: item.academy_id,
      plan_id: item.plan_id,
      status: item.status,
      billing_cycle: item.billing_cycle,
      trial_ends_at: item.trial_ends_at,
      current_period_ends_at: item.current_period_ends_at,
      student_count: item.academy?.student_count || 0,
      plan_limit: item.plan?.student_limit || 0,
      academy: {
        id: item.academy?.id,
        name: item.academy?.nome,
        email: item.academy?.email,
        phone: item.academy?.telefone
      },
      plan: item.plan
    }));
  }

  /**
   * Change academy plan
   */
  async changeAcademyPlan(
    academyId: string,
    newPlanId: string,
    effectiveDate?: string
  ): Promise<void> {
    const updateData: any = { plan_id: newPlanId };
    
    if (effectiveDate) {
      updateData.current_period_ends_at = effectiveDate;
    }

    const { error } = await supabase
      .from('academy_subscriptions')
      .update(updateData)
      .eq('academy_id', academyId);

    if (error) throw error;
  }
}

// Singleton instance
export const pricingService = new PricingService();
