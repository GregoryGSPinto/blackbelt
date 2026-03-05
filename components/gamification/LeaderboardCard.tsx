'use client';

import { useMemo } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus,
  Flame, Crown,
} from 'lucide-react';
import type { RankingEntry } from '@/lib/api/contracts';

// ── Helpers ───────────────────────────────────────────────

/** Retorna cor CSS da nivel BlackBelt */
function nivelCor(nivel: string): string {
  const f = nivel.toLowerCase();
  if (f.includes('preta')) return '#1a1a1a';
  if (f.includes('marrom')) return '#6B3A2A';
  if (f.includes('roxa')) return '#7C3AED';
  if (f.includes('azul')) return '#2563EB';
  if (f.includes('verde')) return '#16A34A';
  if (f.includes('laranja')) return '#EA580C';
  if (f.includes('amarela')) return '#EAB308';
  if (f.includes('cinza')) return '#6B7280';
  return '#E5E7EB'; // branca
}

function nivelGradient(nivel: string): string {
  const cor = nivelCor(nivel);
  return `linear-gradient(135deg, ${cor}, ${cor}88)`;
}

/** Cor do indicador de variação */
function variacaoCor(v: number) {
  if (v > 0) return 'text-emerald-400';
  if (v < 0) return 'text-red-400';
  return 'text-white/30';
}

function VariacaoIcon({ variacao }: { variacao: number }) {
  if (variacao > 0) return <TrendingUp size={12} />;
  if (variacao < 0) return <TrendingDown size={12} />;
  return <Minus size={12} />;
}

// ── Conquista do pódium ─────────────────────────────────────

const MEDAL_COLORS = {
  1: { bg: 'from-amber-400 to-yellow-600', ring: 'ring-amber-400/30', text: 'text-amber-900' },
  2: { bg: 'from-gray-300 to-gray-500', ring: 'ring-gray-300/30', text: 'text-gray-800' },
  3: { bg: 'from-amber-600 to-amber-800', ring: 'ring-amber-600/30', text: 'text-amber-100' },
} as const;

