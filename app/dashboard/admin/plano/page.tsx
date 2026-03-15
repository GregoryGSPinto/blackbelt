'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  ArrowUpRight, 

  Users, 
  BarChart3, 
  HardDrive, 
  Zap,
  Headphones,

  AlertTriangle,

  Loader2,
  Crown
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface Plan {
  id: string;
  name: string;
  display_name: string;
  student_limit: number | null;
  base_price_monthly: number;
  base_price_annual: number;
  setup_price: number;
  trial_days: number;
  is_public: boolean;
  features: {
    ml_level: string;
    reports_limit: number | null;
    storage_gb: number | null;
    staff_limit: number | null;
    api_limit: number | null;
    support_level: string;
    white_label: boolean;
    store_enabled: boolean;
    advanced_reports: boolean;
    priority_support: boolean;
  };
}

interface CurrentSubscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: 'monthly' | 'annual';
  current_period_ends_at: string;
  plan: Plan;
}

interface UsageData {
  students: { current: number; limit: number | null; percentage: number };
  quotas: Array<{
    metric_type: string;
    included_amount: number;
    used_amount: number;
    overage_amount: number;
  }>;
}

const PLAN_FEATURES = {
  ml_level: { label: 'Inteligência Artificial', icon: Zap },
  reports_limit: { label: 'Relatórios/mês', icon: BarChart3 },
  storage_gb: { label: 'Armazenamento', icon: HardDrive },
  staff_limit: { label: 'Usuários', icon: Users },
  api_limit: { label: 'API calls/mês', icon: Zap },
  support_level: { label: 'Suporte', icon: Headphones },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function formatNumber(num: number | null): string {
  if (num === null) return 'Ilimitado';
  return num.toLocaleString('pt-BR');
}

export default function AdminPlanoPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Load subscription
      const subResponse = await fetch('/api/subscription');
      
      if (subResponse.ok) {
        const subData = await subResponse.json();
        setCurrentSubscription(subData.subscription);
        setUsage(subData.usage);
        setSelectedCycle(subData.subscription.billing_cycle);
      }

      // Load all plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (plansData) {
        setPlans(plansData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(targetPlanId: string) {
    setUpgrading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_plan_id: targetPlanId,
          billing_cycle: selectedCycle
        })
      });

      if (response.ok) {
        await loadData();
        setShowUpgradeModal(false);
        setSelectedPlan(null);
        setFeedback({ type: 'success', message: 'Upgrade realizado com sucesso.' });
      } else {
        const error = await response.json();
        setFeedback({ type: 'error', message: error.error || 'Erro ao realizar upgrade.' });
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setFeedback({ type: 'error', message: 'Erro ao realizar upgrade.' });
    } finally {
      setUpgrading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const currentPlan = currentSubscription?.plan;
  const isAnnual = selectedCycle === 'annual';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Assinatura e plano</h1>
          <p className="text-slate-600">
            Acompanhe o plano atual, consumo da academia e próximos passos de cobrança
          </p>
        </div>

        {feedback && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Current Plan Card */}
        {currentPlan && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{currentPlan.display_name}</h2>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {currentSubscription?.status === 'active' ? 'Ativo' : 'Trial'}
                  </span>
                </div>
                <p className="text-slate-600">
                  Ciclo: {currentSubscription?.billing_cycle === 'annual' ? 'Anual' : 'Mensal'} • 
                  Renovação: {currentSubscription?.current_period_ends_at && 
                    new Date(currentSubscription.current_period_ends_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">
                  {formatCurrency(isAnnual ? currentPlan.base_price_annual : currentPlan.base_price_monthly)}
                </p>
                <p className="text-slate-500">{isAnnual ? '/ano' : '/mês'}</p>
              </div>
            </div>

            {/* Usage Bar */}
            {usage?.students && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    <span className="font-medium text-slate-700">Alunos ativos</span>
                  </div>
                  <span className={`font-semibold ${
                    usage.students.percentage >= 95 ? 'text-red-600' :
                    usage.students.percentage >= 80 ? 'text-amber-600' :
                    'text-emerald-600'
                  }`}>
                    {usage.students.current} / {usage.students.limit === null ? '∞' : usage.students.limit}
                  </span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      usage.students.percentage >= 95 ? 'bg-red-500' :
                      usage.students.percentage >= 80 ? 'bg-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(usage.students.percentage, 100)}%` }}
                  />
                </div>
                {usage.students.percentage >= 80 && (
                  <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Você está próximo do limite. Considere fazer upgrade.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {!currentPlan && (
          <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{t('empty.noActivePlan')}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Escolha um plano para concluir a configuração comercial da academia e liberar a cobrança controlada.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const firstPublicPlan = plans.find((plan) => plan.is_public) ?? null;
                  setSelectedPlan(firstPublicPlan);
                  setShowUpgradeModal(Boolean(firstPublicPlan));
                }}
                className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                Escolher primeiro plano
              </button>
            </div>
          </div>
        )}

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <span className={`text-sm font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
            Mensal
          </span>
          <button
            onClick={() => setSelectedCycle(isAnnual ? 'monthly' : 'annual')}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isAnnual ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
              isAnnual ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
            Anual
          </span>
          <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
            Economize 17%
          </span>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {plans.filter(p => p.is_public).map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id;
            const price = isAnnual ? plan.base_price_annual : plan.base_price_monthly;
            const monthlyEquivalent = isAnnual ? Math.round(plan.base_price_annual / 12) : plan.base_price_monthly;
            
            return (
              <motion.div
                key={plan.id}
                whileHover={!isCurrentPlan ? { y: -4 } : {}}
                className={`bg-white rounded-xl border-2 p-4 flex flex-col ${
                  isCurrentPlan 
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Plan Header */}
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-slate-900">{plan.display_name}</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-slate-900">
                      {formatCurrency(monthlyEquivalent)}
                    </span>
                    <span className="text-slate-500 text-sm">/mês</span>
                  </div>
                  {isAnnual && (
                    <p className="text-xs text-emerald-600 mt-1">
                      {formatCurrency(plan.base_price_annual)}/ano
                    </p>
                  )}
                </div>

                {/* Setup Badge */}
                {plan.setup_price > 0 ? (
                  <div className="text-center mb-4">
                    <span className="text-xs text-slate-500">
                      Setup: {formatCurrency(plan.setup_price)}
                    </span>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <span className="text-xs text-emerald-600 font-medium">
                      Setup grátis
                    </span>
                  </div>
                )}

                {/* Features */}
                <div className="flex-1 space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{plan.student_limit === null ? 'Ilimitados' : `Até ${plan.student_limit} alunos`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span>{plan.features.reports_limit === null ? 'Relatórios ilimitados' : `${plan.features.reports_limit} relatórios/mês`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HardDrive className="w-4 h-4 text-slate-400" />
                    <span>{plan.features.storage_gb === null ? 'Storage ilimitado' : `${plan.features.storage_gb}GB storage`}</span>
                  </div>
                </div>

                {/* Action Button */}
                {isCurrentPlan ? (
                  <button 
                    disabled
                    className="w-full py-2 bg-emerald-100 text-emerald-700 rounded-lg font-medium flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Seu plano
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan);
                      setShowUpgradeModal(true);
                    }}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    Escolher
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Comparison */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">Comparativo Completo</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-4 font-medium text-slate-700">Recurso</th>
                  {plans.filter(p => p.is_public).map(plan => (
                    <th key={plan.id} className={`p-4 text-center font-medium ${
                      currentPlan?.id === plan.id ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                    }`}>
                      {plan.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-4 text-slate-600">Alunos</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.student_limit === null ? 'Ilimitado' : plan.student_limit}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Relatórios/mês</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.reports_limit === null ? 'Ilimitado' : plan.features.reports_limit}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Storage</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.storage_gb === null ? 'Ilimitado' : `${plan.features.storage_gb}GB`}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Usuários</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.staff_limit === null ? 'Ilimitado' : plan.features.staff_limit}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">API calls/mês</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.api_limit === null ? 'Ilimitado' : formatNumber(plan.features.api_limit)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Inteligência AI</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.ml_level === 'full' ? '7 engines' : 'Churn only'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Suporte</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.support_level === 'email' && 'Email'}
                      {plan.features.support_level === 'chat' && 'Chat'}
                      {plan.features.support_level === 'priority' && 'Prioritário'}
                      {plan.features.support_level === 'dedicated' && 'Dedicado'}
                      {plan.features.support_level === 'dedicated_sla' && 'Dedicado + SLA'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">White Label</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.white_label ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-slate-600">Loja Virtual</td>
                  {plans.filter(p => p.is_public).map(plan => (
                    <td key={plan.id} className={`p-4 text-center ${
                      currentPlan?.id === plan.id ? 'bg-emerald-50/30' : ''
                    }`}>
                      {plan.features.store_enabled ? (
                        <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Custom Plan CTA */}
        <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-amber-400" />
          <h2 className="text-2xl font-bold mb-2">Precisa de operacao maior?</h2>
          <p className="text-slate-300 mb-6 max-w-xl mx-auto">
            Para academias com mais de 500 alunos ou necessidades especificas,
            temos planos personalizados com migracao assistida e configuracao comercial dedicada.
          </p>
          <button className="bg-white text-slate-900 px-8 py-3 rounded-lg font-semibold hover:bg-slate-100 transition-colors">
            Falar com vendas
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                Confirmar Upgrade
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Plano atual</span>
                  <span className="font-medium">{currentPlan?.display_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Novo plano</span>
                  <span className="font-medium text-emerald-600">{selectedPlan.display_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Ciclo</span>
                  <span className="font-medium">{isAnnual ? 'Anual' : 'Mensal'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-900 font-medium">Nova mensalidade</span>
                  <span className="text-xl font-bold text-slate-900">
                    {formatCurrency(isAnnual ? Math.round(selectedPlan.base_price_annual / 12) : selectedPlan.base_price_monthly)}
                  </span>
                </div>
                
                {selectedPlan.setup_price > 0 && !isAnnual && (
                  <div className="flex justify-between items-center py-2 text-amber-600">
                    <span>Setup (cobrado na próxima fatura)</span>
                    <span>{formatCurrency(selectedPlan.setup_price)}</span>
                  </div>
                )}
                
                {isAnnual && selectedPlan.setup_price > 0 && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                    Setup grátis no plano anual! Você economiza {formatCurrency(selectedPlan.setup_price)}.
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpgrade(selectedPlan.id)}
                  disabled={upgrading}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  {upgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Confirmar
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
