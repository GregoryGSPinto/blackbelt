// ============================================================
// BlackBelt Pricing v3.0 - Services
// ============================================================

import type {
  SubscriptionPlan,
  AcademySubscription,
  UsageQuota,
  SubscriptionAddon,
  MetricType,
  AddonType,
  StartTrialRequest,
  StartTrialResponse,
  TrialStatusResponse,
  ConvertTrialRequest,
  ConvertTrialResponse,
  PlanFeatures,
} from './types-v3';
import {
  TRIAL_LIMITS,
  ADDON_PRICES,
  ALERT_THRESHOLDS,
} from './types-v3';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseAdminClient()[prop as keyof ReturnType<typeof getSupabaseAdminClient>];
  },
});

// ============================================================
// TrialService
// ============================================================
export class TrialService {
  /**
   * Start a new trial
   */
  async startTrial(request: StartTrialRequest): Promise<StartTrialResponse> {
    const { plan_id, academy_data, source = 'website', referrer_academy_id } = request;

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (!plan) {
      throw new Error('Plan not found');
    }

    // Create academy first
    const { data: academy, error: academyError } = await supabase
      .from('academias')
      .insert({
        nome: academy_data.name,
        email: academy_data.email,
        cnpj: academy_data.cnpj,
        telefone: academy_data.phone,
        status: 'trial',
      })
      .select()
      .single();

    if (academyError) {
      throw new Error(`Failed to create academy: ${academyError.message}`);
    }

    // Calculate trial end date
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + plan.trial_days);

    // Create subscription (trialing status)
    const { error: subError } = await supabase
      .from('academy_subscriptions')
      .insert({
        academy_id: academy.id,
        plan_id: plan.id,
        status: 'trialing',
        billing_cycle: 'monthly',
        trial_starts_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        trial_converted: false,
        setup_paid: false,
        setup_amount: plan.setup_price,
        auto_upgrade_enabled: true,
        auto_renew: true,
      });

    if (subError) {
      throw new Error(`Failed to create subscription: ${subError.message}`);
    }

    // Create trial tracking record
    const { data: trialTracking } = await supabase
      .from('trial_tracking')
      .insert({
        academy_id: academy.id,
        trial_plan_id: plan.id,
        trial_plan_name: plan.name,
        trial_started_at: new Date().toISOString(),
        trial_ends_at: trialEndsAt.toISOString(),
        converted: false,
        setup_collected: false,
        setup_amount: plan.setup_price,
        alerts_sent: [],
        source,
        referrer_academy_id,
      })
      .select()
      .single();

    // Initialize usage quotas for trial (with trial limits)
    await this.initializeTrialQuotas(academy.id);

    // Calculate days remaining
    const daysRemaining = Math.ceil(
      (trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      trial_id: trialTracking.id,
      academy_id: academy.id,
      trial_ends_at: trialEndsAt.toISOString(),
      days_remaining: daysRemaining,
      limitations: TRIAL_LIMITS,
    };
  }

  /**
   * Get trial status
   */
  async getTrialStatus(academyId: string): Promise<TrialStatusResponse> {
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('academy_id', academyId)
      .single();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const isTrialing = subscription.status === 'trialing';
    const now = new Date();
    const trialEndsAt = subscription.trial_ends_at 
      ? new Date(subscription.trial_ends_at) 
      : now;
    
    const daysRemaining = isTrialing 
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const { data: trialTracking } = await supabase
      .from('trial_tracking')
      .select('*')
      .eq('academy_id', academyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      is_active: isTrialing && daysRemaining > 0,
      days_remaining: daysRemaining,
      trial_ends_at: trialEndsAt.toISOString(),
      plan_name: subscription.plan?.name || 'Unknown',
      features_available: subscription.plan?.features || {},
      limitations: TRIAL_LIMITS,
      can_convert: isTrialing || subscription.status === 'suspended',
      alerts_sent: trialTracking?.alerts_sent || [],
    };
  }

