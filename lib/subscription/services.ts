// ============================================================
// Subscription Pricing System - Services
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type {
  AcademySubscription,
  SubscriptionPlan,
  UsageQuota,
  UsageAddon,
  StoreTransaction,
  PrepaidCredit,
  MetricType,
  AddonType,
  CreditType,
  BillingCycle,
} from './types';
import {
  ADDON_CONFIG,
  OVERAGE_RATES,
  STORE_CONFIG,
  PREPAID_DISCOUNT,
  AUTO_UPGRADE_THRESHOLD,
} from './types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================
// PlanManagementService
// ============================================================

export class PlanManagementService {
  /**
   * Get all available plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Get current subscription for an academy
   */
  async getSubscription(academyId: string): Promise<AcademySubscription | null> {
    const { data, error } = await supabase
      .from('academy_subscriptions')
      .select('*, plan:plan_id(*)')
      .eq('academy_id', academyId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Check if academy has reached student limit
   */
  async checkStudentLimit(academyId: string): Promise<{
    current: number;
    limit: number | null;
    percentage: number;
    exceeded: boolean;
    approaching: boolean;
  }> {
    const { data: subscription } = await supabase
      .from('academy_subscriptions')
      .select('*, plan:subscription_plans!plan_id(student_limit)')
      .eq('academy_id', academyId)
      .single();
    
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    // Get current active students count
    const { count: currentStudents } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('academia_id', academyId)
      .eq('status', 'ATIVO');

    const planData = subscription.plan as { student_limit: number | null } | null;
    const limit = planData?.student_limit ?? null;
    const current = currentStudents || 0;
    
    if (limit === null) {
      // Custom plan - unlimited
      return {
        current,
        limit: null,
        percentage: 0,
        exceeded: false,
        approaching: false
      };
    }

    const percentage = (current / limit) * 100;
    const exceeded = current > limit;
    const approaching = percentage >= 80;

    return {
      current,
      limit,
      percentage,
      exceeded,
      approaching
    };
  }

  /**
   * Check and trigger auto-upgrade if needed
   */
  async checkAndTriggerAutoUpgrade(academyId: string): Promise<{
    upgraded: boolean;
    previousPlan?: string;
    newPlan?: string;
  }> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription || !subscription.auto_upgrade_enabled) {
      return { upgraded: false };
    }

    const limitStatus = await this.checkStudentLimit(academyId);
    
    // Only auto-upgrade if exceeded 105%
    if (!limitStatus.exceeded || limitStatus.percentage < AUTO_UPGRADE_THRESHOLD * 100) {
      return { upgraded: false };
    }

    // Get next plan
    const { data: currentPlan } = await supabase
      .from('subscription_plans')
      .select('sort_order')
      .eq('id', subscription.plan_id)
      .single();

    if (!currentPlan) return { upgraded: false };

    const { data: nextPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .gt('sort_order', currentPlan.sort_order)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .limit(1)
      .single();

    if (!nextPlan) {
      // Already on highest plan or custom
      return { upgraded: false };
    }

    // Perform upgrade
    await this.upgradePlan(academyId, nextPlan.id, 'auto_limit');

    return {
      upgraded: true,
      previousPlan: subscription.plan?.name,
      newPlan: nextPlan.name
    };
  }

  /**
   * Upgrade plan
   */
  async upgradePlan(
    academyId: string, 
    targetPlanId: string, 
    reason: 'manual' | 'auto_limit' = 'manual'
  ): Promise<void> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    const { data: targetPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', targetPlanId)
      .single();

    if (!targetPlan) throw new Error('Target plan not found');

    // Record change
    await supabase.from('subscription_changes').insert({
      academy_id: academyId,
      previous_plan_id: subscription.plan_id,
      new_plan_id: targetPlanId,
      change_type: 'upgrade',
      reason,
      previous_price: subscription.plan?.base_price_monthly,
      new_price: targetPlan.base_price_monthly,
      effective_at: new Date().toISOString()
    });

    // Update subscription
    await supabase
      .from('academy_subscriptions')
      .update({
        plan_id: targetPlanId,
        student_limit_current: targetPlan.student_limit || subscription.student_limit_current,
        updated_at: new Date().toISOString()
      })
      .eq('academy_id', academyId);

    // Reinitialize quotas for new plan
    await QuotaTrackingService.initializeQuotas(academyId, targetPlanId);
  }

  /**
   * Request downgrade (effective at end of period)
   */
  async requestDowngrade(academyId: string, targetPlanId: string): Promise<void> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    const { data: targetPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', targetPlanId)
      .single();

    if (!targetPlan) throw new Error('Target plan not found');

    // Record change for end of period
    await supabase.from('subscription_changes').insert({
      academy_id: academyId,
      previous_plan_id: subscription.plan_id,
      new_plan_id: targetPlanId,
      change_type: 'downgrade',
      reason: 'manual',
      previous_price: subscription.plan?.base_price_monthly,
      new_price: targetPlan.base_price_monthly,
      effective_at: subscription.current_period_ends_at
    });
  }

  /**
   * Calculate prorated upgrade cost
   */
  async calculateProratedUpgrade(
    academyId: string,
    targetPlanId: string,
    billingCycle: BillingCycle
  ): Promise<{
    currentPlanPrice: number;
    newPlanPrice: number;
    proratedAmount: number;
    daysRemaining: number;
    daysInPeriod: number;
  }> {
    const subscription = await this.getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    const { data: targetPlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', targetPlanId)
      .single();

    if (!targetPlan) throw new Error('Target plan not found');

    const now = new Date();
    const periodEnd = new Date(subscription.current_period_ends_at);
    const periodStart = new Date(subscription.current_period_starts_at);
    
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / msPerDay);
    const daysInPeriod = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / msPerDay);

    const currentPlanPrice = billingCycle === 'annual' 
      ? (subscription.plan?.base_price_annual || 0) / 12
      : (subscription.plan?.base_price_monthly || 0);
    
    const newPlanPrice = billingCycle === 'annual'
      ? (targetPlan.base_price_annual / 12)
      : targetPlan.base_price_monthly;

    const priceDiff = newPlanPrice - currentPlanPrice;
    const proratedAmount = Math.max(0, (priceDiff / daysInPeriod) * daysRemaining);

    return {
      currentPlanPrice,
      newPlanPrice,
      proratedAmount: Math.round(proratedAmount * 100) / 100,
      daysRemaining,
      daysInPeriod
    };
  }
}

