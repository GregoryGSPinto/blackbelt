'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Search, Users, ChevronRight, ChevronLeft, AlertTriangle,
  TrendingUp, GraduationCap, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import * as pedagogicoService from '@/lib/api/professor-pedagogico.service';
import type {
  AlunoPedagogico, CategoriaAluno, EstatisticasPedagogicas,
  PaginatedResponse, AlunoQueryParams,
} from '@/lib/api/professor-pedagogico.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { AlunoStatusIndicators } from '@/components/professor/AlunoStatusIndicators';
import { AlunoDetailPanel } from '@/components/professor/AlunoDetailPanel';
import { useResponsive } from '@/contexts/ResponsiveContext';

type Filtro = 'Todos' | CategoriaAluno;

const FILTROS: { label: string; value: Filtro; emoji: string }[] = [
  { label: 'Todos', value: 'Todos', emoji: '📋' },
  { label: 'Adulto', value: 'Adulto', emoji: '🥋' },
  { label: 'Teen', value: 'Teen', emoji: '🤸' },
  { label: 'Kids', value: 'Kids', emoji: '👦' },
];

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: '#4ADE80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.25)' },
  alerta: { label: 'Alerta', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.25)' },
  ausente: { label: 'Ausente', color: '#F87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.25)' },
};

const NIVEL_COLORS: Record<string, string> = {
  'Branca': '#FFFFFF', 'Cinza': '#9CA3AF', 'Amarela': '#FBBF24',
  'Laranja': '#FB923C', 'Verde': '#4ADE80', 'Azul': '#60A5FA',
  'Roxa': '#A78BFA', 'Marrom': '#A0845C', 'Preta': '#FFFFFF',
};

