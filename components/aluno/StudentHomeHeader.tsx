// ============================================================
// StudentHomeHeader — Student Dashboard Section
// ============================================================
// Inserted ABOVE the video carousels on the student home page.
// Sections:
//   a) "Next Class" card with animated countdown
//   b) Animated frequency bar with monthly goal + trend
//   c) Mini recent achievements card
//
// Mobile-first, responsive, skeleton-ready.
// ============================================================
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Clock, MapPin, User, Trophy, Target, ChevronRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { AlunoHomeData } from '@/lib/api/aluno-home.service';
import { Bone } from '@/components/shared/SkeletonLoader';

// ── Styles ──
const HEADER_STYLES = `
  @keyframes freq-bar-grow {
    from { width: 0; }
  }
  @keyframes achievement-pop {
    from { opacity: 0; transform: scale(0.8) translateY(8px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes countdown-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
`;

// ══════════════════════════════════════════════════════════════
// NEXT CLASS CARD
// ══════════════════════════════════════════════════════════════

function NextClassCard({ aula }: { aula: AlunoHomeData['proximaSessao'] }) {
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!aula) return;

    const update = () => {
      const now = new Date().getTime();
      const target = new Date(aula.dataHoraInicio).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdown('Agora!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setCountdown(`${days}d ${hours % 24}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}min`);
      } else {
        setCountdown(`${minutes}min`);
      }
    };

    update();
    const interval = setInterval(update, 30_000); // update every 30s
    return () => clearInterval(interval);
  }, [aula]);

  if (!aula) {
    return (
      <div className="rounded-2xl p-4 md:p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-white/30 text-sm text-center py-2">Nenhuma sessão agendada</p>
      </div>
    );
  }

  return (
    <div
      data-tour="proxima-sessao"
      className="rounded-2xl p-4 md:p-5 group hover:scale-[1.01] transition-transform duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-blue-400/60 text-[10px] tracking-[0.2em] uppercase font-semibold mb-1.5">
            Próxima Aula
          </p>
          <h3 className="text-white font-bold text-lg leading-tight truncate">{aula.turmaNome}</h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-white/40 text-xs">
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-blue-400/60" />
              {aula.dia} · {aula.horario} – {aula.horarioFim}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-blue-400/60" />
              {aula.instrutor}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-blue-400/60" />
              {aula.local}
            </span>
          </div>
        </div>

        {/* Countdown */}
        <div className="flex-shrink-0 text-right">
          <div
            className="text-2xl md:text-3xl font-bold text-blue-400 tabular-nums leading-none"
            style={{ animation: countdown === 'Agora!' ? 'countdown-pulse 1s ease-in-out infinite' : undefined }}
          >
            {countdown}
          </div>
          <p className="text-blue-400/40 text-[10px] mt-1 tracking-wide">
            {countdown === 'Agora!' ? 'em andamento' : 'para começar'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FREQUENCY BAR
// ══════════════════════════════════════════════════════════════

function FrequencyBar({ freq }: { freq: AlunoHomeData['frequencia'] }) {
  const faltam = Math.max(0, freq.metaMensal - freq.sessõesAssistidas);
  const percentClamp = Math.min(100, freq.percentual);

  // Color based on percentage
  const barColor = percentClamp >= 80
    ? 'from-emerald-500 to-emerald-400'
    : percentClamp >= 50
    ? 'from-yellow-500 to-yellow-400'
    : 'from-red-500 to-red-400';

  const TrendIcon = freq.tendencia === 'up'
    ? TrendingUp
    : freq.tendencia === 'down'
    ? TrendingDown
    : Minus;

  const trendColor = freq.tendencia === 'up'
    ? 'text-emerald-400'
    : freq.tendencia === 'down'
    ? 'text-red-400'
    : 'text-white/30';

  const trendLabel = freq.tendencia === 'up'
    ? `+${freq.variacao}%`
    : freq.tendencia === 'down'
    ? `-${Math.abs(freq.variacao)}%`
    : '=';

  return (
    <div
      data-tour="frequencia"
      className="rounded-2xl p-4 md:p-5"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs font-semibold tracking-wide uppercase flex items-center gap-2">
          <Target size={13} className="text-emerald-400/60" />
          Frequência Mensal
        </p>
        <div className={`flex items-center gap-1 ${trendColor}`}>
          <TrendIcon size={13} />
          <span className="text-xs font-semibold">{trendLabel}</span>
          <span className="text-white/20 text-[10px] ml-1">vs mês anterior</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${barColor} transition-all duration-1000`}
          style={{ width: `${percentClamp}%`, animation: 'freq-bar-grow 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        {/* Goal marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/20"
          style={{ left: '100%', transform: 'translateX(-2px)' }}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between mt-2.5">
        <span className="text-white font-bold text-sm">
          {freq.sessõesAssistidas}<span className="text-white/30 font-normal">/{freq.metaMensal} sessões</span>
        </span>
        {faltam > 0 ? (
          <span className="text-white/40 text-xs">
            Faltam <span className="text-white/70 font-semibold">{faltam}</span> para a meta!
          </span>
        ) : (
          <span className="text-emerald-400 text-xs font-semibold">
            Meta atingida! 🎉
          </span>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MINI ACHIEVEMENTS
// ══════════════════════════════════════════════════════════════

function MiniAchievements({
  conquistas,
  proximaMeta,
  posicao,
  pontos,
}: {
  conquistas: AlunoHomeData['conquistasRecentes'];
  proximaMeta: string;
  posicao: number;
  pontos: number;
}) {
  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.08), rgba(168,85,247,0.02))',
        border: '1px solid rgba(168,85,247,0.12)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/50 text-xs font-semibold tracking-wide uppercase flex items-center gap-2">
          <Trophy size={13} className="text-purple-400/60" />
          Conquistas
        </p>
        <a
          href="/ranking"
          className="flex items-center gap-1 text-purple-400/60 hover:text-purple-400 transition-colors text-xs"
        >
          Ver tudo <ChevronRight size={12} />
        </a>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold text-lg">#{posicao}</span>
          <span className="text-white/30 text-[10px]">ranking</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold text-lg">{pontos.toLocaleString('pt-BR')}</span>
          <span className="text-white/30 text-[10px]">pontos</span>
        </div>
      </div>

      {/* Recent achievements */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {conquistas.slice(0, 3).map((c, i) => (
          <div
            key={c.id}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              animation: `achievement-pop 400ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 100}ms both`,
            }}
          >
            <span className="text-lg">{c.emoji}</span>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate max-w-[120px]">{c.nome}</p>
              <p className="text-white/25 text-[10px]">
                {new Date(c.dataConquista).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Next goal */}
      {proximaMeta && (
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-white/30 text-[10px] uppercase tracking-wider mb-0.5">Próxima meta</p>
          <p className="text-white/60 text-xs">{proximaMeta}</p>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SKELETON
// ══════════════════════════════════════════════════════════════

function StudentHomeHeaderSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone w="w-20" h="h-3" className="mb-2" />
        <Bone w="w-40" h="h-6" className="mb-3" />
        <div className="flex gap-4">
          <Bone w="w-28" h="h-3" />
          <Bone w="w-24" h="h-3" />
        </div>
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone w="w-32" h="h-3" className="mb-3" />
        <Bone w="w-full" h="h-3" rounded="rounded-full" className="mb-2" />
        <Bone w="w-24" h="h-3" />
      </div>
      <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone w="w-24" h="h-3" className="mb-3" />
        <div className="flex gap-2">
          <Bone w="w-32" h="h-10" rounded="rounded-xl" />
          <Bone w="w-32" h="h-10" rounded="rounded-xl" />
          <Bone w="w-32" h="h-10" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════

interface StudentHomeHeaderProps {
  data: AlunoHomeData | null;
  loading: boolean;
}

export function StudentHomeHeader({ data, loading }: StudentHomeHeaderProps) {
  if (loading || !data) {
    return (
      <div className="px-4 md:px-8 mb-6">
        <style dangerouslySetInnerHTML={{ __html: HEADER_STYLES }} />
        <StudentHomeHeaderSkeleton />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 mb-6">
      <style dangerouslySetInnerHTML={{ __html: HEADER_STYLES }} />
      <div className="space-y-3 max-w-4xl">
        <NextClassCard aula={data.proximaSessao} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FrequencyBar freq={data.frequencia} />
          <MiniAchievements
            conquistas={data.conquistasRecentes}
            proximaMeta={data.proximaMeta}
            posicao={data.posicaoRanking}
            pontos={data.pontosTotal}
          />
        </div>
      </div>
    </div>
  );
}
