'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ClipboardList, Plus, Trash2, Clock, Search, Timer,
  Dumbbell, Target, Swords, Heart, Save, Copy, BookOpen,
} from 'lucide-react';
import * as planoService from '@/lib/api/plano-aula.service';
import type { TecnicaPratica, PlanoAula, ItemPlanoAula, FaseSessão } from '@/lib/api/plano-aula.service';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

const FASE_CONFIG: Record<FaseSessão, { label: string; icon: typeof Dumbbell; color: string }> = {
  aquecimento: { label: 'Aquecimento', icon: Heart, color: 'text-orange-400 bg-orange-500/10' },
  tecnica: { label: 'Técnica', icon: BookOpen, color: 'text-blue-400 bg-blue-500/10' },
  drill: { label: 'Drill', icon: Target, color: 'text-purple-400 bg-purple-500/10' },
  sparring: { label: 'Sparring', icon: Swords, color: 'text-red-400 bg-red-500/10' },
  alongamento: { label: 'Alongamento', icon: Dumbbell, color: 'text-emerald-400 bg-emerald-500/10' },
};

const FASES_ORDEM: FaseSessão[] = ['aquecimento', 'tecnica', 'drill', 'sparring', 'alongamento'];

type TabView = 'builder' | 'planos' | 'tecnicas';

