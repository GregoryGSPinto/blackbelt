'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trophy, Users, Calendar, History, Flame, Star,
  ChevronDown, Info, ScanLine, CheckCircle, Medal,
  Video, Award, TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { LeaderboardCard, PointsBadge } from '@/components/gamification';
import * as rankingService from '@/lib/api/ranking.service';
import type { RankingEntry, PontoRegra, PontosResumo, CategoriaRanking } from '@/lib/api/contracts';

// ── Tabs ──────────────────────────────────────────────────

type TabId = 'geral' | 'turma' | 'mensal' | 'historico';

const TABS: { id: TabId; label: string; icon: typeof Trophy }[] = [
  { id: 'geral', label: 'Geral', icon: Trophy },
  { id: 'turma', label: 'Minha Turma', icon: Users },
  { id: 'mensal', label: 'Mensal', icon: Calendar },
  { id: 'historico', label: 'Histórico', icon: History },
];

const CATEGORIAS: { id: CategoriaRanking; label: string }[] = [
  { id: 'ADULTO', label: 'Adulto' },
  { id: 'TEEN', label: 'Teen' },
  { id: 'KIDS', label: 'Kids' },
];

// ── Ícone do ponto-regra ──────────────────────────────────

const REGRA_ICONS: Record<string, typeof Trophy> = {
  ScanLine, CheckCircle, Medal, Flame, Video, Calendar, Trophy, Award,
};

function RegraIcon({ icone }: { icone: string }) {
  const Icon = REGRA_ICONS[icone] || Star;
  return <Icon size={16} />;
}

// ── Componente principal ──────────────────────────────────

export default function RankingPage() {
  const { user } = useAuth();

  // State
  const [tab, setTab] = useState<TabId>('geral');
  const [categoria, setCategoria] = useState<CategoriaRanking>('ADULTO');
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [minhaPosicao, setMinhaPosicao] = useState<RankingEntry | null>(null);
  const [pontosResumo, setPontosResumo] = useState<PontosResumo | null>(null);
  const [pontosConfig, setPontosConfig] = useState<PontoRegra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRegras, setShowRegras] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch ranking data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtros: rankingService.RankingFiltros = {
        categoria,
        limite: 30,
      };

      if (tab === 'turma') {
        filtros.turmaId = 'turma-2'; // Mock: turma do aluno logado
      } else if (tab === 'mensal') {
        filtros.periodo = 'MENSAL';
      }

      const [rankingData, posicao, resumo, config] = await Promise.all([
        rankingService.getRanking(filtros),
        rankingService.getMinhaPosicao(),
        rankingService.getPontosResumo(),
        rankingService.getPontosConfig(),
      ]);

      setRanking(rankingData);
      setMinhaPosicao(posicao);
      setPontosResumo(resumo);
      setPontosConfig(config);
    } catch (err) {
      setError(handleServiceError(err, 'Ranking'));
    } finally {
      setLoading(false);
    }
  }, [tab, categoria, retryCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={24} className="text-amber-400" />
            <h1 className="text-3xl font-black text-white">Ranking</h1>
          </div>
          <p className="text-white/40 text-sm">
            Sua posição entre os guerreiros do BlackBelt
          </p>
        </div>

        {/* Meus pontos (resumo) */}
        {pontosResumo && (
          <PointsBadge
            pontos={pontosResumo.total}
            posicao={pontosResumo.posicaoGeral}
            streak={pontosResumo.streakAtual}
            variant="full"
          />
        )}

        {/* Pontos do mês + semana */}
        {pontosResumo && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Este mês</p>
              <p className="text-lg font-bold text-emerald-400">
                +{pontosResumo.esteMes.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Esta semana</p>
              <p className="text-lg font-bold text-blue-400">
                +{pontosResumo.ultimaSemana.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* Categorias (tabs horizontais) */}
        <div className="flex gap-2">
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoria(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                categoria === cat.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tabs (Geral / Turma / Mensal / Histórico) */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-white/35 hover:text-white/55'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] p-4">
          {tab === 'historico' ? (
            <HistoricoView resumo={pontosResumo} />
          ) : (
            <LeaderboardCard
              ranking={ranking}
              minhaPosicao={minhaPosicao ?? undefined}
              loading={loading}
            />
          )}
        </div>

        {/* Como ganhar pontos */}
        <div>
          <button
            onClick={() => setShowRegras(p => !p)}
            className="flex items-center gap-2 w-full py-3 text-left group"
          >
            <Info size={16} className="text-white/30 group-hover:text-white/50 transition-colors" />
            <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
              Como ganhar pontos?
            </span>
            <ChevronDown
              size={14}
              className={`text-white/30 ml-auto transition-transform ${showRegras ? 'rotate-180' : ''}`}
            />
          </button>

          {showRegras && (
            <div className="space-y-2 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
              {pontosConfig.filter(r => r.ativa).map(regra => (
                <div
                  key={regra.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <RegraIcon icone={regra.icone} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80">{regra.nome}</p>
                    <p className="text-[11px] text-white/30 line-clamp-1">{regra.descricao}</p>
                  </div>
                  <span className="text-sm font-bold text-amber-300 shrink-0">
                    +{regra.pontos}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Histórico View ────────────────────────────────────────

function HistoricoView({ resumo }: { resumo: PontosResumo | null }) {
  if (!resumo) {
    return (
      <div className="text-center py-12">
        <History size={48} className="mx-auto text-white/15 mb-4" />
        <p className="text-white/40 text-sm">Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Melhor streak" value={`${resumo.melhorStreak} dias`} icon={Flame} color="text-orange-400" />
        <StatCard label="Streak atual" value={`${resumo.streakAtual} dias`} icon={Flame} color="text-amber-400" />
        <StatCard label="Posição geral" value={`#${resumo.posicaoGeral}`} icon={TrendingUp} color="text-emerald-400" />
        <StatCard label="Posição categoria" value={`#${resumo.posicaoCategoria}`} icon={Trophy} color="text-blue-400" />
      </div>

      {/* Breakdown das fontes */}
      <div>
        <p className="text-xs text-white/30 uppercase tracking-wider mb-3">Origem dos pontos</p>
        <div className="space-y-2">
          {resumo.fontes.map((fonte, i) => {
            const pct = resumo.total > 0 ? (fonte.pontos / resumo.total) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">{fonte.fonte}</span>
                  <span className="text-xs text-white/40">
                    {fonte.pontos.toLocaleString('pt-BR')} pts ({fonte.quantidade}×)
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Trophy;
  color: string;
}) {
  return (
    <div className="rounded-xl p-3 bg-white/[0.03] border border-white/[0.06]">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className={color} />
        <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-lg font-bold text-white">{value}</p>
    </div>
  );
}
