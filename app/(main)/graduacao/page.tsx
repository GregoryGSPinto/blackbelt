'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { GraduationCap, ChevronRight, CheckCircle } from 'lucide-react';
import * as gradService from '@/lib/api/graduacao.service';
import type { GraduacaoHistorico, RequisitoGraduacao } from '@/lib/api/graduacao.service';
import { BeltStripes } from '@/components/shared/BeltStripes';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

const NIVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  'Nível Iniciante': { bg: 'bg-gray-200', border: 'border-gray-300', text: 'text-gray-700' },
  'Nível Cinza': { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-white' },
  'Nível Amarelo': { bg: 'bg-yellow-400', border: 'border-yellow-500', text: 'text-yellow-900' },
  'Nível Laranja': { bg: 'bg-orange-400', border: 'border-orange-500', text: 'text-white' },
  'Nível Verde': { bg: 'bg-green-500', border: 'border-green-600', text: 'text-white' },
  'Nível Básico': { bg: 'bg-blue-500', border: 'border-blue-600', text: 'text-white' },
  'Nível Intermediário': { bg: 'bg-purple-500', border: 'border-purple-600', text: 'text-white' },
  'Nível Avançado': { bg: 'bg-amber-800', border: 'border-amber-900', text: 'text-white' },
  'Nível Máximo': { bg: 'bg-gray-800', border: 'border-gray-900', text: 'text-white' },
};

const BELT_ORDER = ['Nível Iniciante', 'Nível Cinza', 'Nível Amarelo', 'Nível Laranja', 'Nível Verde', 'Nível Básico', 'Nível Intermediário', 'Nível Avançado', 'Nível Máximo'];

export default function GraduacaoPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();

  const [historico, setHistorico] = useState<GraduacaoHistorico[]>([]);
  const [requisitos, setRequisitos] = useState<RequisitoGraduacao[]>([]);
  const [meusSubniveis, setMeusSubniveis] = useState<{ subniveisAtuais: number; dataUltimoSubnivel?: string }>({ subniveisAtuais: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([gradService.getMinhaGraduacao(), gradService.getRequisitos(), gradService.getMeusSubniveis()])
      .then(([h, r, g]) => { setHistorico(h); setRequisitos(r); setMeusSubniveis(g); })
      .catch((err: unknown) => setError(handleServiceError(err, 'Graduação')))
      .finally(() => setLoading(false));
  }, []);

  const nivelAtual = historico.length > 0 ? historico[historico.length - 1].nivel : 'Nível Iniciante';
  const currentIdx = BELT_ORDER.indexOf(nivelAtual);
  const proximoNivel = currentIdx < BELT_ORDER.length - 1 ? BELT_ORDER[currentIdx + 1] : null;
  const reqProxima = proximoNivel ? requisitos.find(r => r.nivelDe === nivelAtual && r.nivelPara === proximoNivel) : null;

  // Calculate time in current belt
  const lastGrad = historico.length > 0 ? historico[historico.length - 1] : null;
  const tempoNoNivel = lastGrad ? Math.floor((Date.now() - new Date(lastGrad.data).getTime()) / (30 * 24 * 60 * 60 * 1000)) : 0;

  const nivelColors = NIVEL_COLORS[nivelAtual] || NIVEL_COLORS['Nível Iniciante'];

  if (loading) return <PremiumLoader />;
  if (error) return <PageError error={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          <GraduationCap size={20} className="text-purple-400" />
          Minha Graduação
        </h1>
        <p className="text-sm text-white/40 mt-1">Linha do tempo e progresso</p>
      </div>

      {/* Current belt card */}
      <div className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] p-6">
        <p className="text-[10px] text-white/25 uppercase tracking-wider mb-3">Nível Atual</p>
        <div className="flex items-center gap-4">
          <BeltStripes nivel={nivelAtual} subniveis={meusSubniveis.subniveisAtuais} size="lg" />
          <div>
            <p style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>{nivelAtual}</p>
            <p className="text-xs text-white/30">
              {tempoNoNivel} meses neste nível · {meusSubniveis.subniveisAtuais}/4 subniveis
            </p>
          </div>
        </div>

        {/* Progress to next */}
        {reqProxima && proximoNivel && (
          <div className="mt-5 pt-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <ChevronRight size={14} className="text-white/20" />
              <p className="text-xs" style={{ color: tokens.textMuted }}>Próximo nível: <span className="font-bold text-white/60">{proximoNivel}</span></p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <ProgressMini label="Tempo" current={tempoNoNivel} required={reqProxima.tempoMinimoMeses} unit="meses" />
              <ProgressMini label="Presença" current={82} required={reqProxima.presencaMinimaPct} unit="%" />
              <ProgressMini label="Sessões" current={168} required={reqProxima.sessõesMinimas} unit="sessões" />
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-4">Linha do Tempo</h2>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/[0.06]" />

          {historico.map((grad, i) => {
            const colors = NIVEL_COLORS[grad.nivel] || NIVEL_COLORS['Nível Iniciante'];
            const isLast = i === historico.length - 1;
            return (
              <div key={i} className="relative mb-6 last:mb-0">
                {/* Dot */}
                <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 ${colors.bg} ${colors.border} ${isLast ? 'ring-2 ring-white/10' : ''}`} />

                <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-white/70">{grad.nivel}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {formatDate(grad.data + 'T12:00:00', 'long')}
                      </p>
                    </div>
                    {grad.professorNome && (
                      <span className="text-[10px] text-white/20">{grad.professorNome}</span>
                    )}
                  </div>
                  {isLast && <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400/60 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-2"><CheckCircle size={8} /> Atual</span>}
                </div>
              </div>
            );
          })}

          {/* Future belt (faded) */}
          {proximoNivel && (
            <div className="relative mb-0 opacity-30">
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-dashed border-white/20 bg-transparent" />
              <div className="rounded-xl border border-dashed border-white/[0.06] p-4">
                <p className="text-sm font-bold text-white/40">{proximoNivel}</p>
                <p className="text-[10px] text-white/15">Em progresso...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressMini({ label, current, required, unit }: { label: string; current: number; required: number; unit: string }) {
  const pct = Math.min(100, Math.round((current / required) * 100));
  const met = current >= required;
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
      <p className="text-[9px] text-white/20 uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${met ? 'text-emerald-400' : 'text-white/50'}`}>
        {current}/{required} {unit}
      </p>
      <div className="h-1.5 rounded-full bg-white/[0.05] mt-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${met ? 'bg-emerald-500/60' : 'bg-blue-500/40'}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