function PodiumCard({
  entry,
  posicao,
  isHighlighted,
}: {
  entry: RankingEntry;
  posicao: 1 | 2 | 3;
  isHighlighted: boolean;
}) {
  const medal = MEDAL_COLORS[posicao];
  // Heights: 1st is tallest, then 2nd, then 3rd
  const heights = { 1: 'h-28', 2: 'h-24', 3: 'h-20' };
  const sizes = { 1: 'w-16 h-16', 2: 'w-14 h-14', 3: 'w-12 h-12' };
  const iconSizes = { 1: 20, 2: 18, 3: 16 };

  return (
    <div className={`flex flex-col items-center gap-2 ${posicao === 1 ? 'order-2' : posicao === 2 ? 'order-1' : 'order-3'}`}>
      {/* Avatar + Medal */}
      <div className="relative">
        <div
          className={`${sizes[posicao]} rounded-full ring-2 ${medal.ring} flex items-center justify-center font-bold text-white overflow-hidden ${isHighlighted ? 'ring-amber-400 ring-2' : ''}`}
          style={{ background: nivelGradient(entry.nivel) }}
        >
          {entry.avatar ? (
            <img src={entry.avatar} alt={entry.nome} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{entry.nome.charAt(0)}</span>
          )}
        </div>
        {/* Medal badge */}
        <div
          className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center shadow-lg`}
        >
          {posicao === 1 ? (
            <Crown size={12} className={medal.text} />
          ) : (
            <span className={`text-[10px] font-black ${medal.text}`}>{posicao}</span>
          )}
        </div>
      </div>

      {/* Name */}
      <p className={`text-xs font-semibold text-center line-clamp-1 max-w-[80px] ${isHighlighted ? 'text-amber-300' : 'text-white/80'}`}>
        {entry.nome.split(' ')[0]}
      </p>

      {/* Podium pillar */}
      <div
        className={`${heights[posicao]} w-20 rounded-t-xl bg-gradient-to-b flex flex-col items-center justify-start pt-2 ${
          posicao === 1
            ? 'from-amber-500/20 to-amber-600/5 border-t-2 border-amber-500/30'
            : posicao === 2
            ? 'from-gray-400/15 to-gray-500/5 border-t-2 border-gray-400/20'
            : 'from-amber-700/15 to-amber-800/5 border-t-2 border-amber-700/20'
        }`}
      >
        <span className="text-lg font-black text-white">
          {entry.pontos.toLocaleString('pt-BR')}
        </span>
        <span className="text-[9px] text-white/40 uppercase">pts</span>
      </div>
    </div>
  );
}

// ── Lista scrollável ──────────────────────────────────────

function ListEntry({
  entry,
  isMe,
}: {
  entry: RankingEntry;
  isMe: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
        isMe
          ? 'bg-amber-500/10 border border-amber-500/20'
          : 'bg-white/[0.03] hover:bg-white/[0.06]'
      }`}
    >
      {/* Posição */}
      <div className="w-8 text-center">
        <span className={`text-sm font-bold ${isMe ? 'text-amber-300' : 'text-white/50'}`}>
          {entry.posicao}
        </span>
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
        style={{ background: nivelGradient(entry.nivel) }}
      >
        {entry.nome.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold truncate ${isMe ? 'text-amber-200' : 'text-white/90'}`}>
          {entry.nome}
          {isMe && <span className="ml-1.5 text-[10px] text-amber-400/70 uppercase">(você)</span>}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full border border-white/20"
            style={{ backgroundColor: nivelCor(entry.nivel) }}
          />
          <span className="text-[11px] text-white/40">{entry.nivel}</span>
          {entry.streakAtual > 0 && (
            <span className="flex items-center gap-0.5 text-[11px] text-orange-400/70">
              <Flame size={10} /> {entry.streakAtual}d
            </span>
          )}
        </div>
      </div>

      {/* Pontos */}
      <div className="text-right">
        <span className={`text-sm font-bold ${isMe ? 'text-amber-300' : 'text-white'}`}>
          {entry.pontos.toLocaleString('pt-BR')}
        </span>
        <div className={`flex items-center justify-end gap-0.5 text-[11px] ${variacaoCor(entry.variacaoSemana)}`}>
          <VariacaoIcon variacao={entry.variacaoSemana} />
          <span>{Math.abs(entry.variacaoSemana)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────

interface LeaderboardCardProps {
  ranking: RankingEntry[];
  minhaPosicao?: RankingEntry;
  loading?: boolean;
}

export default function LeaderboardCard({
  ranking,
  minhaPosicao,
  loading = false,
}: LeaderboardCardProps) {
  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);
  const restante = useMemo(() => ranking.slice(3), [ranking]);
  const meuId = minhaPosicao?.alunoId;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-center gap-4 items-end h-48">
          <div className="w-20 h-32 bg-white/5 rounded-t-xl" />
          <div className="w-20 h-40 bg-white/5 rounded-t-xl" />
          <div className="w-20 h-28 bg-white/5 rounded-t-xl" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy size={48} className="mx-auto text-white/15 mb-4" />
        <p className="text-white/40 text-sm">Nenhum dado de ranking disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pódium Top 3 */}
      {top3.length >= 3 && (
        <div className="flex justify-center items-end gap-3 px-2 pt-4 pb-2">
          {[top3[1], top3[0], top3[2]].map((entry, i) => {
            const pos = (i === 0 ? 2 : i === 1 ? 1 : 3) as 1 | 2 | 3;
            return (
              <PodiumCard
                key={entry.alunoId}
                entry={entry}
                posicao={pos}
                isHighlighted={entry.alunoId === meuId}
              />
            );
          })}
        </div>
      )}

      {/* Minha posição (se fora do top 3) */}
      {minhaPosicao && minhaPosicao.posicao > 3 && (
        <div className="px-1">
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2 px-3">
            Sua posição
          </p>
          <ListEntry entry={minhaPosicao} isMe={true} />
        </div>
      )}

      {/* Lista restante */}
      {restante.length > 0 && (
        <div className="space-y-1.5 px-1 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {restante.map(entry => (
            <ListEntry
              key={entry.alunoId}
              entry={entry}
              isMe={entry.alunoId === meuId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
