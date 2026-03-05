'use client';

import { useState, useEffect } from 'react';
import {
  Building2, Plus, Search, Filter, Lock, Unlock, Trash2,
  Eye, Edit2, X, Users, GraduationCap, Mail, Phone,
  MapPin, Calendar, CreditCard, ChevronDown,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import type { MockAcademy, PlanoAcademia, StatusAcademia } from '@/lib/__mocks__/super-admin.mock';
import { getDesignTokens } from '@/lib/design-tokens';

// ============================================================
// HELPERS
// ============================================================

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
}

const STATUS_CONFIG = {
  ATIVA:         { label: 'Ativa',        dotDark: 'bg-emerald-400', dotLight: 'bg-emerald-500', bgDark: 'bg-emerald-500/10', bgLight: 'bg-emerald-100', textDark: 'text-emerald-400', textLight: 'text-emerald-700' },
  INADIMPLENTE:  { label: 'Inadimplente', dotDark: 'bg-amber-400',   dotLight: 'bg-amber-500',   bgDark: 'bg-amber-500/10',   bgLight: 'bg-amber-100',   textDark: 'text-amber-400',   textLight: 'text-amber-700' },
  BLOQUEADA:     { label: 'Bloqueada',    dotDark: 'bg-red-400',     dotLight: 'bg-red-500',     bgDark: 'bg-red-500/10',     bgLight: 'bg-red-100',     textDark: 'text-red-400',     textLight: 'text-red-700' },
};

const PLAN_OPTIONS: PlanoAcademia[] = ['BASICO', 'PRO', 'ENTERPRISE'];
const STATUS_OPTIONS: (StatusAcademia | 'TODAS')[] = ['TODAS', 'ATIVA', 'INADIMPLENTE', 'BLOQUEADA'];

// ============================================================
// COMPONENTS
// ============================================================

function StatusBadge({ status, isDark }: { status: StatusAcademia; isDark: boolean }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${isDark ? `${c.bgDark} ${c.textDark}` : `${c.bgLight} ${c.textLight}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? c.dotDark : c.dotLight}`} />
      {c.label}
    </span>
  );
}

function AcademyDetailPanel({ academy, isDark, onClose }: { academy: MockAcademy; isDark: boolean; onClose: () => void }) {
  const t = useTranslations('superAdmin.academies');
  return (
    <div className={`
      fixed inset-0 z-50 flex items-center justify-center p-4
      ${isDark ? 'bg-black/70' : 'bg-black/30'}
      backdrop-blur-sm
    `} onClick={onClose}>
      <div
        className={`
          w-full max-w-lg rounded-2xl border p-6 space-y-5
          ${isDark
            ? 'bg-[#0F0A1F] border-indigo-500/20'
            : 'bg-white border-slate-200'
          }
        `}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {academy.nome}
          </h2>
          <button onClick={onClose} className={`p-1 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={academy.status} isDark={isDark} />
          <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
            Plano {academy.plano}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoRow isDark={isDark} icon={Users} label="Alunos" value={String(academy.totalAlunos)} />
          <InfoRow isDark={isDark} icon={GraduationCap} label="Professores" value={String(academy.totalProfessores)} />
          <InfoRow isDark={isDark} icon={CreditCard} label="MRR" value={formatBRL(academy.mrr)} />
          <InfoRow isDark={isDark} icon={Calendar} label="Criada em" value={new Date(academy.criadoEm).toLocaleDateString('pt-BR')} />
          <InfoRow isDark={isDark} icon={MapPin} label="Cidade" value={`${academy.cidade}/${academy.estado}`} />
          <InfoRow isDark={isDark} icon={CreditCard} label="Últ. Pagamento" value={new Date(academy.ultimoPagamento).toLocaleDateString('pt-BR')} />
          <InfoRow isDark={isDark} icon={Mail} label="Email" value={academy.email} />
          <InfoRow isDark={isDark} icon={Phone} label="Telefone" value={academy.telefone} />
        </div>

        <div className="flex gap-2 pt-2">
          {academy.status === 'BLOQUEADA' ? (
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500">
              <Unlock className="w-4 h-4" /> {t('unblock')}
            </button>
          ) : (
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500">
              <Lock className="w-4 h-4" /> {t('block')}
            </button>
          )}
          <button className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
            <Edit2 className="w-4 h-4" /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, isDark }: { icon: React.ElementType; label: string; value: string; isDark: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
      <Icon className={`w-4 h-4 ${isDark ? 'text-indigo-400/60' : 'text-indigo-500'}`} />
      <div className="min-w-0">
        <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function AcademiasPage() {
  const t = useTranslations('superAdmin.academies');
  const tActions = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{t('title')}</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
            {academies.length} academias cadastradas
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all">
          <Plus className="w-4 h-4" />
          Nova Academia
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`
          flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border
          ${isDark
            ? 'bg-white/5 border-indigo-500/20 text-white'
            : 'bg-white border-slate-200 text-slate-900'
          }
        `}>
          <Search className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-inherit/40"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl border text-sm
            ${isDark
              ? 'bg-white/5 border-indigo-500/20 text-white/70 hover:bg-white/10'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          Filtros
          <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showFilters && (
        <div className={`
          flex flex-wrap gap-3 p-4 rounded-xl border
          ${isDark ? 'bg-white/5 border-indigo-500/10' : 'bg-slate-50 border-slate-200'}
        `}>
          <div>
            <label className={`text-[10px] uppercase tracking-wider block mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as StatusAcademia | 'TODAS')}
              className={`text-sm px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s === 'TODAS' ? 'Todas' : STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={`text-[10px] uppercase tracking-wider block mb-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Plano</label>
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value as PlanoAcademia | 'TODOS')}
              className={`text-sm px-3 py-1.5 rounded-lg border ${isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
            >
              <option value="TODOS">Todos</option>
              {PLAN_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Academy List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className={`text-center py-12 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-slate-200'}`}>
            <Building2 className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-slate-300'}`} />
            <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{t('noAcademies')}</p>
          </div>
        ) : (
          filtered.map((academy) => (
            <div
              key={academy.id}
              className={`
                flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 rounded-2xl border transition-all
                ${isDark
                  ? 'bg-white/[0.03] border-white/10 hover:border-indigo-500/30'
                  : 'bg-white border-slate-200 hover:border-indigo-300'
                }
              `}
            >
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}
              `}>
                <Building2 className="w-5 h-5" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {academy.nome}
                  </h3>
                  <StatusBadge status={academy.status} isDark={isDark} />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                  {academy.cidade}/{academy.estado} · {academy.totalAlunos} alunos · {academy.totalProfessores} professores
                </p>
              </div>

              {/* Plan & MRR */}
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-700'}`}>
                  {academy.plano}
                </span>
                <span className={`text-sm font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {formatBRL(academy.mrr)}/mês
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSelectedAcademy(academy)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  title="Ver detalhes"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleToggleBlock(academy)}
                  className={`p-2 rounded-lg ${
                    academy.status === 'BLOQUEADA'
                      ? isDark ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : isDark ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                  }`}
                  title={academy.status === 'BLOQUEADA' ? 'Desbloquear' : 'Bloquear'}
                >
                  {academy.status === 'BLOQUEADA' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(academy.id)}
                  className={`p-2 rounded-lg ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedAcademy && (
        <AcademyDetailPanel
          academy={selectedAcademy}
          isDark={isDark}
          onClose={() => setSelectedAcademy(null)}
        />
      )}
    </div>
  );
}
