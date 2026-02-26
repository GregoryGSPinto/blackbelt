'use client';

// ============================================================
// PERFIL ATLETA PÚBLICO — Enhanced with Training Heatmap
// ============================================================
// Sections:
//   1. Hero: Avatar + Name + Belt + Academy
//   2. Stats grid: Check-ins, Months, Medals
//   3. Training Heatmap (GitHub-style)
//   4. Graduation Timeline
//   5. Dedication summary + Footer
// ============================================================

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Award, Calendar, CheckCircle, Medal, Timer, MapPin,
  Share2, Flame,
} from 'lucide-react';
import * as carteirinhaService from '@/lib/api/carteirinha.service';
import type { AtletaPublico, GraduacaoHistorico } from '@/lib/api/contracts';
import { TrainingHeatmap } from '@/components/aluno/TrainingHeatmap';
import type { TrainingDay } from '@/components/aluno/TrainingHeatmap';
import { generateMockTrainingData } from '@/lib/__mocks__/atleta-perfil.mock';

// ── Nivel colors ──
const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB',
  'Nível Cinza': '#9CA3AF',
  'Nível Amarelo': '#EAB308',
  'Nível Laranja': '#F97316',
  'Nível Verde': '#22C55E',
  'Nível Básico': '#3B82F6',
  'Nível Intermediário': '#8B5CF6',
  'Nível Avançado': '#92400E',
  'Nível Máximo': '#374151',
  'Nível Máximo 1º Subnível': '#374151',
  'Nível Máximo 2º Subnível': '#374151',
  'Nível Máximo 3º Subnível': '#374151',
};

function getNivelColor(nivel: string): string {
  return NIVEL_COLORS[nivel] || '#E5E7EB';
}

function formatDate(d: string) {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  } catch { return d; }
}

// ── Page styles ──
const PAGE_STYLES = `
  @keyframes atleta-hero-glow {
    0%, 100% { opacity: 0.08; }
    50% { opacity: 0.15; }
  }
  @keyframes atleta-stat-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes atleta-section-in {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes atleta-dot-glow {
    0%, 100% { box-shadow: 0 0 0 0 transparent; }
    50% { box-shadow: 0 0 12px var(--glow-color); }
  }
`;

