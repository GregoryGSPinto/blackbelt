'use client';
import { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, Trophy, ChevronDown, ChevronUp, Lightbulb, BarChart3, Calendar } from 'lucide-react';
import { METAS, HISTORICO_METAS, type Meta } from '@/lib/__mocks__/unit-owner.mock';

function getProgressPercent(meta: Meta): number {
  if (meta.tipo === 'inadimplencia') {
    // Lower is better: 100% when atual <= target, decreasing as atual exceeds target
    if (meta.atual <= meta.target) return 100;
    return Math.max(0, Math.min(100, (1 - (meta.atual - meta.target) / meta.target) * 100));
  }
  return Math.min(100, (meta.atual / meta.target) * 100);
}

function getRawPercent(meta: Meta): number {
  if (meta.tipo === 'inadimplencia') {
    if (meta.atual <= meta.target) return 100;
    return Math.max(0, (1 - (meta.atual - meta.target) / meta.target) * 100);
  }
  return (meta.atual / meta.target) * 100;
}

function getStatusBadge(status: Meta['status']) {
  switch (status) {
    case 'no_caminho':
      return { label: 'No Caminho', bg: '#16a34a', color: '#fff' };
    case 'atencao':
      return { label: 'Atencao', bg: '#eab308', color: '#000' };
    case 'critico':
      return { label: 'Critico', bg: '#dc2626', color: '#fff' };
    case 'atingida':
      return { label: 'Atingida!', bg: '#d97706', color: '#fff' };
  }
}

function getProjecao(meta: Meta) {
  const pct = getRawPercent(meta);
  if (pct > 85) return { label: 'Provavel', color: '#16a34a' };
  if (pct >= 60) return { label: 'Possivel', color: '#eab308' };
  return { label: 'Improvavel', color: '#dc2626' };
}

function getProgressBarColor(meta: Meta): string {
  if (meta.status === 'atingida') return '#d97706';
  if (meta.status === 'critico') return '#dc2626';
  if (meta.status === 'atencao') return '#eab308';
  return '#16a34a';
}

