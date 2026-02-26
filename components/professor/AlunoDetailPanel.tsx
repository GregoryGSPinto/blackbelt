// ============================================================
// AlunoDetailPanel — Inline Student Detail for Split View
// ============================================================
// Renders student detail inside the Master-Detail right panel.
// Simplified version of professor-aluno-detalhe for inline use.
// Full page still available via direct navigation on mobile.
//
// Props:
//   alunoId — Student ID to load
//   onClose — Optional close callback
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User, TrendingUp, Award, Calendar,
  MessageSquare, ExternalLink, AlertTriangle,
} from 'lucide-react';
import * as pedagogicoService from '@/lib/api/professor-pedagogico.service';
import type { AlunoPedagogico } from '@/lib/api/professor-pedagogico.service';
import { handleServiceError } from '@/components/shared/DataStates';

import { QuickMessage } from '@/components/shared/QuickMessage';

// ── Client-side cache — avoids re-fetching when toggling between alunos ──
const alunoCache = new Map<string, AlunoPedagogico>();

type Tab = 'visao' | 'progresso' | 'conquistas';

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'visao', label: 'Visão Geral', icon: User },
  { id: 'progresso', label: 'Progresso', icon: TrendingUp },
  { id: 'conquistas', label: 'Conquistas', icon: Award },
];

const NIVEL_COLORS: Record<string, string> = {
  'Branca': '#FFFFFF', 'Cinza': '#9CA3AF', 'Amarela': '#FBBF24',
  'Laranja': '#FB923C', 'Verde': '#4ADE80', 'Azul': '#60A5FA',
  'Roxa': '#A78BFA', 'Marrom': '#A0845C', 'Preta': '#FFFFFF',
};

const STATUS_CONFIG = {
  ativo: { label: 'Ativo', color: '#4ADE80', bg: 'rgba(74,222,128,0.12)' },
  alerta: { label: 'Alerta', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
  ausente: { label: 'Ausente', color: '#F87171', bg: 'rgba(248,113,113,0.12)' },
};

interface Props {
  alunoId: string;
  onClose?: () => void;
}

export function AlunoDetailPanel({ alunoId, onClose }: Props) {
  const [aluno, setAluno] = useState<AlunoPedagogico | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('visao');
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (!alunoId) return;

    // Check cache first — instant load for previously viewed alunos
    const cached = alunoCache.get(alunoId);
    if (cached) {
      setAluno(cached);
      setLoading(false);
      setError(null);
      setActiveTab('visao');
      return;
    }

    setLoading(true);
    setError(null);
    setActiveTab('visao');
    pedagogicoService.getAlunoById(alunoId)
      .then(data => {
        if (!data) { setError('Aluno não encontrado'); return; }
        alunoCache.set(alunoId, data); // Cache for instant re-access
        setAluno(data);
      })
      .catch(err => setError(handleServiceError(err, 'AlunoDetailPanel')))
      .finally(() => setLoading(false));
  }, [alunoId]);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Error
  if (error || !aluno) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle size={24} className="text-red-400 mb-2" />
        <p className="text-sm text-white/40">{error || 'Aluno não encontrado'}</p>
      </div>
    );
  }

  const nivelColor = NIVEL_COLORS[aluno.nivel] || '#FFF';
  const freqPct = aluno.frequencia.presenca30d;
  const freqColor = freqPct >= 80 ? '#4ADE80' : freqPct >= 60 ? '#FBBF24' : '#F87171';

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div
        className="rounded-xl p-4"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {aluno.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold text-white/90 truncate">{aluno.nome}</h2>
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-medium"
                style={{ background: STATUS_CONFIG[aluno.status].bg, color: STATUS_CONFIG[aluno.status].color }}
              >
                {STATUS_CONFIG[aluno.status].label}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-white/40">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: nivelColor }} />
                {aluno.nivel} {aluno.subniveis > 0 && `• ${aluno.subniveis}º subnível`}
              </span>
              <span>{aluno.categoria}</span>
              <span>{aluno.turma}</span>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatBox label="Frequência 30d" value={`${freqPct}%`} color={freqColor} />
          <StatBox label="Sessões mês" value={`${aluno.frequencia.totalSessões}`} color="#60A5FA" />
          <StatBox label="Total sessões" value={`${aluno.frequencia.totalSessões}`} color="#A78BFA" />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setShowMessage(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium
                       bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 transition-colors"
          >
            <MessageSquare size={12} /> Mensagem
          </button>
          <Link
            href={`/professor-aluno-detalhe?id=${alunoId}`}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium
                       bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors"
          >
            <ExternalLink size={12} /> Página Completa
          </Link>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors
              ${activeTab === id
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/20'
                : 'text-white/30 hover:text-white/50 hover:bg-white/5'}`}
          >
            <Icon size={12} /> {label}
          </button>
        ))}
      </div>

      {/* ─── Tab Content ─── */}
      {activeTab === 'visao' && (
        <div className="space-y-3">
          {/* Próxima sessão */}
          <div className="rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <Calendar size={14} className="text-white/20" />
            <div>
              <p className="text-xs font-medium text-white/60">Próxima sessão</p>
              <p className="text-xs text-white/30">
                {aluno.turma}
              </p>
            </div>
          </div>

          {/* Alertas */}
          {aluno.status === 'alerta' && (
            <div className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
              <AlertTriangle size={14} className="text-amber-400/60" />
              <p className="text-xs text-amber-300/60">Frequência abaixo do esperado nos últimos 30 dias</p>
            </div>
          )}
          {aluno.status === 'ausente' && (
            <div className="rounded-xl p-3 flex items-center gap-3"
              style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)' }}>
              <AlertTriangle size={14} className="text-red-400/60" />
              <p className="text-xs text-red-300/60">Ausente há mais de 7 dias</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'progresso' && (
        <div className="space-y-3">
          {aluno.progresso?.modulos?.map((mod) => (
            <div key={mod.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-medium text-white/60">{mod.nome}</span>
                <span className="text-xs text-white/30">{mod.progresso}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${mod.progresso}%`,
                    background: `linear-gradient(90deg, rgba(251,191,36,0.6), rgba(217,175,105,0.8))`,
                  }}
                />
              </div>
              <p className="text-[10px] text-white/15 mt-1">Atualizado: {mod.ultimaAtualizacao}</p>
            </div>
          )) || <p className="text-xs text-white/20 text-center py-4">Nenhum módulo de progresso registrado</p>}
        </div>
      )}

      {activeTab === 'conquistas' && (
        <div className="space-y-2">
          {aluno.conquistas?.length ? (
            aluno.conquistas.map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <span className="text-xl">{m.emoji}</span>
                <div>
                  <p className="text-xs font-medium text-white/60">{m.nome}</p>
                  <p className="text-[10px] text-white/20">{m.dataConquista}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center py-6">
              <Award size={24} className="text-white/10 mb-2" />
              <p className="text-xs text-white/20">Nenhuma conquista ainda</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Message */}
      {showMessage && (
        <QuickMessage
          recipientName={aluno.nome}
          recipientId={alunoId}
          senderName="Instrutor"
          senderId="instrutor-1"
          senderTipo="instrutor"
          onClose={() => setShowMessage(false)}
        />
      )}
    </div>
  );
}

// ── Stat Box ──

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
      <p className="text-base font-bold" style={{ color }}>{value}</p>
      <p className="text-[9px] text-white/25 mt-0.5">{label}</p>
    </div>
  );
}