// ── Stat Card ──
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  delay = 0,
}: {
  icon: typeof CheckCircle;
  value: string | number;
  label: string;
  color: string;
  delay?: number;
}) {
  return (
    <div
      className="rounded-xl p-3 text-center"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        animation: `atleta-stat-in 400ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
      }}
    >
      <Icon size={16} className={`mx-auto mb-1.5 ${color}`} />
      <p className="text-lg font-black text-white tabular-nums">{value}</p>
      <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════

export default function AtletaPublicoPage() {
  const params = useParams();
  const id = params?.id as string;
  const [atleta, setAtleta] = useState<AtletaPublico | null>(null);
  const [trainingData, setTrainingData] = useState<TrainingDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    carteirinhaService.getAtletaPublico(id)
      .then(data => {
        if (!data) {
          setNotFound(true);
        } else {
          setAtleta(data);
          setTrainingData(generateMockTrainingData(12));
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!atleta) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${atleta.nome} | BlackBelt`,
          text: `${atleta.nome} — ${atleta.nivelAtual} no ${atleta.unidade}`,
          url: window.location.href,
        });
      } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/20 mx-auto" />
          <p className="text-white/40 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (notFound || !atleta) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center">
            <Award size={32} className="text-white/20" />
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white">Atleta não encontrado</h1>
          <p className="text-white/40 text-sm">Este perfil não existe ou foi removido.</p>
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm hover:bg-white/[0.1] transition-colors">
            Ir para o início
          </a>
        </div>
      </div>
    );
  }

  // ── Render ──
  const nivelColor = getNivelColor(atleta.nivelAtual);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-black to-gray-950">
      <style dangerouslySetInnerHTML={{ __html: PAGE_STYLES }} />

      {/* ═══ HERO ═══ */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 0%, ${nivelColor}22, transparent 70%)`,
            animation: 'atleta-hero-glow 4s ease-in-out infinite',
          }}
        />
        <div className="relative max-w-lg mx-auto px-4 pt-10 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <span className="text-lg">🦁</span>
              <span className="text-xs font-bold text-white/50 tracking-wider">BLACKBELT</span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 text-xs hover:bg-white/[0.1] transition-colors active:scale-95"
            >
              <Share2 size={12} />
              Compartilhar
            </button>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black text-white border-2 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${nivelColor}30, ${nivelColor}10)`,
                borderColor: `${nivelColor}40`,
                boxShadow: `0 8px 32px ${nivelColor}20`,
              }}
            >
              {atleta.avatar || atleta.nome.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight">{atleta.nome}</h1>
              <div className="flex items-center justify-center gap-2 mt-1.5">
                <span className="w-4 h-4 rounded-full border-2" style={{ backgroundColor: nivelColor, borderColor: `${nivelColor}80` }} />
                <span className="text-sm text-white/60 font-medium">{atleta.nivelAtual}</span>
              </div>
              <div className="flex items-center justify-center gap-1 mt-1">
                <MapPin size={11} className="text-white/30" />
                <span className="text-xs text-white/30">{atleta.unidade}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-lg mx-auto px-4 space-y-5 pb-12">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          <StatCard icon={CheckCircle} value={atleta.totalCheckins.toLocaleString('pt-BR')} label="Check-ins" color="text-emerald-400" delay={0} />
          <StatCard icon={Timer} value={`${atleta.mesesTreinando}`} label="Meses" color="text-blue-400" delay={60} />
          <StatCard icon={Medal} value={`${atleta.conquistasRecebidas}`} label="Conquistas" color="text-amber-400" delay={120} />
        </div>

        {/* Training Heatmap */}
        <div style={{ animation: 'atleta-section-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 200ms both' }}>
          <TrainingHeatmap
            data={trainingData}
            weeks={40}
            accentColor={nivelColor === '#E5E7EB' ? '#22C55E' : nivelColor}
          />
        </div>

        {/* Graduation Timeline */}
        {atleta.graduacoes.length > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: 'atleta-section-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 300ms both',
            }}
          >
            <h2 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              Jornada de Graduações
            </h2>
            <div className="relative pl-6">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />
              <div className="space-y-4">
                {atleta.graduacoes.map((grad: GraduacaoHistorico, i: number) => {
                  const isLast = i === atleta.graduacoes.length - 1;
                  const gColor = getNivelColor(grad.nivel);
                  return (
                    <div key={i} className="relative flex items-start gap-3">
                      <div
                        className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 shrink-0"
                        style={{
                          backgroundColor: isLast ? gColor : `${gColor}80`,
                          borderColor: isLast ? gColor : `${gColor}40`,
                          boxShadow: isLast ? `0 0 12px ${gColor}40` : 'none',
                          '--glow-color': `${gColor}40`,
                          animation: isLast ? 'atleta-dot-glow 2s ease-in-out infinite' : undefined,
                        } as React.CSSProperties}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white/80">{grad.nivel}</span>
                          {isLast && (
                            <span className="text-[9px] bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded-full font-bold uppercase">Atual</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-white/30">{formatDate(grad.data)}</span>
                          {grad.professorNome && (
                            <>
                              <span className="text-white/10">·</span>
                              <span className="text-[11px] text-white/25">{grad.professorNome}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Dedication Summary */}
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: `linear-gradient(135deg, ${nivelColor}08, transparent)`,
            border: `1px solid ${nivelColor}15`,
            animation: 'atleta-section-in 500ms cubic-bezier(0.16, 1, 0.3, 1) 400ms both',
          }}
        >
          <Flame size={20} className="mx-auto mb-2" style={{ color: nivelColor }} />
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Dedicação</p>
          <p className="text-white font-bold text-2xl tabular-nums">
            {atleta.totalCheckins}
            <span className="text-white/30 text-sm font-normal"> treinos em </span>
            {atleta.mesesTreinando}
            <span className="text-white/30 text-sm font-normal"> meses</span>
          </p>
          <p className="text-white/25 text-xs mt-1">
            Média de {Math.round((atleta.totalCheckins / Math.max(1, atleta.mesesTreinando)) * 10) / 10} treinos/mês
          </p>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3 pt-4">
          <p className="text-[10px] text-white/15 uppercase tracking-widest">Perfil público · BlackBelt</p>
          <p className="text-[10px] text-white/10">Dados pessoais protegidos pela LGPD. Apenas informações públicas são exibidas.</p>
        </div>
      </div>
    </div>
  );
}
