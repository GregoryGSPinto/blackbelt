'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, 
  Users, 
  TrendingUp, 
  Search,
  Edit2,
  RefreshCw,
  Crown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CreditCard,
  Building2,
  Plus
} from 'lucide-react';
import type { PricingResponse, AcademyWithSubscription } from '@/lib/pricing/types';
import { PLAN_DISPLAY_NAMES, formatCurrency } from '@/lib/pricing/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTranslations } from 'next-intl';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const supabase = new Proxy({} as any, {
  get(_target, prop) {
    return getSupabaseBrowserClient()[prop as keyof ReturnType<typeof getSupabaseBrowserClient>];
  },
});

const PLAN_NAMES = ['start', 'medium', 'pro', 'business', 'enterprise'] as const;

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  active: 'success',
  trialing: 'warning',
  past_due: 'error',
  canceled: 'default',
  suspended: 'error',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Ativa',
  trialing: 'Trial',
  past_due: 'Inadimplente',
  canceled: 'Cancelada',
  suspended: 'Suspensa',
};

export default function SuperAdminAcademiesPage() {
  const t = useTranslations('superAdmin.academies');
  const tc = useTranslations('common');
  const [pricing, setPricing] = useState<PricingResponse | null>(null);
  const [academies, setAcademies] = useState<AcademyWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [showPricingEditor, setShowPricingEditor] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedPlan]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('pricing_updates')
      .on('broadcast', { event: 'price_change' }, () => {
        fetchPricing();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    await Promise.all([fetchPricing(), fetchAcademies()]);
    setLoading(false);
  }

  async function fetchPricing() {
    try {
      const res = await fetch('/api/pricing/current');
      if (res.ok) {
        const data = await res.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
    }
  }

  async function fetchAcademies() {
    try {
      const params = selectedPlan !== 'all' ? `?plan=${selectedPlan}` : '';
      const res = await fetch(`/api/super-admin/academies${params}`);
      if (res.ok) {
        const { data } = await res.json();
        setAcademies(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch academies:', error);
    }
  }

  async function updatePrice(configKey: string) {
    if (!editValue) return;
    
    setUpdating(true);
    try {
      const newValue = Math.round(parseFloat(editValue) * 100); // Convert to cents
      
      const res = await fetch('/api/admin/pricing/update', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          config_key: configKey, 
          new_value: newValue,
          reason: 'Atualização via Super Admin'
        })
      });

      if (res.ok) {
        await fetchPricing();
        setEditingPrice(null);
      }
    } catch (error) {
      console.error('Failed to update price:', error);
    } finally {
      setUpdating(false);
    }
  }

  function startEditing(configKey: string, currentValue: number) {
    setEditingPrice(configKey);
    setEditValue((currentValue / 100).toFixed(2));
  }

  // Stats
  const totalAcademies = academies.length;
  const academiesByPlan = PLAN_NAMES.reduce((acc, plan) => {
    acc[plan] = academies.filter(a => a.plan?.name?.toLowerCase() === plan).length;
    return acc;
  }, {} as Record<string, number>);

  const activeAcademies = academies.filter(a => a.status === 'active').length;
  const trialAcademies = academies.filter(a => a.status === 'trialing').length;

  // MRR calculation
  const mrr = academies.reduce((sum, a) => {
    if (a.status !== 'active') return sum;
    const planName = a.plan?.name?.toLowerCase();
    const planPricing = pricing?.[planName as keyof PricingResponse];
    if (!planPricing || !('monthly' in planPricing)) return sum;
    return sum + (a.billing_cycle === 'annual' ? planPricing.annual / 12 : planPricing.monthly);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Crown className="w-6 h-6 text-gold-500" />
            {t('title') || 'Gestão de Academias'}
          </h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            Gerencie preços, planos e academias em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={fetchData}>
            Atualizar
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Nova Academia
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total Academias</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{totalAcademies}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <Badge variant="success">{activeAcademies} ativas</Badge>
            <Badge variant="warning">{trialAcademies} trial</Badge>
          </div>
        </div>

        <div className="premium-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">MRR Estimado</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(mrr)}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            Receita mensal recorrente
          </div>
        </div>

        <div className="premium-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Ticket Médio</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">
                {formatCurrency(activeAcademies > 0 ? mrr / activeAcademies : 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            Por academia ativa
          </div>
        </div>

        <div className="premium-card rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Planos Ativos</p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{Object.values(academiesByPlan).filter(c => c > 0).length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gold-500" />
            </div>
          </div>
          <div className="mt-2 text-xs text-[var(--text-secondary)]">
            De 5 planos disponíveis
          </div>
        </div>
      </div>

      {/* Pricing Editor */}
      <div className="premium-card rounded-xl overflow-hidden">
        <div 
          className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--bg-secondary)] transition-colors"
          onClick={() => setShowPricingEditor(!showPricingEditor)}
        >
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tabela de Preços</h2>
            <p className="text-sm text-[var(--text-secondary)]">Edite os valores em tempo real (clique para editar)</p>
          </div>
          <button className="text-[var(--text-secondary)]">
            {showPricingEditor ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {showPricingEditor && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 overflow-x-auto border-t border-[var(--border)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-3 font-medium text-[var(--text-primary)]">Plano</th>
                      <th className="text-right p-3 font-medium text-[var(--text-primary)]">Mensal</th>
                      <th className="text-right p-3 font-medium text-[var(--text-primary)]">Anual</th>
                      <th className="text-right p-3 font-medium text-[var(--text-primary)]">Setup</th>
                      <th className="text-center p-3 font-medium text-[var(--text-primary)]">Trial</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_NAMES.map(plan => {
                      const planData = pricing?.[plan];
                      if (!planData) return null;

                      return (
                        <tr key={plan} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-secondary)]">
                          <td className="p-3">
                            <span className="font-medium text-[var(--text-primary)]">{PLAN_DISPLAY_NAMES[plan as keyof typeof PLAN_DISPLAY_NAMES]}</span>
                          </td>
                          <td className="p-3 text-right">
                            {editingPrice === `${plan}_monthly` ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-[var(--text-secondary)]">R$</span>
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePrice(`${plan}_monthly`)}
                                  onKeyDown={(e) => e.key === 'Enter' && updatePrice(`${plan}_monthly`)}
                                  className="w-24 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-right text-[var(--text-primary)]"
                                  autoFocus
                                  step="0.01"
                                />
                                {updating && <RefreshCw className="w-4 h-4 animate-spin text-gold-500" />}
                              </div>
                            ) : (
                              <span 
                                onClick={() => startEditing(`${plan}_monthly`, planData.monthly)}
                                className="cursor-pointer hover:bg-[var(--bg-secondary)] px-2 py-1 rounded inline-block text-[var(--text-primary)]"
                              >
                                {formatCurrency(planData.monthly)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {editingPrice === `${plan}_annual` ? (
                              <div className="flex items-center justify-end gap-2">
                                <span className="text-[var(--text-secondary)]">R$</span>
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePrice(`${plan}_annual`)}
                                  onKeyDown={(e) => e.key === 'Enter' && updatePrice(`${plan}_annual`)}
                                  className="w-24 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-right text-[var(--text-primary)]"
                                  autoFocus
                                  step="0.01"
                                />
                              </div>
                            ) : (
                              <span 
                                onClick={() => startEditing(`${plan}_annual`, planData.annual)}
                                className="cursor-pointer hover:bg-[var(--bg-secondary)] px-2 py-1 rounded inline-block text-[var(--text-primary)]"
                              >
                                {formatCurrency(planData.annual)}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {planData.setup > 0 ? (
                              <span 
                                onClick={() => startEditing(`${plan}_setup`, planData.setup)}
                                className="cursor-pointer hover:bg-[var(--bg-secondary)] px-2 py-1 rounded inline-block text-[var(--text-primary)]"
                              >
                                {formatCurrency(planData.setup)}
                              </span>
                            ) : (
                              <span className="text-[var(--text-secondary)]">Grátis</span>
                            )}
                          </td>
                          <td className="p-3 text-center text-[var(--text-primary)]">{planData.trial} dias</td>
                          <td className="p-3">
                            <button 
                              onClick={() => startEditing(`${plan}_monthly`, planData.monthly)}
                              className="p-1.5 rounded-lg bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Overages Section */}
              <div className="px-4 pb-4 border-t border-[var(--border)]">
                <h3 className="font-medium text-[var(--text-primary)] mb-3 mt-4">Overages e Add-ons</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pricing?.overages && Object.entries(pricing.overages).map(([key, value]) => (
                    <div key={key} className="bg-[var(--bg-secondary)] p-3 rounded-xl">
                      <p className="text-xs text-[var(--text-secondary)] capitalize">{key.replace('_', ' ')}</p>
                      <p className="font-medium text-[var(--text-primary)]">{formatCurrency(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-5 gap-3">
        {PLAN_NAMES.map(plan => {
          const count = academiesByPlan[plan] || 0;
          const percentage = totalAcademies > 0 ? (count / totalAcademies) * 100 : 0;
          const isSelected = selectedPlan === plan;

          return (
            <button
              key={plan}
              onClick={() => setSelectedPlan(isSelected ? 'all' : plan)}
              className={`p-4 rounded-xl text-left transition-all ${
                isSelected 
                  ? 'bg-gold-500 text-white shadow-lg scale-105' 
                  : 'bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border)] hover:shadow-md'
              }`}
            >
              <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-[var(--text-secondary)]'}`}>
                {PLAN_DISPLAY_NAMES[plan as keyof typeof PLAN_DISPLAY_NAMES]}
              </p>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <p className={`text-xs mt-1 ${isSelected ? 'text-white/60' : 'text-[var(--text-secondary)]'}`}>
                {percentage.toFixed(0)}% do total
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant={selectedPlan === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setSelectedPlan('all')}
        >
          Todas ({totalAcademies})
        </Button>
        {PLAN_NAMES.map(plan => (
          <Button
            key={plan}
            variant={selectedPlan === plan ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedPlan(plan)}
          >
            {PLAN_DISPLAY_NAMES[plan as keyof typeof PLAN_DISPLAY_NAMES]} ({academiesByPlan[plan] || 0})
          </Button>
        ))}

        <div className="flex-1" />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={tc('actions.searchAcademyPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl w-64 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          />
        </div>
      </div>

      {/* Academies Table */}
      <div className="premium-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left p-4 font-medium text-[var(--text-primary)]">Academia</th>
              <th className="text-center p-4 font-medium text-[var(--text-primary)]">Plano</th>
              <th className="text-center p-4 font-medium text-[var(--text-primary)]">Alunos</th>
              <th className="text-center p-4 font-medium text-[var(--text-primary)]">Status</th>
              <th className="text-right p-4 font-medium text-[var(--text-primary)]">Mensalidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {academies
              .filter(a => 
                searchQuery === '' || 
                a.academy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(academy => {
                const planName = academy.plan?.name?.toLowerCase();
                const planPricing = pricing?.[planName as keyof PricingResponse];
                const monthlyValue = planPricing && 'monthly' in planPricing
                  ? (academy.billing_cycle === 'annual' ? planPricing.annual / 12 : planPricing.monthly)
                  : 0;
                const usagePercent = academy.plan_limit && academy.plan_limit > 0 
                  ? (academy.student_count / academy.plan_limit) * 100 
                  : 0;

                return (
                  <tr key={academy.id} className="hover:bg-[var(--bg-secondary)]/50">
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{academy.academy?.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{academy.academy?.email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="gold">{academy.plan?.display_name || academy.plan?.name}</Badge>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 capitalize">
                        {academy.billing_cycle === 'annual' ? 'Anual' : 'Mensal'}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={`font-medium ${
                          usagePercent >= 95 ? 'text-red-400' : 
                          usagePercent >= 80 ? 'text-amber-400' : 
                          'text-[var(--text-primary)]'
                        }`}>
                          {academy.student_count}
                        </span>
                        <span className="text-[var(--text-secondary)]">/</span>
                        <span className="text-[var(--text-secondary)]">
                          {academy.plan_limit === 0 ? '∞' : academy.plan_limit}
                        </span>
                      </div>
                      {usagePercent >= 80 && (
                        <div className="flex items-center justify-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span className="text-xs text-amber-400">{usagePercent.toFixed(0)}%</span>
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={STATUS_BADGE_VARIANT[academy.status] || 'neutral'}>
                        {STATUS_LABELS[academy.status] || academy.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <p className="font-medium text-[var(--text-primary)]">
                        {formatCurrency(monthlyValue)}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">/mês</p>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        {academies.length === 0 && (
          <EmptyState
            icon={Building2}
            title={tc('empty.noAcademiesFound')}
            description={tc('empty.noAcademiesMessage')}
          />
        )}
      </div>
    </div>
  );
}