// ============================================================
// QuotaTrackingService
// ============================================================

export class QuotaTrackingService {
  /**
   * Initialize quotas for a new subscription
   */
  static async initializeQuotas(academyId: string, planId: string): Promise<void> {
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('default_quotas')
      .eq('id', planId)
      .single();

    if (!plan) throw new Error('Plan not found');

    const quotas = plan.default_quotas as Record<MetricType, number>;
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);

    const quotaRecords = Object.entries(quotas).map(([metricType, includedAmount]) => ({
      academy_id: academyId,
      metric_type: metricType as MetricType,
      included_amount: includedAmount,
      used_amount: 0,
      overage_amount: 0,
      overage_rate: OVERAGE_RATES[metricType as MetricType] || 0,
      overage_charges: 0,
      reset_date: resetDate.toISOString().split('T')[0]
    }));

    await supabase.from('usage_quotas').upsert(quotaRecords, {
      onConflict: 'academy_id,metric_type,reset_date'
    });
  }

  /**
   * Track usage for a metric
   */
  async trackUsage(
    academyId: string, 
    metricType: MetricType, 
    amount: number = 1
  ): Promise<{
    quota: UsageQuota;
    alertTriggered: 80 | 95 | 100 | null;
  }> {
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    const resetDateStr = resetDate.toISOString().split('T')[0];

    // Get or create quota
    let { data: quota } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId)
      .eq('metric_type', metricType)
      .eq('reset_date', resetDateStr)
      .single();

    if (!quota) {
      // Initialize if not exists
      await PlanManagementService.prototype.getSubscription(academyId).then(async (sub) => {
        if (sub) {
          await QuotaTrackingService.initializeQuotas(academyId, sub.plan_id);
        }
      });
      
      const { data: newQuota } = await supabase
        .from('usage_quotas')
        .select('*')
        .eq('academy_id', academyId)
        .eq('metric_type', metricType)
        .eq('reset_date', resetDateStr)
        .single();
      
      quota = newQuota;
    }

    if (!quota) throw new Error('Could not initialize quota');

    // Calculate new usage
    const newUsed = quota.used_amount + amount;
    const overage = Math.max(0, newUsed - quota.included_amount);
    const charges = overage * quota.overage_rate;

    // Check for alerts
    const percentage = (newUsed / quota.included_amount) * 100;
    let alertTriggered: 80 | 95 | 100 | null = null;

    if (percentage >= 100 && !quota.alert_100_sent_at) {
      alertTriggered = 100;
    } else if (percentage >= 95 && !quota.alert_95_sent_at) {
      alertTriggered = 95;
    } else if (percentage >= 80 && !quota.alert_80_sent_at) {
      alertTriggered = 80;
    }

    // Update quota
    const updateData: Record<string, unknown> = {
      used_amount: newUsed,
      overage_amount: overage,
      overage_charges: charges
    };

    if (alertTriggered === 80) updateData.alert_80_sent_at = new Date().toISOString();
    if (alertTriggered === 95) updateData.alert_95_sent_at = new Date().toISOString();
    if (alertTriggered === 100) updateData.alert_100_sent_at = new Date().toISOString();

    await supabase
      .from('usage_quotas')
      .update(updateData)
      .eq('id', quota.id);

    return {
      quota: { ...quota, used_amount: newUsed, overage_amount: overage, overage_charges: charges },
      alertTriggered
    };
  }

  /**
   * Get usage for academy
   */
  async getUsage(academyId: string): Promise<UsageQuota[]> {
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    const resetDateStr = resetDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId)
      .eq('reset_date', resetDateStr);

    if (error) throw error;
    return data || [];
  }

  /**
   * Forecast usage based on current trend
   */
  async forecastUsage(academyId: string): Promise<{
    metricType: MetricType;
    projected: number;
    confidence: number;
  }[]> {
    // Get last 3 months of usage
    const { data: historical } = await supabase
      .from('usage_quotas')
      .select('*')
      .eq('academy_id', academyId)
      .order('reset_date', { ascending: false })
      .limit(15); // 5 metrics x 3 months

    if (!historical || historical.length === 0) {
      // No history, return current usage as projection
      const current = await this.getUsage(academyId);
      return current.map(q => ({
        metricType: q.metric_type,
        projected: q.used_amount * 2, // Assume 2x by end of period
        confidence: 0.3
      }));
    }

    // Group by metric
    const byMetric: Record<string, UsageQuota[]> = {};
    historical.forEach(h => {
      if (!byMetric[h.metric_type]) byMetric[h.metric_type] = [];
      byMetric[h.metric_type].push(h);
    });

    return Object.entries(byMetric).map(([metricType, records]) => {
      const sorted = records.sort((a, b) => 
        new Date(a.reset_date).getTime() - new Date(b.reset_date).getTime()
      );
      
      // Simple linear trend
      const trend = sorted.length > 1
        ? (sorted[sorted.length - 1].used_amount - sorted[0].used_amount) / sorted.length
        : 0;
      
      const current = sorted[sorted.length - 1];
      const daysRemaining = 15; // Approximate mid-month
      const projected = current.used_amount + (trend * daysRemaining / 30);
      
      return {
        metricType: metricType as MetricType,
        projected: Math.max(current.used_amount, projected),
        confidence: sorted.length >= 3 ? 0.7 : 0.4
      };
    });
  }
}

