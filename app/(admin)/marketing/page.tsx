'use client';

import { useState } from 'react';
import {
  Megaphone, Instagram, TrendingUp, AlertTriangle, Calendar, Gift,
  Copy, Check, Users, BarChart3, Heart, MessageSquare,
} from 'lucide-react';
import {
  CAMPANHAS, REDES_SOCIAIS, ALUNOS_EM_RISCO, INDICACOES,
  type Campanha,
} from '@/lib/__mocks__/unit-owner.mock';

// ============================================================
// MARKETING E CRESCIMENTO — Unit Owner
// ============================================================

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  ativa: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Ativa' },
  encerrada: { bg: 'rgba(107,114,128,0.15)', text: '#9ca3af', label: 'Encerrada' },
  agendada: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6', label: 'Agendada' },
};

const INDICACAO_STATUS: Record<string, { bg: string; text: string; label: string }> = {
  pendente: { bg: 'rgba(251,191,36,0.15)', text: '#fbbf24', label: 'Pendente' },
  convertido: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e', label: 'Convertido' },
  perdido: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444', label: 'Perdido' },
};

const SOCIAL_ICONS: Record<string, typeof Instagram> = {
  Instagram,
  Facebook: Users,
  TikTok: TrendingUp,
  YouTube: BarChart3,
};

const SUGESTOES_POST = [
  { icon: '🥋', texto: 'Poste sobre: graduacao de faixa dos alunos' },
  { icon: '📢', texto: 'Nova turma aberta — convide seguidores para aula experimental' },
  { icon: '🏆', texto: 'Resultados dos alunos em competicoes recentes' },
  { icon: '💪', texto: 'Bastidores do treino — mostre a rotina da academia' },
];

const CALENDARIO_SEMANAL = [
  { dia: 'Segunda', tema: 'Dica tecnica', desc: 'Poste um video curto com uma tecnica da semana', icon: MessageSquare },
  { dia: 'Quarta', tema: 'Bastidores', desc: 'Stories mostrando o dia a dia da academia', icon: Heart },
  { dia: 'Sexta', tema: 'Resultados alunos', desc: 'Depoimento ou conquista de um aluno', icon: TrendingUp },
  { dia: 'Sabado', tema: 'Humor / meme', desc: 'Conteudo leve e compartilhavel sobre artes marciais', icon: Gift },
];

const cardStyle = {
  background: 'var(--card-bg)',
  border: '1px solid var(--card-border)',
  borderRadius: 12,
};

const EMPTY_CAMPANHA: Omit<Campanha, 'id' | 'usados' | 'receitaGerada'> = {
  nome: '',
  tipo: '',
  dataInicio: '',
  dataFim: '',
  desconto: '',
  codigo: '',
  limiteUso: 0,
  status: 'agendada',
};

