'use client';

import { useState } from 'react';
import { PLANS, formatPrice, type PricingPlan } from '@/lib/payments/pricing';
import type { BillingMetric } from '@/lib/payments/billing-meter';
import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// BILLING DASHBOARD — Painel de cobranca para academy owner
// ════════════════════════════════════════════════════════════════════

interface BillingDashboardProps {
  currentPlan: PricingPlan | null;
  subscription: {
    status: string;
    currentPeriodEnd: string;
  } | null;
  invoices: Array<{
    id: string;
    amountCents: number;
    status: string;
    dueDate: string;
    paidAt: string | null;
  }>;
  usage: Record<BillingMetric, number>;
  onManageSubscription: () => void;
  onUpgrade: (planId: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-500/20 text-green-400',
  past_due: 'bg-yellow-500/20 text-yellow-400',
  canceled: 'bg-red-500/20 text-red-400',
  suspended: 'bg-gray-500/20 text-gray-400',
  paid: 'bg-green-500/20 text-green-400',
  pending: 'bg-yellow-500/20 text-yellow-400',
  overdue: 'bg-red-500/20 text-red-400',
};

const METRIC_KEYS: BillingMetric[] = ['active_members', 'checkins', 'storage_mb', 'api_calls', 'push_sent', 'video_minutes'];

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status] ?? 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

export default function BillingDashboard({
  currentPlan,
  subscription,
  invoices,
  usage,
  onManageSubscription,
  onUpgrade,
}: BillingDashboardProps) {
  const t = useTranslations('common');
  const tb = useTranslations('billing');
  const [showPlans, setShowPlans] = useState(false);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-dark-card rounded-xl p-6 border border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white mb-4">{tb('currentPlan')}</h2>
        {currentPlan ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-medium text-white">{currentPlan.name}</p>
              <p className="text-sm text-zinc-400">{currentPlan.description}</p>
              <p className="text-2xl font-medium text-white mt-2">
                {formatPrice(currentPlan.priceCents)}
                <span className="text-sm text-zinc-400 font-normal">{tb('perMonth')}</span>
              </p>
            </div>
            <div className="text-right">
              {subscription && (
                <>
                  <StatusBadge status={subscription.status} />
                  <p className="text-xs text-zinc-500 mt-2">
                    {tb('renewsOn', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() })}
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="text-zinc-400">{t('empty.noActivePlanBilling')}</p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onManageSubscription}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors"
          >
            {tb('manageSubscription')}
          </button>
          <button
            onClick={() => setShowPlans(!showPlans)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
          >
            {showPlans ? tb('hidePlans') : tb('showPlans')}
          </button>
        </div>
      </div>

      {/* Available Plans */}
      {showPlans && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.id}
              className={`bg-dark-card rounded-xl p-5 border ${
                currentPlan?.id === plan.id ? 'border-indigo-500' : 'border-white/[0.08]'
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-sm text-zinc-400 mt-1">{plan.description}</p>
              <p className="text-2xl font-medium text-white mt-3">
                {formatPrice(plan.priceCents)}
                <span className="text-sm text-zinc-400 font-normal">{tb('perMonth')}</span>
              </p>
              <ul className="mt-3 space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-zinc-300 flex items-center gap-1.5">
                    <span className="text-green-400">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              {currentPlan?.id !== plan.id && (
                <button
                  onClick={() => onUpgrade(plan.id)}
                  className="mt-4 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm transition-colors"
                >
                  {tb('choosePlan')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Usage Summary */}
      <div className="bg-dark-card rounded-xl p-6 border border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white mb-4">{tb('periodUsage')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {METRIC_KEYS.filter(m => usage[m] !== undefined).map((metric) => {
            const value = usage[metric];
            const limit = currentPlan?.limits[
              metric === 'checkins' ? 'checkinsPerMonth' :
              metric === 'active_members' ? 'activeMembers' :
              metric === 'storage_mb' ? 'storageMb' :
              metric === 'push_sent' ? 'pushPerMonth' :
              'activeMembers'
            ] ?? -1;
            const pct = limit > 0 ? Math.min(100, (value / limit) * 100) : 0;

            return (
              <div key={metric} className="space-y-1">
                <p className="text-sm text-zinc-400">{tb(`metrics.${metric}`)}</p>
                <p className="text-xl font-medium text-white">
                  {value.toLocaleString()}
                  {limit > 0 && (
                    <span className="text-sm text-zinc-500 font-normal">
                      {' '}/ {limit.toLocaleString()}
                    </span>
                  )}
                </p>
                {limit > 0 && (
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-dark-card rounded-xl p-6 border border-white/[0.08]">
        <h2 className="text-lg font-semibold text-white mb-4">{tb('invoiceHistory')}</h2>
        {invoices.length === 0 ? (
          <p className="text-zinc-400 text-sm">{t('empty.noInvoicesBilling')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 border-b border-white/[0.08]">
                  <th className="text-left py-2 font-medium">{tb('date')}</th>
                  <th className="text-left py-2 font-medium">{tb('amount')}</th>
                  <th className="text-left py-2 font-medium">Status</th>
                  <th className="text-left py-2 font-medium">{tb('paidOn')}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/[0.08]/50">
                    <td className="py-2 text-zinc-300">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-white font-medium">
                      {formatPrice(inv.amountCents)}
                    </td>
                    <td className="py-2">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="py-2 text-zinc-400">
                      {inv.paidAt
                        ? new Date(inv.paidAt).toLocaleDateString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