  /**
   * Convert trial to paid subscription
   */
  async convertTrial(
    academyId: string, 
    request: ConvertTrialRequest
  ): Promise<ConvertTrialResponse> {
    const { billing_cycle } = request;

    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('academy_id', academyId)
      .single();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    if (!['trialing', 'suspended'].includes(subscription.status)) {
      throw new Error('Trial already converted or not in convertible state');
    }

    const plan = subscription.plan as SubscriptionPlan;
    const isAnnual = billing_cycle === 'annual';
    
    // Calculate amounts
    const baseAmount = isAnnual ? plan.base_price_annual : plan.base_price_monthly;
    const setupAmount = isAnnual && plan.setup_price > 0 ? 0 : plan.setup_price; // Setup grátis no anual

    // Calculate period
    const periodStart = new Date();
    const periodEnd = new Date();
    if (isAnnual) {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Update subscription
    const { data: updatedSub } = await supabase
      .from('academy_subscriptions')
      .update({
        status: 'active',
        billing_cycle,
        trial_converted: true,
        trial_converted_at: new Date().toISOString(),
        setup_paid: true,
        setup_paid_at: new Date().toISOString(),
        current_period_starts_at: periodStart.toISOString(),
        current_period_ends_at: periodEnd.toISOString(),
      })
      .eq('academy_id', academyId)
      .select()
      .single();

    // Update trial tracking
    await supabase
      .from('trial_tracking')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        converted_plan_id: plan.id,
        converted_billing_cycle: billing_cycle,
        setup_collected: setupAmount > 0,
      })
      .eq('academy_id', academyId)
      .eq('converted', false);

    // Create invoice
    const { data: invoice } = await supabase
      .from('subscription_invoices')
      .insert({
        academy_id: academyId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        subscription_amount: baseAmount,
        setup_amount: setupAmount,
        overages_amount: 0,
        addons_amount: 0,
        discounts_amount: isAnnual ? Math.round(baseAmount * 0.17) : 0, // 17% discount
        subtotal: baseAmount + setupAmount,
        tax_amount: 0,
        total_amount: baseAmount + setupAmount,
        status: 'pending',
      })
      .select()
      .single();

    // Update academy status
    await supabase
      .from('academias')
      .update({ status: 'active' })
      .eq('id', academyId);

    return {
      subscription_id: updatedSub.id,
      first_charge_amount: baseAmount,
      setup_charge: setupAmount,
      invoice_url: `/billing/invoices/${invoice.id}`,
      status: 'active',
    };
  }

  /**
   * Extend trial (admin only)
   */
  async extendTrial(academyId: string, days: number, reason: string): Promise<void> {
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('*')
      .eq('academy_id', academyId)
      .single();

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const currentEnd = subscription.trial_ends_at 
      ? new Date(subscription.trial_ends_at)
      : new Date();
    
    const newEnd = new Date(currentEnd);
    newEnd.setDate(newEnd.getDate() + days);

    await supabase
      .from('academy_subscriptions')
      .update({
        trial_ends_at: newEnd.toISOString(),
        status: 'trialing',
      })
      .eq('academy_id', academyId);

    // Log extension in metadata
    await supabase
      .from('trial_tracking')
      .update({
        metadata: {
          extension: {
            days,
            reason,
            extended_at: new Date().toISOString(),
          },
        },
      })
      .eq('academy_id', academyId)
      .eq('converted', false);
  }

  /**
   * Check if CNPJ already had trial
   */
  async hasHadTrial(cnpj: string): Promise<boolean> {
    const { data: academies } = await supabase
      .from('academias')
      .select('id')
      .eq('cnpj', cnpj);

    if (!academies || academies.length === 0) {
      return false;
    }

    const academyIds = academies.map((a: any) => a.id);

    const { data: trials } = await supabase
      .from('trial_tracking')
      .select('id')
      .in('academy_id', academyIds)
      .limit(1);

    return (trials?.length || 0) > 0;
  }

  /**
   * Initialize trial quotas
   */
  private async initializeTrialQuotas(academyId: string): Promise<void> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    const quotas = [
      {
        academy_id: academyId,
        metric_type: 'reports' as MetricType,
        period_start: now.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        included_amount: TRIAL_LIMITS.max_reports_per_day * 30, // 90 reports/month
        used_amount: 0,
        overage_amount: 0,
        overage_charges: 0,
      },
      {
        academy_id: academyId,
        metric_type: 'storage' as MetricType,
        period_start: now.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        included_amount: TRIAL_LIMITS.max_storage_gb,
        used_amount: 0,
        overage_amount: 0,
        overage_charges: 0,
      },
      {
        academy_id: academyId,
        metric_type: 'api_calls' as MetricType,
        period_start: now.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        included_amount: TRIAL_LIMITS.api_calls_per_day * 30, // 3000 calls/month
        used_amount: 0,
        overage_amount: 0,
        overage_charges: 0,
      },
    ];

    await supabase.from('usage_quotas').insert(quotas);
  }
}

