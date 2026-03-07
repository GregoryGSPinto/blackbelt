'use client';

import { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, Lock, Unlock, Trash2,
  Eye, Edit2, Users, GraduationCap, Mail, Phone,
  MapPin, Calendar, CreditCard, ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import type { MockAcademy, PlanoAcademia, StatusAcademia } from '@/lib/__mocks__/super-admin.mock';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { StaggerList, StaggerItem } from '@/components/transitions/StaggerList';

// ============================================================
// HELPERS
// ============================================================

const STATUS_BADGE_VARIANT: Record<StatusAcademia, 'success' | 'warning' | 'error'> = {
  ATIVA: 'success',
  INADIMPLENTE: 'warning',
  BLOQUEADA: 'error',
};

const STATUS_LABEL_KEY: Record<StatusAcademia, string> = {
  ATIVA: 'statusActive',
  INADIMPLENTE: 'statusDefaulter',
  BLOQUEADA: 'statusBlocked',
};

const PLAN_OPTIONS: PlanoAcademia[] = ['BASICO', 'PRO', 'ENTERPRISE'];
const STATUS_OPTIONS: (StatusAcademia | 'TODAS')[] = ['TODAS', 'ATIVA', 'INADIMPLENTE', 'BLOQUEADA'];

// ============================================================
// COMPONENTS
// ============================================================

function AcademyDetailModal({ academy, onClose }: { academy: MockAcademy; onClose: () => void }) {
  const t = useTranslations('superAdmin.academies');
  const { formatMoney, formatDate } = useFormatting();
  const formatBRL = (value: number) => formatMoney(value, { minimumFractionDigits: 0 });

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={academy.nome}
      size="lg"
      footer={
        <div className="flex gap-2 w-full">
          {academy.status === 'BLOQUEADA' ? (
            <Button variant="primary" icon={<Unlock className="w-4 h-4" />} fullWidth>
              {t('unblock')}
            </Button>
          ) : (
            <Button variant="danger" icon={<Lock className="w-4 h-4" />} fullWidth>
              {t('block')}
            </Button>
          )}
          <Button variant="secondary" icon={<Edit2 className="w-4 h-4" />} fullWidth>
            {t('edit')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_BADGE_VARIANT[academy.status]}>
            {t(STATUS_LABEL_KEY[academy.status])}
          </Badge>
          <Badge variant="gold">{t('plan')} {academy.plano}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={Users} label={t('students')} value={String(academy.totalAlunos)} />
          <InfoRow icon={GraduationCap} label={t('professors')} value={String(academy.totalProfessores)} />
          <InfoRow icon={CreditCard} label="MRR" value={formatBRL(academy.mrr)} />
          <InfoRow icon={Calendar} label={t('createdAt')} value={formatDate(academy.criadoEm, 'short')} />
          <InfoRow icon={MapPin} label={t('city')} value={`${academy.cidade}/${academy.estado}`} />
          <InfoRow icon={CreditCard} label={t('lastPayment')} value={formatDate(academy.ultimoPagamento, 'short')} />
          <InfoRow icon={Mail} label={t('email')} value={academy.email} />
          <InfoRow icon={Phone} label={t('phone')} value={academy.telefone} />
        </div>
      </div>
    </Modal>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-secondary)]">
      <Icon className="w-4 h-4 text-gold-500/60" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
        <p className="text-xs font-medium truncate text-[var(--text-primary)]">{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function AcademiasPage() {
  const t = useTranslations('superAdmin.academies');
  const { formatMoney } = useFormatting();
  const formatBRL = (value: number) => formatMoney(value, { minimumFractionDigits: 0 });
  const [academies, setAcademies] = useState<MockAcademy[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusAcademia | 'TODAS'>('TODAS');
  const [planFilter, setPlanFilter] = useState<PlanoAcademia | 'TODOS'>('TODOS');
  const [selectedAcademy, setSelectedAcademy] = useState<MockAcademy | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/super-admin/academies');
        if (res.ok) {
          const data = await res.json();
          setAcademies(data.academies);
        }
      } catch {
        const mock = await import('@/lib/__mocks__/super-admin.mock');
        setAcademies(mock.MOCK_ACADEMIES);
      }
    }
    load();
  }, []);

  const filtered = academies.filter(a => {
    if (statusFilter !== 'TODAS' && a.status !== statusFilter) return false;
    if (planFilter !== 'TODOS' && a.plano !== planFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.nome.toLowerCase().includes(q) || a.cidade.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      await fetch(`/api/super-admin/academies/${id}`, { method: 'DELETE' });
      setAcademies(prev => prev.filter(a => a.id !== id));
    } catch {
      setAcademies(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleToggleBlock = async (academy: MockAcademy) => {
    const newStatus: StatusAcademia = academy.status === 'BLOQUEADA' ? 'ATIVA' : 'BLOQUEADA';
    try {
      await fetch(`/api/super-admin/academies/${academy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch { /* mock fallback */ }
    setAcademies(prev => prev.map(a => a.id === academy.id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)]">{t('title')}</h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            {t('registeredCount', { count: academies.length })}
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
          {t('newAcademy')}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-primary)]">
          <Search className="w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<Filter className="w-4 h-4" />}
          iconRight={<ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />}
          onClick={() => setShowFilters(!showFilters)}
        >
          {t('filters')}
        </Button>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-3 p-4 rounded-xl border bg-[var(--bg-secondary)] border-[var(--border)]">
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1 text-[var(--text-secondary)]">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusAcademia | 'TODAS')}
              className="text-sm px-3 py-1.5 rounded-xl border bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-primary)]"
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'TODAS' ? t('all') : t(STATUS_LABEL_KEY[s as StatusAcademia])}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider block mb-1 text-[var(--text-secondary)]">{t('plan')}</label>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value as PlanoAcademia | 'TODOS')}
              className="text-sm px-3 py-1.5 rounded-xl border bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-primary)]"
            >
              <option value="TODOS">{t('allPlans')}</option>
              {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Academy List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={t('noAcademies')}
          className="premium-card rounded-xl"
        />
      ) : (
        <StaggerList className="space-y-3">
          {filtered.map((academy) => (
            <StaggerItem key={academy.id}>
              <div className="premium-card hover-card rounded-xl flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4">
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gold-500/10 text-gold-500">
                  <Building2 className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold truncate text-[var(--text-primary)]">
                      {academy.nome}
                    </h3>
                    <Badge variant={STATUS_BADGE_VARIANT[academy.status]}>
                      {t(STATUS_LABEL_KEY[academy.status])}
                    </Badge>
                  </div>
                  <p className="text-xs mt-1 text-[var(--text-secondary)]">
                    {academy.cidade}/{academy.estado} · {academy.totalAlunos} {t('students')} · {academy.totalProfessores} {t('professors')}
                  </p>
                </div>

                {/* Plan & MRR */}
                <div className="flex items-center gap-4">
                  <Badge variant="gold">{academy.plano}</Badge>
                  <span className="text-sm font-medium text-gold-500">
                    {formatBRL(academy.mrr)}/{t('monthShort')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedAcademy(academy)}
                    className="p-2 rounded-xl bg-gold-500/10 text-gold-500 hover:bg-gold-500/20 transition-colors"
                    title={t('viewDetails')}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleBlock(academy)}
                    className={`p-2 rounded-xl transition-colors ${
                      academy.status === 'BLOQUEADA'
                        ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }`}
                    title={academy.status === 'BLOQUEADA' ? t('unblock') : t('block')}
                  >
                    {academy.status === 'BLOQUEADA' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(academy.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>
      )}

      {/* Detail Modal */}
      {selectedAcademy && (
        <AcademyDetailModal
          academy={selectedAcademy}
          onClose={() => setSelectedAcademy(null)}
        />
      )}
    </div>
  );
}