// ============================================================
// OverageBillingService
// ============================================================

export class OverageBillingService {
  /**
   * Calculate overage charges for current period
   */
  async calculateOverages(academyId: string): Promise<{
    breakdown: Record<string, { included: number; used: number; overage: number; rate: number; charge: number }>;
    total: number;
  }> {
    const quotas = await new QuotaTrackingService().getUsage(academyId);
    
    const breakdown: Record<string, { included: number; used: number; overage: number; rate: number; charge: number }> = {};
    let total = 0;

    quotas.forEach(quota => {
      breakdown[quota.metric_type] = {
        included: quota.included_amount,
        used: quota.used_amount,
        overage: quota.overage_amount,
        rate: quota.overage_rate,
        charge: quota.overage_charges
      };
      total += quota.overage_charges;
    });

    return { breakdown, total };
  }

  /**
   * Apply prepaid credits to reduce overages
   */
  async applyPrepaidCredits(academyId: string): Promise<{
    creditsApplied: number;
    remainingOverage: number;
  }> {
    const { data: credits } = await supabase
      .from('prepaid_credits')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .gt('amount_remaining', 0);

    if (!credits || credits.length === 0) {
      return { creditsApplied: 0, remainingOverage: 0 };
    }

    const quotas = await new QuotaTrackingService().getUsage(academyId);
    let totalCreditsApplied = 0;

    for (const quota of quotas) {
      if (quota.overage_amount <= 0) continue;

      const relevantCredits = credits.filter(c => 
        c.credit_type === quota.metric_type && 
        c.amount_remaining > 0 &&
        (!c.valid_until || new Date(c.valid_until) > new Date())
      );

      let remainingOverage = quota.overage_amount;

      for (const credit of relevantCredits) {
        if (remainingOverage <= 0) break;

        const toApply = Math.min(remainingOverage, credit.amount_remaining);
        
        // Update credit
        await supabase
          .from('prepaid_credits')
          .update({
            amount_used: credit.amount_used + toApply,
            amount_remaining: credit.amount_remaining - toApply,
            updated_at: new Date().toISOString()
          })
          .eq('id', credit.id);

        totalCreditsApplied += toApply * credit.effective_rate;
        remainingOverage -= toApply;
      }

      // Update quota charges
      if (remainingOverage < quota.overage_amount) {
        const newCharges = remainingOverage * quota.overage_rate;
        await supabase
          .from('usage_quotas')
          .update({ overage_charges: newCharges })
          .eq('id', quota.id);
      }
    }

    const { total: remainingOverage } = await this.calculateOverages(academyId);
    
    return {
      creditsApplied: totalCreditsApplied,
      remainingOverage
    };
  }