// ============================================================
// PlanService
// ============================================================
export class PlanService {
  /**
   * Get all public plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .eq('is_public', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get plan by ID
   */
  async getPlan(planId: string): Promise<SubscriptionPlan | null> {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    return data;
  }

  /**
   * Get subscription with plan
   */
  async getSubscription(academyId: string): Promise<AcademySubscription | null> {
    const { data } = await supabase
      .from('academy_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('academy_id', academyId)
      .single();

    return data;
  }

  /**
   * Check student limit
   */
  async checkStudentLimit(academyId: string): Promise<{
    current: number;
    limit: number | null;
    percentage: number;
    status: 'ok' | 'warning' | 'critical' | 'exceeded';
  }> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get active students count
    const { count } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('academia_id', academyId)
      .eq('status', 'ATIVO');

    const current = count || 0;
    
    // Trial limit is always 50
    if (subscription.status === 'trialing') {
      const limit = TRIAL_LIMITS.max_students;
      const percentage = (current / limit) * 100;
      return {
        current,
        limit,
        percentage: Math.round(percentage),
        status: percentage >= 100 ? 'exceeded' : percentage >= 95 ? 'critical' : percentage >= 80 ? 'warning' : 'ok',
      };
    }

    // Paid plan limit
    const planLimit = subscription.plan?.student_limit;
    if (planLimit === null || planLimit === undefined) {
      // Unlimited (Enterprise/Custom)
      return { current, limit: null, percentage: 0, status: 'ok' };
    }

    const percentage = (current / planLimit) * 100;
    let status: 'ok' | 'warning' | 'critical' | 'exceeded' = 'ok';
    
    if (percentage >= ALERT_THRESHOLDS.student_limit_auto_upgrade) {
      status = 'exceeded';
    } else if (percentage >= ALERT_THRESHOLDS.student_limit_critical) {
      status = 'critical';
    } else if (percentage >= ALERT_THRESHOLDS.student_limit_warning) {
      status = 'warning';
    }

    return {
      current,
      limit: planLimit,
      percentage: Math.round(percentage),
      status,
    };
  }

  /**
   * Upgrade plan
   */
  async upgradePlan(academyId: string, targetPlanId: string): Promise<void> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    const targetPlan = await this.getPlan(targetPlanId);
    if (!targetPlan) throw new Error('Target plan not found');

    // If in trial, just update the plan
    if (subscription.status === 'trialing') {
      await supabase
        .from('academy_subscriptions')
        .update({
          plan_id: targetPlanId,
          setup_amount: targetPlan.setup_price,
        })
        .eq('academy_id', academyId);

      await supabase
        .from('trial_tracking')
        .update({
          trial_plan_id: targetPlanId,
          trial_plan_name: targetPlan.name,
        })
        .eq('academy_id', academyId)
        .eq('converted', false);

      return;
    }

    // Paid upgrade - calculate prorated amount
    // TODO: Implement Stripe proration
    await supabase
      .from('academy_subscriptions')
      .update({
        plan_id: targetPlanId,
      })
      .eq('academy_id', academyId);
  }

  /**
   * Request downgrade (effective at next renewal)
   */
  async requestDowngrade(academyId: string, targetPlanId: string): Promise<void> {
    // Store downgrade request in metadata for processing at renewal
    await supabase
      .from('academy_subscriptions')
      .update({
        metadata: {
          scheduled_downgrade: {
            target_plan_id: targetPlanId,
            requested_at: new Date().toISOString(),
          },
        },
      })
      .eq('academy_id', academyId);
  }
}