const GRAD_CONFIG = {
  APTO: { label: 'Apto', color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  EM_AVALIACAO: { label: 'Em Avaliação', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  NAO_APTO: { label: '', color: '', bg: '' },
};

const PAGE_SIZE = 20;

export default function ProfessorAlunosPage() {
  // ─── Responsive ───
  const { isTabletOrAbove, isMobile } = useResponsive();

  // ─── State ───
  const [paginatedData, setPaginatedData] = useState<PaginatedResponse<AlunoPedagogico> | null>(null);
  const [stats, setStats] = useState<EstatisticasPedagogicas | null>(null);
  const [alertAlunos, setAlertAlunos] = useState<AlunoPedagogico[]>([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // ─── Split View State (tablet/desktop) ───
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);

  // ─── Query params (drives server-side filtering) ───
  const [filtro, setFiltro] = useState<Filtro>('Todos');
  const [busca, setBusca] = useState('');
  const [debouncedBusca, setDebouncedBusca] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<AlunoQueryParams['sortBy']>('status');
  const [sortOrder, setSortOrder] = useState<AlunoQueryParams['sortOrder']>('asc');

  // ─── Debounce search (300ms) ───
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedBusca(busca);
      setPage(1); // Reset page on search
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [busca]);

  // ─── Reset page when filters change ───
  const handleFiltroChange = useCallback((f: Filtro) => {
    setFiltro(f);
    setPage(1);
  }, []);

  // ─── Initial load (stats + alerts — NOT the list) ───
  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      pedagogicoService.getEstatisticas(),
      pedagogicoService.getAlunosBaixaFrequencia(60),
    ])
      .then(([statsData, alertData]) => {
        setStats(statsData);
        setAlertAlunos(alertData);
      })
      .catch((err) => setError(handleServiceError(err, 'ProfAlunosStats')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  // ─── Paginated list (reacts to page/filtro/busca/sort changes) ───
  useEffect(() => {
    setListLoading(true);
    const params: AlunoQueryParams = {
      page,
      limit: PAGE_SIZE,
      sortBy,
      sortOrder,
    };
    if (filtro !== 'Todos') params.categoria = filtro;
    if (debouncedBusca.trim()) params.search = debouncedBusca.trim();

    pedagogicoService.getAlunosPaginated(params)
      .then(setPaginatedData)
      .catch((err) => setError(handleServiceError(err, 'ProfAlunosList')))
      .finally(() => setListLoading(false));
  }, [page, filtro, debouncedBusca, sortBy, sortOrder, retryCount]);

  const alunos = paginatedData?.data ?? [];
  const totalAlunos = paginatedData?.total ?? 0;
  const totalPages = paginatedData?.totalPages ?? 1;

  // ─── Search Registration ───
  const searchItems = useMemo<SearchItem[]>(() => {
    return alunos.map(a => ({
      id: `aluno-ped-${a.id}`,
      label: a.nome,
      sublabel: `${a.categoria} · Nível ${a.nivel} · ${a.frequencia.presenca30d}% presença`,
      categoria: 'Aluno',
      icon: a.avatar,
      href: `/professor-aluno-detalhe?id=${a.id}`,
      keywords: [a.categoria, a.nivel, a.turma, a.status],
    }));
  }, [alunos]);
  useSearchRegistration('professor-alunos', searchItems);

  // ─── Aluno click handler (split view on tablet+) ───
  const handleAlunoClick = useCallback((id: string) => {
    setSelectedAlunoId(id);
  }, []);

  if (loading) {
    return <PageSkeleton variant="list" />;
  }
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;

  // ─── Master list content (used both in split and stack modes) ───
  const masterContent = (
    <div className={`space-y-6 ${isMobile ? 'pb-32' : 'pb-4 px-4'}`}>
      {/* ═══ Header ═══ */}
      <div className="prof-enter-1">
        <h1 className="text-2xl md:text-3xl font-bold text-white/90 mb-1">Alunos</h1>
        <p className="text-white/40 text-sm">
          Visão pedagógica completa — {stats?.totalAlunos ?? 0} alunos ativos
        </p>
      </div>

      {/* ═══ Stats Row ═══ */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 prof-enter-2">
          {[
            { label: 'Total', value: stats.totalAlunos, icon: Users, color: '#D9AF69' },
            { label: 'Frequência', value: `${stats.frequenciaMedia}%`, icon: TrendingUp, color: '#4ADE80' },
            { label: 'Baixa Freq.', value: stats.alunosBaixaFrequencia, icon: AlertTriangle, color: '#F87171' },
            { label: 'Aptos Grad.', value: stats.alunosAptoGraduacao, icon: GraduationCap, color: '#A78BFA' },
          ].map((stat, i) => (
            <div key={i} className="prof-glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={16} style={{ color: stat.color }} />
                <span className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className="text-2xl font-bold prof-stat-value">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Categorias ═══ */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 prof-enter-2">
          {stats.alunosPorCategoria.map(c => (
            <button
              key={c.categoria}
              onClick={() => handleFiltroChange(c.categoria)}
              className="prof-glass-card p-3 text-center transition-all"
              style={{
                borderColor: filtro === c.categoria ? 'rgba(217,175,105,0.4)' : undefined,
                background: filtro === c.categoria ? 'rgba(217,175,105,0.08)' : undefined,
              }}
            >
              <span className="text-xl font-bold prof-stat-value">{c.total}</span>
              <p className="text-white/40 text-xs mt-0.5">{c.categoria}</p>
            </button>
          ))}
        </div>
      )}

      {/* ═══ Filtros + Busca ═══ */}
      <div className="prof-enter-3 space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, nivel ou turma..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm text-white placeholder:text-white/25 outline-none transition-all focus:ring-1 focus:ring-amber-500/30"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          {listLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
            </div>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {FILTROS.map(f => (
            <button
              key={f.value}
              onClick={() => handleFiltroChange(f.value)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{
                background: filtro === f.value ? 'rgba(217,175,105,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${filtro === f.value ? 'rgba(217,175,105,0.35)' : 'rgba(255,255,255,0.06)'}`,
                color: filtro === f.value ? '#D9AF69' : 'rgba(255,255,255,0.5)',
              }}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Alertas pedagógicos ═══ */}
      {filtro === 'Todos' && alertAlunos.length > 0 && (
        <div className="prof-enter-4 rounded-2xl p-4" style={{
          background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)',
        }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-red-300 text-sm font-medium">Atenção Pedagógica</span>
            <span className="ml-auto text-white/20 text-[10px]">{alertAlunos.length} aluno(s)</span>
          </div>
          <div className="space-y-2">
            {alertAlunos.slice(0, 3).map(a => (
              <div key={a.id} role="button" tabIndex={0}
                onClick={() => isMobile ? (window.location.href = `/professor-aluno-detalhe?id=${a.id}`) : handleAlunoClick(a.id)}
                onKeyDown={e => e.key === 'Enter' && (isMobile ? (window.location.href = `/professor-aluno-detalhe?id=${a.id}`) : handleAlunoClick(a.id))}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all hover:bg-white/5 w-full text-left cursor-pointer ${
                  selectedAlunoId === a.id && isTabletOrAbove ? 'bg-amber-500/10 border border-amber-500/20' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{a.avatar}</span>
                  <div>
                    <p className="text-white/80 text-sm font-medium">{a.nome}</p>
                    <AlunoStatusIndicators
                      presenca30d={a.frequencia.presenca30d}
                      statusPagamento={a.statusPagamento}
                      aptoGraduacao={a.aptoGraduacao}
                      ultimaSessao={a.frequencia.ultimaSessao}
                      compact
                    />
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{ background: STATUS_CONFIG[a.status].bg, color: STATUS_CONFIG[a.status].color, border: `1px solid ${STATUS_CONFIG[a.status].border}` }}>
                  {STATUS_CONFIG[a.status].label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Lista de Alunos (server-side paginated) ═══ */}
      <div className="space-y-2 prof-enter-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/30 text-xs uppercase tracking-wider">
            {totalAlunos} aluno{totalAlunos !== 1 ? 's' : ''}
            {totalPages > 1 && ` · Página ${page} de ${totalPages}`}
          </span>
        </div>

        {alunos.length === 0 && !listLoading && (
          <div className="prof-glass-card p-8 text-center">
            <Search size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">Nenhum aluno encontrado.</p>
          </div>
        )}

        {alunos.map(aluno => {
          const gradCfg = GRAD_CONFIG[aluno.statusGraduacao];
          const isSelected = selectedAlunoId === aluno.id && isTabletOrAbove;
          const cardClass = `prof-glass-card block p-4 active:scale-[0.99] cursor-pointer transition-all ${
            isSelected
              ? 'border-[rgba(217,175,105,0.4)] bg-[rgba(217,175,105,0.06)]'
              : 'hover:border-[rgba(217,175,105,0.25)]'
          }`;

          // Mobile → navigate to detail page; Tablet+ → select in panel
          const handleClick = () => {
            if (isMobile) {
              window.location.href = `/professor-aluno-detalhe?id=${aluno.id}`;
            } else {
              handleAlunoClick(aluno.id);
            }
          };

          return (
            <div key={aluno.id} role="button" tabIndex={0} onClick={handleClick}
              onKeyDown={e => e.key === 'Enter' && handleClick()}
              className={cardClass}
              aria-selected={isSelected}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>
                  {aluno.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white/90 font-semibold text-sm truncate">{aluno.nome}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: STATUS_CONFIG[aluno.status].bg, color: STATUS_CONFIG[aluno.status].color }}>
                      {STATUS_CONFIG[aluno.status].label}
                    </span>
                    {aluno.statusGraduacao !== 'NAO_APTO' && gradCfg.label && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                        style={{ background: gradCfg.bg, color: gradCfg.color }}>
                        {gradCfg.label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/35">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: NIVEL_COLORS[aluno.nivel] || '#FFF', border: aluno.nivel === 'Branca' ? '1px solid rgba(255,255,255,0.3)' : 'none' }} />
                      {aluno.nivel}
                      {aluno.subniveis > 0 && <span className="text-white/20">({aluno.subniveis}°)</span>}
                    </span>
                    <span>·</span>
                    <span>{aluno.categoria}</span>
                    <span className="hidden sm:inline">·</span>
                    <span className="hidden sm:inline">{aluno.turma}</span>
                  </div>
                </div>

                {/* Desktop metrics */}
                <div className="hidden md:flex items-center gap-5 flex-shrink-0">
                  <div className="text-center w-16">
                    <span className="text-sm font-bold" style={{ color: aluno.frequencia.presenca30d >= 80 ? '#4ADE80' : aluno.frequencia.presenca30d >= 60 ? '#FBBF24' : '#F87171' }}>
                      {aluno.frequencia.presenca30d}%
                    </span>
                    <p className="text-white/25 text-[10px]">Freq.</p>
                  </div>
                  <div className="text-center w-16">
                    <span className="text-sm font-bold text-white/70">{aluno.progresso.geral}%</span>
                    <p className="text-white/25 text-[10px]">Progr.</p>
                  </div>
                  <div className="text-center w-12">
                    <span className="text-sm font-bold text-amber-400">{aluno.conquistas.length}</span>
                    <p className="text-white/25 text-[10px]">Med.</p>
                  </div>
                </div>

                {/* Mobile metrics */}
                <div className="flex md:hidden items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-bold" style={{ color: aluno.frequencia.presenca30d >= 80 ? '#4ADE80' : aluno.frequencia.presenca30d >= 60 ? '#FBBF24' : '#F87171' }}>
                    {aluno.frequencia.presenca30d}%
                  </span>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${aluno.progresso.geral}%`,
                    background: `linear-gradient(90deg, ${aluno.progresso.geral >= 70 ? '#4ADE80' : aluno.progresso.geral >= 40 ? '#FBBF24' : '#F87171'}, ${aluno.progresso.geral >= 70 ? '#22D3EE' : aluno.progresso.geral >= 40 ? '#FB923C' : '#EF4444'})`,
                  }} />
                </div>
                <span className="text-white/20 text-[10px] w-8 text-right">{aluno.progresso.geral}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ Pagination Controls ═══ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 prof-enter-6">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="p-2 rounded-xl transition-all disabled:opacity-20"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronsLeft size={16} className="text-white/50" />
          </button>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-xl transition-all disabled:opacity-20"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronLeft size={16} className="text-white/50" />
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className="w-9 h-9 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: pageNum === page ? 'rgba(217,175,105,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${pageNum === page ? 'rgba(217,175,105,0.35)' : 'transparent'}`,
                    color: pageNum === page ? '#D9AF69' : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-xl transition-all disabled:opacity-20"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronRight size={16} className="text-white/50" />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="p-2 rounded-xl transition-all disabled:opacity-20"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <ChevronsRight size={16} className="text-white/50" />
          </button>
        </div>
      )}
    </div>
  );

  // ─── Render: Split View on tablet+, stack on mobile ───
  if (isTabletOrAbove) {
    return (
      <div className="flex h-[calc(100vh-120px)]">
        {/* Master (list) — fixed width, independent scroll */}
        <div
          className="flex-shrink-0 overflow-y-auto overscroll-contain border-r border-white/[0.06]"
          style={{
            width: '420px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
          {masterContent}
        </div>

        {/* Detail — fills remaining space */}
        <div
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          }}
        >
          {selectedAlunoId ? (
            <div className="p-5">
              <AlunoDetailPanel alunoId={selectedAlunoId} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <Users size={24} className="text-white/15" />
                </div>
                <p className="text-sm text-white/20">Selecione um aluno para ver detalhes</p>
                <p className="text-xs text-white/10 mt-1">Clique em qualquer aluno da lista</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Mobile: Stack (original behavior) ───
  return masterContent;
}