export default function MetasPage() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeMetas = METAS.filter(m => m.status !== 'atingida');
  const metasWithAction = METAS.filter(m => m.status === 'critico' || m.status === 'atencao');

  const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 12,
  };

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Metas e OKRs
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {activeMetas.length} meta{activeMetas.length !== 1 ? 's' : ''} ativa{activeMetas.length !== 1 ? 's' : ''} em acompanhamento
        </p>
      </div>

      {/* ── Meta Cards Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {METAS.map(meta => {
          const pct = getProgressPercent(meta);
          const rawPct = getRawPercent(meta);
          const badge = getStatusBadge(meta.status);
          const proj = getProjecao(meta);
          const barColor = getProgressBarColor(meta);
          const isExpanded = expandedCards[meta.id] ?? false;

          return (
            <div
              key={meta.id}
              className="rounded-xl p-5 flex flex-col gap-4"
              style={cardStyle}
            >
              {/* Top row: name + status badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {meta.nome}
                  </h3>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                    {meta.unidade}
                  </span>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                  style={{
                    background: badge.bg,
                    color: badge.color,
                    ...(meta.status === 'atingida'
                      ? { boxShadow: '0 0 12px rgba(217,119,6,0.5)' }
                      : {}),
                  }}
                >
                  {meta.status === 'atingida' && <Trophy className="inline w-3 h-3 mr-1 -mt-0.5" />}
                  {badge.label}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                    Atual: {meta.tipo === 'receita' ? `R$ ${meta.atual.toLocaleString('pt-BR')}` : `${meta.atual}${meta.unidade === '%' ? '%' : ''}`}
                  </span>
                  <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                    Meta: {meta.tipo === 'receita' ? `R$ ${meta.target.toLocaleString('pt-BR')}` : `${meta.target}${meta.unidade === '%' ? '%' : ''}`}
                  </span>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 14, background: 'var(--text-secondary)', opacity: 0.2 }}
                >
                  <div style={{ position: 'relative', height: '100%' }}>
                    <div
                      className="rounded-full"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '100%',
                        background: 'var(--text-secondary)',
                        opacity: 1,
                      }}
                    />
                  </div>
                </div>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: 14, background: 'rgba(128,128,128,0.2)', marginTop: -14 }}
                >
                  <div
                    className="rounded-full h-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: barColor,
                    }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm font-semibold" style={{ color: barColor }}>
                    {rawPct.toFixed(1)}%
                  </span>
                  {/* Projecao indicator */}
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" style={{ color: proj.color }} />
                    <span className="text-xs font-semibold" style={{ color: proj.color }}>
                      {proj.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sugestao tip box for critico/atencao */}
              {(meta.status === 'critico' || meta.status === 'atencao') && meta.sugestao && (
                <div>
                  <button
                    onClick={() => toggleCard(meta.id)}
                    className="flex items-center gap-1 text-xs font-semibold cursor-pointer"
                    style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', padding: 0 }}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    Sugestao
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  {isExpanded && (
                    <div
                      className="mt-2 rounded-lg p-3 flex items-start gap-2"
                      style={{
                        background: meta.status === 'critico' ? 'rgba(220,38,38,0.1)' : 'rgba(234,179,8,0.1)',
                        border: `1px solid ${meta.status === 'critico' ? 'rgba(220,38,38,0.3)' : 'rgba(234,179,8,0.3)'}`,
                      }}
                    >
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: meta.status === 'critico' ? '#dc2626' : '#eab308' }} />
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {meta.sugestao}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Historico de Metas ──────────────────────────────── */}
      <div className="rounded-xl p-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Historico de Metas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                <th className="text-left py-2 px-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Mes</th>
                <th className="text-left py-2 px-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Meta</th>
                <th className="text-right py-2 px-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Target</th>
                <th className="text-right py-2 px-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Resultado</th>
                <th className="text-center py-2 px-3 text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Atingiu</th>
              </tr>
            </thead>
            <tbody>
              {HISTORICO_METAS.map((h, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
                  <td className="py-2 px-3 text-sm" style={{ color: 'var(--text-primary)' }}>{h.mes}</td>
                  <td className="py-2 px-3 text-sm" style={{ color: 'var(--text-primary)' }}>{h.meta}</td>
                  <td className="py-2 px-3 text-sm text-right" style={{ color: 'var(--text-secondary)' }}>{h.target.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-sm text-right font-semibold" style={{ color: 'var(--text-primary)' }}>{h.resultado.toLocaleString('pt-BR')}</td>
                  <td className="py-2 px-3 text-center">
                    {h.atingiu ? (
                      <CheckCircle className="w-5 h-5 inline" style={{ color: '#16a34a' }} />
                    ) : (
                      <AlertTriangle className="w-5 h-5 inline" style={{ color: '#dc2626' }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Plano de Acao ───────────────────────────────────── */}
      {metasWithAction.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Plano de Acao
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metasWithAction.map(meta => {
              const gap = meta.tipo === 'inadimplencia'
                ? meta.atual - meta.target
                : meta.target - meta.atual;
              const gapLabel = meta.tipo === 'inadimplencia'
                ? `${gap}${meta.unidade === '%' ? '%' : ` ${meta.unidade}`} acima do limite`
                : meta.tipo === 'receita'
                  ? `R$ ${gap.toLocaleString('pt-BR')} faltando`
                  : `${gap} ${meta.unidade} faltando`;
              const borderColor = meta.status === 'critico' ? '#dc2626' : '#eab308';

              return (
                <div
                  key={meta.id}
                  className="rounded-xl p-5 flex flex-col gap-3"
                  style={{
                    ...cardStyle,
                    borderLeft: `4px solid ${borderColor}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      <Target className="inline w-4 h-4 mr-1 -mt-0.5" style={{ color: borderColor }} />
                      {meta.nome}
                    </h3>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: meta.status === 'critico' ? 'rgba(220,38,38,0.15)' : 'rgba(234,179,8,0.15)',
                        color: borderColor,
                      }}
                    >
                      {gapLabel}
                    </span>
                  </div>

                  {meta.sugestao && (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {meta.sugestao}
                    </p>
                  )}

                  <button
                    className="self-start px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-80 cursor-pointer"
                    style={{
                      background: borderColor,
                      color: '#fff',
                      border: 'none',
                    }}
                    onClick={() => {/* placeholder */}}
                  >
                    Implementar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