// ============================================================
// UsageService
// ============================================================
export class UsageService {
  /**
   * Track usage
   */
  async trackUsage(
    academyId: string, 
    metricType: MetricType, 
    amount: number = 1
  ): Promise<{
    allowed: boolean;
    current: number;
    limit: number;
    remaining: number;
    message?: string;
  }> {
    // Get current period quota
    const now = new Date().toISOString().split('T')[0];
    const { data: quota } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId)
      .eq('metric_type', metricType)
      .lte('period_start', now)
      .gte('period_end', now)
      .single();

    if (!quota) {
      // No quota found - allow but log warning
      return { allowed: true, current: 0, limit: 0, remaining: 0 };
    }

    const newUsed = quota.used_amount + amount;
    const remaining = Math.max(0, quota.included_amount - newUsed);
    
    // Update usage
    await supabase
      .from('usage_quotas')
      .update({
        used_amount: newUsed,
        overage_amount: Math.max(0, newUsed - quota.included_amount),
      })
      .eq('id', quota.id);

    // Check if exceeded
    if (newUsed > quota.included_amount) {
      return {
        allowed: false,
        current: newUsed,
        limit: quota.included_amount,
        remaining: 0,
        message: `Limite de ${metricType} excedido. Compre créditos ou faça upgrade.`,
      };
    }

    return {
      allowed: true,
      current: newUsed,
      limit: quota.included_amount,
      remaining,
    };
  }

  /**
   * Get current quotas
   */
  async getQuotas(academyId: string): Promise<UsageQuota[]> {
    const now = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId)
      .lte('period_start', now)
      .gte('period_end', now);

    return data || [];
  }

  /**
   * Check if feature is available
   */
  async checkFeature(
    academyId: string, 
    feature: keyof PlanFeatures
  ): Promise<boolean> {
    const planService = new PlanService();
    const subscription = await planService.getSubscription(academyId);
    
    if (!subscription) return false;
    
    const features = subscription.plan?.features as PlanFeatures;
    if (!features) return false;

    return features[feature] === true;
  }
}

// ============================================================
// AddonService
// ============================================================
export class AddonService {
  /**
   * Get available addons
   */
  getAvailableAddons(): Array<{
    type: AddonType;
    name: string;
    price: number;
    description: string;
  }> {
    return [
      {
        type: 'white_label',
        name: 'White Label',
        price: ADDON_PRICES.white_label,
        description: 'Remova a marca BlackBelt e personalize com sua identidade',
      },
      {
        type: 'store',
        name: 'Loja Virtual',
        price: ADDON_PRICES.store,
        description: 'Venda produtos e serviços com 5% de taxa sobre vendas',
      },
      {
        type: 'dedicated_support',
        name: 'Suporte Dedicado',
        price: ADDON_PRICES.dedicated_support,
        description: 'Atendimento prioritário por telefone e chat',
      },
      {
        type: 'marketing_automation',
        name: 'Automação de Marketing',
        price: ADDON_PRICES.marketing_automation,
        description: 'Campanhas automáticas de email e SMS',
      },
      {
        type: 'financial_module',
        name: 'Módulo Financeiro',
        price: ADDON_PRICES.financial_module,
        description: 'Controle completo de receitas, despesas e fluxo de caixa',
      },
    ];
  }

  /**
   * Get active addons
   */
  async getActiveAddons(academyId: string): Promise<SubscriptionAddon[]> {
    const { data } = await supabase
      .from('subscription_addons')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true);

    return data || [];
  }

  /**
   * Toggle addon
   */
  async toggleAddon(academyId: string, addonType: AddonType, active: boolean): Promise<void> {
    if (active) {
      // Activate
      const addonInfo = this.getAvailableAddons().find(a => a.type === addonType);
      if (!addonInfo) throw new Error('Invalid addon type');

      await supabase
        .from('subscription_addons')
        .insert({
          academy_id: academyId,
          addon_type: addonType,
          display_name: addonInfo.name,
          price_monthly: addonInfo.price,
          is_active: true,
        });
    } else {
      // Deactivate
      await supabase
        .from('subscription_addons')
        .update({
          is_active: false,
          active_until: new Date().toISOString(),
        })
        .eq('academy_id', academyId)
        .eq('addon_type', addonType);
    }
  }
}

// ============================================================
// Exports
// ============================================================
export const trialService = new TrialService();
export const planService = new PlanService();
export const usageService = new UsageService();
export const addonService = new AddonService();