export default function MarketingPage() {
  const [campanhas, setCampanhas] = useState<Campanha[]>(CAMPANHAS);
  const [showModal, setShowModal] = useState(false);
  const [novaCampanha, setNovaCampanha] = useState(EMPTY_CAMPANHA);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ── Copiar codigo ──
  const handleCopy = (codigo: string, id: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ── Criar campanha ──
  const handleCreate = () => {
    if (!novaCampanha.nome || !novaCampanha.codigo) return;
    const nova: Campanha = {
      ...novaCampanha,
      id: String(Date.now()),
      usados: 0,
      receitaGerada: 0,
    };
    setCampanhas((prev) => [...prev, nova]);
    setNovaCampanha(EMPTY_CAMPANHA);
    setShowModal(false);
  };

  // ── Indicacoes stats ──
  const totalIndicacoes = INDICACOES.length;
  const convertidas = INDICACOES.filter((i) => i.status === 'convertido').length;
  const taxaConversao = totalIndicacoes > 0 ? ((convertidas / totalIndicacoes) * 100).toFixed(1) : '0';

  // ── Severity color for alunos em risco ──
  const getSeverityColor = (dias: number) => {
    if (dias > 10) return { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };
    if (dias > 7) return { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' };
    return { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#3b82f6' };
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 32 }}>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Marketing e Crescimento
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Campanhas, redes sociais, retencao e programa de indicacoes da sua academia
          </p>
        </div>

        {/* ══════════════════════════════════════════════════════════
            1. CAMPANHAS ATIVAS
           ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Megaphone size={20} style={{ color: 'var(--text-primary)' }} />
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Campanhas Ativas
              </h2>
            </div>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              + Nova Campanha
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {campanhas.map((c) => {
              const st = STATUS_COLORS[c.status];
              const progresso = c.limiteUso > 0 ? (c.usados / c.limiteUso) * 100 : 0;
              return (
                <div key={c.id} className="rounded-xl" style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.nome}</h3>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{c.tipo}</span>
                    </div>
                    <span style={{
                      background: st.bg,
                      color: st.text,
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: 9999,
                    }}>
                      {st.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Periodo</span>
                      <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                        {c.dataInicio} - {c.dataFim}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Desconto</span>
                      <span className="text-xs font-semibold" style={{ color: '#22c55e' }}>{c.desconto}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Codigo</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <code style={{
                          background: 'rgba(59,130,246,0.1)',
                          color: '#60a5fa',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                        }}>
                          {c.codigo}
                        </code>
                        <button
                          onClick={() => handleCopy(c.codigo, c.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                          title="Copiar codigo"
                        >
                          {copiedId === c.id
                            ? <Check size={14} style={{ color: '#22c55e' }} />
                            : <Copy size={14} style={{ color: 'var(--text-secondary)' }} />}
                        </button>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Uso</span>
                        <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                          {c.usados}/{c.limiteUso}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{
                          width: `${Math.min(progresso, 100)}%`,
                          height: '100%',
                          borderRadius: 3,
                          background: progresso >= 80 ? '#f59e0b' : '#3b82f6',
                          transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Receita gerada</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        R$ {c.receitaGerada.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            2. REDES SOCIAIS
           ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Instagram size={20} style={{ color: 'var(--text-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Redes Sociais
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            {REDES_SOCIAIS.map((rs) => {
              const Icon = SOCIAL_ICONS[rs.nome] || Users;
              return (
                <div key={rs.nome} className="rounded-xl" style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <Icon size={22} style={{ color: '#3b82f6' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rs.nome}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Seguidores</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {rs.seguidores.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>Engajamento</span>
                      <span className="text-sm font-semibold" style={{ color: rs.engajamento >= 3 ? '#22c55e' : '#f59e0b' }}>
                        {rs.engajamento}%
                      </span>
                    </div>
                    <a
                      href={rs.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', fontSize: 12, marginTop: 4, textDecoration: 'none' }}
                    >
                      Acessar perfil →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sugestoes de Post */}
          <div className="rounded-xl" style={{ ...cardStyle, padding: 20 }}>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 12 }}>
              Sugestoes de Post
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
              {SUGESTOES_POST.map((s, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(59,130,246,0.06)',
                    border: '1px solid rgba(59,130,246,0.15)',
                    borderRadius: 8,
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{s.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            3. CALENDARIO DE CONTEUDO
           ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calendar size={20} style={{ color: 'var(--text-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Calendario de Conteudo
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16 }}>
            {CALENDARIO_SEMANAL.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.dia} className="rounded-xl" style={{ ...cardStyle, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon size={18} style={{ color: '#8b5cf6' }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.dia}</span>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(139,92,246,0.12)',
                      color: '#a78bfa',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 10px',
                      borderRadius: 9999,
                      marginBottom: 8,
                    }}
                  >
                    {item.tema}
                  </span>
                  <p className="text-xs font-normal" style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            4. RETENCAO — ALUNOS EM RISCO
           ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <AlertTriangle size={20} style={{ color: '#f59e0b' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Retencao — Alunos em Risco
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {ALUNOS_EM_RISCO.map((aluno) => {
              const severity = getSeverityColor(aluno.diasSemVir);
              return (
                <div
                  key={aluno.id}
                  className="rounded-xl"
                  style={{
                    ...cardStyle,
                    borderLeft: `4px solid ${severity.text}`,
                    padding: 20,
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div>
                      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{aluno.nome}</h3>
                      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{aluno.motivo}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <span
                        style={{
                          background: severity.bg,
                          color: severity.text,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: 9999,
                        }}
                      >
                        {aluno.diasSemVir} dias sem vir
                      </span>
                      {aluno.planoVence && (
                        <span
                          style={{
                            background: 'rgba(251,191,36,0.12)',
                            color: '#fbbf24',
                            fontSize: 11,
                            fontWeight: 600,
                            padding: '2px 10px',
                            borderRadius: 9999,
                          }}
                        >
                          Plano vence: {aluno.planoVence}
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      background: severity.bg,
                      border: `1px solid ${severity.border}`,
                      borderRadius: 8,
                      padding: '10px 14px',
                    }}
                  >
                    <span className="text-xs font-semibold" style={{ color: severity.text }}>
                      Acao sugerida:
                    </span>{' '}
                    <span className="text-xs" style={{ color: 'var(--text-primary)' }}>
                      {aluno.acaoSugerida}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            5. PROGRAMA DE INDICACOES
           ══════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Gift size={20} style={{ color: 'var(--text-primary)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Programa de Indicacoes
            </h2>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Indicacoes', value: totalIndicacoes, color: '#3b82f6' },
              { label: 'Convertidas', value: convertidas, color: '#22c55e' },
              { label: 'Taxa Conversao', value: `${taxaConversao}%`, color: '#f59e0b' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl" style={{ ...cardStyle, padding: 20, textAlign: 'center' }}>
                <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                <p className="text-2xl font-semibold" style={{ color: stat.color, marginTop: 4 }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-xl" style={{ ...cardStyle, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Indicador', 'Indicado', 'Status', 'Desconto'].map((h) => (
                    <th
                      key={h}
                      className="text-xs font-normal"
                      style={{
                        color: 'var(--text-secondary)',
                        padding: '12px 16px',
                        textAlign: 'left',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INDICACOES.map((ind) => {
                  const st = INDICACAO_STATUS[ind.status];
                  return (
                    <tr key={ind.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{ind.indicador}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{ind.indicado}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: st.bg,
                          color: st.text,
                          fontSize: 11,
                          fontWeight: 600,
                          padding: '2px 10px',
                          borderRadius: 9999,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{ind.desconto}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            MODAL — Nova Campanha
           ══════════════════════════════════════════════════════════ */}
        {showModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
            }}
            onClick={() => setShowModal(false)}
          >
            <div
              className="rounded-xl"
              style={{
                ...cardStyle,
                padding: 28,
                width: '100%',
                maxWidth: 480,
                margin: '0 16px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 20 }}>
                Nova Campanha
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Nome */}
                <div>
                  <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    value={novaCampanha.nome}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, nome: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Tipo
                  </label>
                  <input
                    type="text"
                    value={novaCampanha.tipo}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, tipo: e.target.value })}
                    placeholder="Ex: Desconto Matricula"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Datas */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Data Inicio
                    </label>
                    <input
                      type="date"
                      value={novaCampanha.dataInicio}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, dataInicio: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Data Fim
                    </label>
                    <input
                      type="date"
                      value={novaCampanha.dataFim}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, dataFim: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Desconto + Codigo */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Desconto
                    </label>
                    <input
                      type="text"
                      value={novaCampanha.desconto}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, desconto: e.target.value })}
                      placeholder="Ex: 20%"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                      Codigo
                    </label>
                    <input
                      type="text"
                      value={novaCampanha.codigo}
                      onChange={(e) => setNovaCampanha({ ...novaCampanha, codigo: e.target.value.toUpperCase() })}
                      placeholder="Ex: PROMO30"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-primary)',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Limite de Uso */}
                <div>
                  <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Limite de Uso
                  </label>
                  <input
                    type="number"
                    value={novaCampanha.limiteUso || ''}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, limiteUso: parseInt(e.target.value) || 0 })}
                    placeholder="Ex: 50"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-xs font-normal" style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                    Status
                  </label>
                  <select
                    value={novaCampanha.status}
                    onChange={(e) => setNovaCampanha({ ...novaCampanha, status: e.target.value as Campanha['status'] })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'var(--text-primary)',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  >
                    <option value="agendada">Agendada</option>
                    <option value="ativa">Ativa</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  style={{
                    padding: '8px 20px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#3b82f6',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Criar Campanha
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