export default function PlanoAulaPage() {
  const t = useTranslations('professor.lessonPlan');
  const { formatDate } = useFormatting();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [tecnicas, setTecnicas] = useState<TecnicaPratica[]>([]);
  const [planos, setPlanos] = useState<PlanoAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabView>('builder');
  const [searchTec, setSearchTec] = useState('');

  // Builder state
  const [titulo, setTitulo] = useState('');
  const [itens, setItens] = useState<ItemPlanoAula[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([planoService.getTecnicas(), planoService.getPlanos()])
      .then(([t, p]) => { setTecnicas(t); setPlanos(p); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Plano de Sessão')))
      .finally(() => setLoading(false));
  }, []);

  const duracaoTotal = useMemo(() => itens.reduce((s, i) => s + i.duracaoMinutos, 0), [itens]);

  const addItem = useCallback((fase: FaseSessão) => {
    setItens(prev => [...prev, {
      id: `item-${Date.now()}`, fase, titulo: '', descricao: '', duracaoMinutos: 10,
    }]);
  }, []);

  const updateItem = useCallback((id: string, field: string, value: string | number) => {
    setItens(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }, []);

  const removeItem = useCallback((id: string) => {
    setItens(prev => prev.filter(i => i.id !== id));
  }, []);

  const handleSave = useCallback(async (asTemplate = false) => {
    if (!titulo.trim() || itens.length === 0) return;
    try {
      const novo = await planoService.salvarPlano({
        titulo, professorId: 'PROF001', data: asTemplate ? '' : new Date().toISOString().split('T')[0],
        itens, duracaoTotal, template: asTemplate, tags: [],
      });
      setPlanos(prev => [...prev, novo]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* noop */ }
  }, [titulo, itens, duracaoTotal]);

  const loadPlano = useCallback((plano: PlanoAula) => {
    setTitulo(plano.titulo + (plano.template ? ' (cópia)' : ''));
    setItens(plano.itens.map((i: ItemPlanoAula) => ({ ...i, id: `item-${Date.now()}-${Math.random()}` })));
    setTab('builder');
  }, []);

  const filteredTecnicas = useMemo(() => {
    if (!searchTec) return tecnicas;
    const q = searchTec.toLowerCase();
    return tecnicas.filter(t => t.nome.toLowerCase().includes(q) || t.posicao.toLowerCase().includes(q));
  }, [tecnicas, searchTec]);

  if (loading) return <PremiumLoader />;
  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            <ClipboardList size={20} className="text-blue-400" />
            {t('title')}
          </h1>
          <p className="text-sm text-white/40 mt-1">{t('subtitle')}</p>
        </div>
        <Link href="/professor-cronometro"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs font-bold hover:bg-white/[0.08] transition-colors">
          <Timer size={14} /> Cronômetro
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/[0.03] rounded-xl p-1 w-fit">
        {([['builder', t('tabs.build'), ClipboardList], ['planos', t('tabs.saved'), Copy], ['tecnicas', t('tabs.techniques'), BookOpen]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key as TabView)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${tab === key ? 'bg-white/[0.08] text-white' : 'text-white/30'}`}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* BUILDER TAB */}
      {tab === 'builder' && (
        <div className="space-y-4">
          {/* Title */}
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder={t('namePlaceholder')}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/70 text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20" />

          {/* Phase buttons */}
          <div className="flex flex-wrap gap-2">
            {FASES_ORDEM.map(fase => {
              const cfg = FASE_CONFIG[fase];
              const FIcon = cfg.icon;
              return (
                <button key={fase} onClick={() => addItem(fase)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${cfg.color} text-xs font-bold hover:opacity-80 transition-opacity`}>
                  <Plus size={12} /> {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Items */}
          {itens.length === 0 ? (
            <div className="prof-glass-card p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <ClipboardList size={28} className="text-white/15" />
              </div>
              <p className="text-white/30 text-sm font-medium">{t('emptyHint')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itens.map((item, idx) => {
                const cfg = FASE_CONFIG[item.fase];
                const FIcon = cfg.icon;
                return (
                  <div key={item.id} className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                      <input value={item.titulo} onChange={e => updateItem(item.id, 'titulo', e.target.value)}
                        placeholder={t('stepDuration')} className="flex-1 bg-transparent text-sm text-white/60 font-bold placeholder:text-white/15 focus:outline-none" />
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => updateItem(item.id, 'duracaoMinutos', Math.max(1, item.duracaoMinutos - 5))}
                          className="w-6 h-6 rounded bg-white/[0.04] text-white/30 text-xs flex items-center justify-center">−</button>
                        <span className="text-xs text-white/50 w-10 text-center font-bold">{item.duracaoMinutos}′</span>
                        <button onClick={() => updateItem(item.id, 'duracaoMinutos', item.duracaoMinutos + 5)}
                          className="w-6 h-6 rounded bg-white/[0.04] text-white/30 text-xs flex items-center justify-center">+</button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/15 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input value={item.descricao} onChange={e => updateItem(item.id, 'descricao', e.target.value)}
                      placeholder={t('stepDescription')} className="w-full bg-transparent text-xs text-white/30 placeholder:text-white/10 focus:outline-none" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          {itens.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 text-sm text-white/40">
                <Clock size={14} />
                <span className="font-bold">{duracaoTotal} {t('minutes')}</span>
                <span className="text-white/15">· {itens.length} {t('steps')}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleSave(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs font-bold hover:bg-white/[0.08] transition-colors">
                  <Copy size={12} /> {t('saveTemplate')}
                </button>
                <button onClick={() => handleSave(false)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${saved ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' : 'bg-blue-500/15 border border-blue-500/25 text-blue-300 hover:bg-blue-500/25'}`}>
                  <Save size={12} /> {saved ? '✓' : t('savePlan')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PLANOS SALVOS TAB */}
      {tab === 'planos' && (
        <div className="space-y-3">
          {planos.length === 0 ? (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-12 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Copy size={28} className="text-white/15" />
              </div>
              <p className="text-white/30 text-sm font-medium">{t('noSavedPlans')}</p>
            </div>
          ) : (
            planos.map(plano => (
              <div key={plano.id} className="rounded-xl hover-card bg-white/[0.02] border border-white/[0.06] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white/70">{plano.titulo}</p>
                      {plano.template && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">TEMPLATE</span>}
                    </div>
                    <p className="text-[10px] text-white/25 mt-0.5">
                      {plano.itens.length} {t('steps')} · {plano.duracaoTotal}{t('min')}
                      {plano.turmaNome && ` · ${plano.turmaNome}`}
                      {plano.data && ` · ${formatDate(plano.data + 'T12:00:00', 'short')}`}
                    </p>
                  </div>
                  <button onClick={() => loadPlano(plano)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/30 text-xs font-bold hover:bg-white/[0.08] transition-colors">
                    <Copy size={12} /> Usar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {plano.itens.map(item => {
                    const cfg = FASE_CONFIG[item.fase];
                    return <span key={item.id} className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${cfg.color}`}>{item.titulo || cfg.label}</span>;
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TÉCNICAS TAB */}
      {tab === 'tecnicas' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input value={searchTec} onChange={e => setSearchTec(e.target.value)} placeholder={t('searchTechnique')}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/60 text-sm placeholder:text-white/15 focus:outline-none focus:border-white/20" />
          </div>
          <div className="space-y-2">
            {filteredTecnicas.map(tec => (
              <div key={tec.id} className="flex items-center gap-3 p-3 rounded-xl hover-card bg-white/[0.02] border border-white/[0.06]">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/60">{tec.nome}</p>
                  <div className="flex items-center gap-2 text-[9px] text-white/20 mt-0.5">
                    <span>{tec.posicao}</span>
                    <span>·</span>
                    <span className="capitalize">{tec.tipo}</span>
                    <span>·</span>
                    <span>{tec.nivelMinimo}</span>
                  </div>
                  {tec.descricao && <p className="text-[9px] text-white/15 mt-0.5">{tec.descricao}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