  /**
   * Generate invoice for period
   */
  async generateInvoice(
    academyId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<string> {
    const subscription = await new PlanManagementService().getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    // Calculate amounts
    const subscriptionAmount = subscription.billing_cycle === 'annual'
      ? (subscription.plan?.base_price_annual || 0) / 12
      : (subscription.plan?.base_price_monthly || 0);

    const { breakdown, total: totalOverage } = await this.calculateOverages(academyId);

    // Get active addons
    const { data: addons } = await supabase
      .from('usage_addons')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true);

    const addonsAmount = addons?.reduce((sum, a) => sum + a.price, 0) || 0;

    // Apply prepaid credits
    const { creditsApplied } = await this.applyPrepaidCredits(academyId);

    const subtotal = subscriptionAmount + totalOverage + addonsAmount - creditsApplied;
    const total = Math.max(0, subtotal);

    // Create invoice
    const { data: invoice, error } = await supabase
      .from('overage_invoices')
      .insert({
        academy_id: academyId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        subscription_amount: subscriptionAmount,
        overages_breakdown: breakdown,
        total_overage: totalOverage,
        addons_amount: addonsAmount,
        discounts_amount: creditsApplied,
        subtotal,
        tax_amount: 0, // Calculate if needed
        total_amount: total,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return invoice.id;
  }
}

// ============================================================
// AddonManagementService
// ============================================================

export class AddonManagementService {
  /**
   * Get all available addons
   */
  async getAvailableAddons(): Promise<{
    addonType: AddonType;
    name: string;
    price: number;
    billingCycle: 'monthly' | 'annual' | 'one_time';
    description: string;
  }[]> {
    return Object.entries(ADDON_CONFIG).map(([type, config]) => ({
      addonType: type as AddonType,
      ...config
    }));
  }

  /**
   * Get active addons for academy
   */
  async getActiveAddons(academyId: string): Promise<UsageAddon[]> {
    const { data, error } = await supabase
      .from('usage_addons')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  }

  /**
   * Activate addon
   */
  async activateAddon(
    academyId: string,
    addonType: AddonType,
    metadata?: Record<string, unknown>
  ): Promise<UsageAddon> {
    const config = ADDON_CONFIG[addonType];
    if (!config) throw new Error('Invalid addon type');

    // Check if already active
    const { data: existing } = await supabase
      .from('usage_addons')
      .select('*')
      .eq('academy_id', academyId)
      .eq('addon_type', addonType)
      .eq('is_active', true)
      .single();

    if (existing) {
      throw new Error('Addon already active');
    }

    // Calculate prorated price if monthly
    let proratedPrice = config.price;
    if (config.billingCycle === 'monthly') {
      const subscription = await new PlanManagementService().getSubscription(academyId);
      if (subscription) {
        const periodEnd = new Date(subscription.current_period_ends_at);
        const now = new Date();
        const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysInMonth = 30;
        proratedPrice = Math.round((config.price / daysInMonth) * daysRemaining * 100) / 100;
      }
    }

    const { data, error } = await supabase
      .from('usage_addons')
      .insert({
        academy_id: academyId,
        addon_type: addonType,
        display_name: config.name,
        price: config.price,
        billing_cycle: config.billingCycle,
        is_active: true,
        active_since: new Date().toISOString(),
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deactivate addon
   */
  async deactivateAddon(academyId: string, addonType: AddonType): Promise<void> {
    await supabase
      .from('usage_addons')
      .update({
        is_active: false,
        active_until: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('academy_id', academyId)
      .eq('addon_type', addonType)
      .eq('is_active', true);
  }

  /**
   * Toggle addon (activate if inactive, deactivate if active)
   */
  async toggleAddon(
    academyId: string,
    addonType: AddonType,
    metadata?: Record<string, unknown>
  ): Promise<{ activated: boolean; addon?: UsageAddon }> {
    const activeAddons = await this.getActiveAddons(academyId);
    const isActive = activeAddons.some(a => a.addon_type === addonType);

    if (isActive) {
      await this.deactivateAddon(academyId, addonType);
      return { activated: false };
    } else {
      const addon = await this.activateAddon(academyId, addonType, metadata);
      return { activated: true, addon };
    }
  }
}

// ============================================================
// StoreRevenueService
// ============================================================

export class StoreRevenueService {
  /**
   * Record a store transaction
   */
  async recordTransaction(
    academyId: string,
    orderId: string,
    transactionAmount: number,
    metadata?: Record<string, unknown>
  ): Promise<StoreTransaction> {
    const platformFeeAmount = Math.round(
      (transactionAmount * STORE_CONFIG.platformFeePercent) / 100 * 100
    ) / 100;

    const netAmount = transactionAmount - platformFeeAmount;

    const { data, error } = await supabase
      .from('store_transactions')
      .insert({
        academy_id: academyId,
        order_id: orderId,
        transaction_amount: transactionAmount,
        platform_fee_percent: STORE_CONFIG.platformFeePercent,
        platform_fee_amount: platformFeeAmount,
        net_amount: netAmount,
        status: 'pending',
        transaction_date: new Date().toISOString().split('T')[0],
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Calculate minimum fee if applicable
   */
  async calculateMinimumFee(academyId: string, month: Date): Promise<{
    totalSales: number;
    commission: number;
    minimumFee: number;
    totalFee: number;
  }> {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const { data: transactions } = await supabase
      .from('store_transactions')
      .select('transaction_amount')
      .eq('academy_id', academyId)
      .gte('transaction_date', startOfMonth.toISOString().split('T')[0])
      .lte('transaction_date', endOfMonth.toISOString().split('T')[0])
      .in('status', ['pending', 'processed', 'paid_out']);

    const totalSales = transactions?.reduce((sum, t) => sum + t.transaction_amount, 0) || 0;
    const commission = Math.round((totalSales * STORE_CONFIG.platformFeePercent) / 100 * 100) / 100;
    const minimumFee = totalSales < STORE_CONFIG.minimumSalesThreshold ? STORE_CONFIG.minimumMonthlyFee : 0;
    const totalFee = commission + minimumFee;

    return {
      totalSales,
      commission,
      minimumFee,
      totalFee
    };
  }

  /**
   * Process transactions for payout
   */
  async processTransactions(
    academyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    processed: number;
    totalNetAmount: number;
  }> {
    const { data: transactions } = await supabase
      .from('store_transactions')
      .select('*')
      .eq('academy_id', academyId)
      .eq('status', 'pending')
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .lte('transaction_date', endDate.toISOString().split('T')[0]);

    if (!transactions || transactions.length === 0) {
      return { processed: 0, totalNetAmount: 0 };
    }

    const ids = transactions.map(t => t.id);
    const totalNetAmount = transactions.reduce((sum, t) => sum + t.net_amount, 0);

    await supabase
      .from('store_transactions')
      .update({
        status: 'processed',
        processed_at: new Date().toISOString()
      })
      .in('id', ids);

    return {
      processed: transactions.length,
      totalNetAmount
    };
  }

  /**
   * Get store revenue summary
   */
  async getRevenueSummary(
    academyId: string,
    months: number = 6
  ): Promise<{
    month: string;
    sales: number;
    commission: number;
    net: number;
  }[]> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: transactions } = await supabase
      .from('store_transactions')
      .select('*')
      .eq('academy_id', academyId)
      .gte('transaction_date', startDate.toISOString().split('T')[0])
      .in('status', ['processed', 'paid_out']);

    // Group by month
    const grouped: Record<string, { sales: number; commission: number; net: number }> = {};
    
    transactions?.forEach(t => {
      const month = t.transaction_date.substring(0, 7); // YYYY-MM
      if (!grouped[month]) {
        grouped[month] = { sales: 0, commission: 0, net: 0 };
      }
      grouped[month].sales += t.transaction_amount;
      grouped[month].commission += t.platform_fee_amount;
      grouped[month].net += t.net_amount;
    });

    return Object.entries(grouped)
      .map(([month, data]) => ({
        month,
        sales: Math.round(data.sales * 100) / 100,
        commission: Math.round(data.commission * 100) / 100,
        net: Math.round(data.net * 100) / 100
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }
}

// ============================================================
// PrepaidCreditsService
// ============================================================

export class PrepaidCreditsService {
  /**
   * Buy prepaid credits (with 20% discount)
   */
  async buyCredits(
    academyId: string,
    creditType: CreditType,
    amount: number
  ): Promise<PrepaidCredit> {
    const rate = OVERAGE_RATES[creditType];
    const discountedRate = rate * (1 - PREPAID_DISCOUNT);
    const price = Math.round(amount * discountedRate * 100) / 100;

    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1); // 1 year validity

    const { data, error } = await supabase
      .from('prepaid_credits')
      .insert({
        academy_id: academyId,
        credit_type: creditType,
        amount,
        amount_used: 0,
        amount_remaining: amount,
        price_paid: price,
        effective_rate: discountedRate,
        valid_until: validUntil.toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get active credits for academy
   */
  async getActiveCredits(academyId: string): Promise<PrepaidCredit[]> {
    const { data, error } = await supabase
      .from('prepaid_credits')
      .select('*')
      .eq('academy_id', academyId)
      .eq('is_active', true)
      .gt('amount_remaining', 0)
      .or('valid_until.is.null,valid_until.gt.now()');

    if (error) throw error;
    return data || [];
  }
}

// ============================================================
// BillingForecastService
// ============================================================

export class BillingForecastService {
  /**
   * Generate billing forecast
   */
  async generateForecast(academyId: string): Promise<{
    subscription: {
      plan: string;
      cycle: string;
      baseAmount: number;
    };
    addons: { type: string; name: string; price: number }[];
    usage: {
      type: string;
      included: number;
      projected: number;
      overageRate: number;
      projectedCharge: number;
    }[];
    projectedTotal: number;
  }> {
    const planService = new PlanManagementService();
    const addonService = new AddonManagementService();
    const quotaService = new QuotaTrackingService();

    const subscription = await planService.getSubscription(academyId);
    if (!subscription) throw new Error('Subscription not found');

    const baseAmount = subscription.billing_cycle === 'annual'
      ? (subscription.plan?.base_price_annual || 0) / 12
      : (subscription.plan?.base_price_monthly || 0);

    const activeAddons = await addonService.getActiveAddons(academyId);
    const quotas = await quotaService.getUsage(academyId);
    const forecast = await quotaService.forecastUsage(academyId);

    const usage = quotas.map(q => {
      const f = forecast.find(f => f.metricType === q.metric_type);
      const projected = f?.projected || q.used_amount * 2;
      const overage = Math.max(0, projected - q.included_amount);
      
      return {
        type: q.metric_type,
        included: q.included_amount,
        projected: Math.round(projected),
        overageRate: q.overage_rate,
        projectedCharge: Math.round(overage * q.overage_rate * 100) / 100
      };
    });

    const addonsTotal = activeAddons.reduce((sum, a) => sum + a.price, 0);
    const usageTotal = usage.reduce((sum, u) => sum + u.projectedCharge, 0);

    return {
      subscription: {
        plan: subscription.plan?.name || 'Unknown',
        cycle: subscription.billing_cycle,
        baseAmount: Math.round(baseAmount * 100) / 100
      },
      addons: activeAddons.map(a => ({
        type: a.addon_type,
        name: a.display_name,
        price: a.price
      })),
      usage,
      projectedTotal: Math.round((baseAmount + addonsTotal + usageTotal) * 100) / 100
    };
  }
}

// Export singleton instances
export const planManagement = new PlanManagementService();
export const quotaTracking = new QuotaTrackingService();
export const overageBilling = new OverageBillingService();
export const addonManagement = new AddonManagementService();
export const storeRevenue = new StoreRevenueService();
export const prepaidCredits = new PrepaidCreditsService();
export const billingForecast = new BillingForecastService();
