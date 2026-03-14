// ============================================================
// ReengagementRules — Escalating re-engagement rule cards
// + Mini-dashboard showing at-risk students & recovery stats
// ============================================================
'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  MessageCircle, AlertTriangle, ShieldAlert, Eye, EyeOff,
  ChevronRight, RefreshCw, UserCheck, TrendingUp,
  Pencil,
} from 'lucide-react';

// ── Types ──

export interface ReengagementRule {
  id: string;
  diasAusente: number;
  label: string;
  descricao: string;
  acao: 'whatsapp' | 'alerta_professor' | 'alerta_admin';
  template: string;
  ativa: boolean;
  emoji: string;
  cor: string;
}

export interface AlunoEmRisco {
  id: string;
  nome: string;
  avatar: string;
  diasAusente: number;
  ultimaSessao: string;
  turma: string;
  nivelRisco: 'moderado' | 'alto' | 'critico';
}

export interface ReengagementStats {
  emRisco: number;
  recuperadosMes: number;
  taxaSucesso: number;
  mensagensEnviadas: number;
}

// ── Mock Data ──

export const MOCK_RULES: ReengagementRule[] = [
  {
    id: 'reeng-7d', diasAusente: 7,
    label: '7 dias ausente', descricao: 'Mensagem automática via WhatsApp',
    acao: 'whatsapp',
    template: 'Olá {nome}! Sentimos sua falta no ambiente 🥋. Já faz {diasAusente} dias desde sua última sessão. Bora voltar? O Instrutor {professor} está te esperando!',
    ativa: true, emoji: '💬', cor: '#22C55E',
  },
  {
    id: 'reeng-15d', diasAusente: 15,
    label: '15 dias ausente', descricao: 'Alerta para professor da turma',
    acao: 'alerta_professor',
    template: 'Professor, {nome} está ausente há {diasAusente} dias da turma {turma}. Considere entrar em contato pessoalmente.',
    ativa: true, emoji: '🔔', cor: '#F59E0B',
  },
  {
    id: 'reeng-30d', diasAusente: 30,
    label: '30 dias ausente', descricao: 'Alerta admin + oferta de retorno',
    acao: 'alerta_admin',
    template: 'Olá {nome}! Que tal voltar ao BlackBelt? 🥋 Preparamos uma condição especial de retorno para você. Fale com a recepção ou responda aqui!',
    ativa: true, emoji: '🚨', cor: '#EF4444',
  },
];

export const MOCK_ALUNOS_RISCO: AlunoEmRisco[] = [
  { id: 'r1', nome: 'Pedro Costa', avatar: '🧑', diasAusente: 32, ultimaSessao: '17/01', turma: 'Adulto Iniciante', nivelRisco: 'critico' },
  { id: 'r2', nome: 'Lucas Mendes', avatar: '👦', diasAusente: 18, ultimaSessao: '31/01', turma: 'Teen 14-17', nivelRisco: 'alto' },
  { id: 'r3', nome: 'Fernanda Lima', avatar: '👩', diasAusente: 12, ultimaSessao: '06/02', turma: 'Adulto Avançado', nivelRisco: 'moderado' },
  { id: 'r4', nome: 'Carlos Rocha', avatar: '🧔', diasAusente: 9, ultimaSessao: '09/02', turma: 'Adulto Iniciante', nivelRisco: 'moderado' },
  { id: 'r5', nome: 'Amanda Souza', avatar: '👧', diasAusente: 22, ultimaSessao: '27/01', turma: 'Kids 8-13', nivelRisco: 'alto' },
];

export const MOCK_STATS: ReengagementStats = {
  emRisco: 5,
  recuperadosMes: 8,
  taxaSucesso: 62,
  mensagensEnviadas: 34,
};

// ── Main Component ──

interface ReengagementRulesProps {
  rules?: ReengagementRule[];
  alunosRisco?: AlunoEmRisco[];
  stats?: ReengagementStats;
  onToggleRule?: (id: string, ativa: boolean) => void;
  onEditTemplate?: (id: string, template: string) => void;
}

export default function ReengagementRules({
  rules = MOCK_RULES,
  alunosRisco = MOCK_ALUNOS_RISCO,
  stats = MOCK_STATS,
  onToggleRule,
  onEditTemplate,
}: ReengagementRulesProps) {
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');
  const [localRules, setLocalRules] = useState(rules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState('');
  const router = useRouter();

  const handleToggle = (id: string) => {
    setLocalRules(prev => prev.map(r =>
      r.id === id ? { ...r, ativa: !r.ativa } : r
    ));
    const rule = localRules.find(r => r.id === id);
    if (rule) onToggleRule?.(id, !rule.ativa);
  };

  const startEdit = (rule: ReengagementRule) => {
    setEditingId(rule.id);
    setEditTemplate(rule.template);
  };

  const saveEdit = (id: string) => {
    setLocalRules(prev => prev.map(r =>
      r.id === id ? { ...r, template: editTemplate } : r
    ));
    onEditTemplate?.(id, editTemplate);
    setEditingId(null);
  };

  // Variables available
  const variaveis = ['{nome}', '{diasAusente}', '{turma}', '{professor}', '{ultimaSessao}'];

  const riskColors: Record<AlunoEmRisco['nivelRisco'], { bg: string; text: string; label: string }> = {
    critico: { bg: 'bg-red-500/15', text: 'text-red-300', label: t('reengagement.riskCritical') },
    alto: { bg: 'bg-amber-500/15', text: 'text-amber-300', label: t('reengagement.riskHigh') },
    moderado: { bg: 'bg-blue-500/15', text: 'text-blue-300', label: t('reengagement.riskModerate') },
  };

  const sortedAlunos = useMemo(() =>
    [...alunosRisco].sort((a, b) => b.diasAusente - a.diasAusente),
  [alunosRisco]);

  return (
    <div className="space-y-6">
      {/* ── Stats Dashboard ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: t('reengagement.atRisk'), value: stats.emRisco, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: t('reengagement.recoveredMonth'), value: stats.recuperadosMes, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: t('reengagement.successRate'), value: `${stats.taxaSucesso}%`, icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: t('reengagement.messagesSent'), value: stats.mensagensEnviadas, icon: MessageCircle, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={14} className={s.color} />
            </div>
            <p className="text-xl font-medium text-white/90">{s.value}</p>
            <p className="text-[10px] text-white/35 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Escalating Rules ── */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
          <RefreshCw size={14} className="text-amber-400" />
          {t('reengagement.title')}
        </h3>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-8 bottom-8 w-px" style={{ background: 'linear-gradient(to bottom, #22C55E, #F59E0B, #EF4444)' }} />

          <div className="space-y-3">
            {localRules.map((rule, idx) => (
              <div
                key={rule.id}
                className="relative pl-12"
                style={{ animation: `anim-fade-in 300ms ease ${idx * 100}ms both` }}
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-3 top-4 w-4 h-4 rounded-full border-2 z-10"
                  style={{
                    borderColor: rule.cor,
                    background: rule.ativa ? rule.cor : 'transparent',
                  }}
                />

                <div
                  className="rounded-xl p-4 transition-all"
                  style={{
                    background: rule.ativa ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.015)',
                    border: `1px solid ${rule.ativa ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                    opacity: rule.ativa ? 1 : 0.5,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{rule.emoji}</span>
                        <span className="text-sm font-semibold text-white/80">{rule.label}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider"
                          style={{ background: `${rule.cor}20`, color: rule.cor }}
                        >
                          {rule.acao.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-white/35 text-xs">{rule.descricao}</p>
                    </div>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(rule.id)}
                      className="flex-shrink-0 ml-3 mt-1"
                      aria-label={rule.ativa ? t('reengagement.deactivateRule') : t('reengagement.activateRule')}
                    >
                      {rule.ativa ? (
                        <Eye size={18} className="text-emerald-400" />
                      ) : (
                        <EyeOff size={18} className="text-white/20" />
                      )}
                    </button>
                  </div>

                  {/* Template preview/edit */}
                  <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.025)' }}>
                    {editingId === rule.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editTemplate}
                          onChange={e => setEditTemplate(e.target.value)}
                          aria-label={t('reengagement.messageTemplate')}
                          className="w-full bg-transparent text-white/70 text-xs resize-none border border-white/10 rounded-lg p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus:border-white/20"
                          rows={3}
                        />
                        <div className="flex flex-wrap gap-1 mb-2">
                          {variaveis.map(v => (
                            <button
                              key={v}
                              onClick={() => setEditTemplate(prev => prev + ' ' + v)}
                              className="px-2 py-0.5 rounded text-[9px] bg-white/5 text-white/30 hover:text-white/60 transition-colors"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(rule.id)}
                            className="px-3 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                          >
                            {tCommon('actions.save')}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1 rounded-lg text-[10px] text-white/30 hover:text-white/50 transition-colors"
                          >
                            {tCommon('actions.cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <p className="text-white/30 text-[11px] leading-relaxed flex-1 italic">
                          &ldquo;{rule.template}&rdquo;
                        </p>
                        <button
                          onClick={() => startEdit(rule)}
                          className="flex-shrink-0 p-1 rounded text-white/15 hover:text-white/40 transition-colors"
                          aria-label={t('reengagement.editTemplate')}
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── At-Risk Students ── */}
      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 flex items-center gap-2">
          <ShieldAlert size={14} className="text-red-400" />
          {t('reengagement.studentsAtRisk')} ({sortedAlunos.length})
        </h3>

        <div className="space-y-2">
          {sortedAlunos.map((aluno, idx) => {
            const risk = riskColors[aluno.nivelRisco];
            return (
              <button
                key={aluno.id}
                onClick={() => router.push(`/professor-aluno-detalhe?id=${aluno.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  animation: `anim-fade-in 300ms ease ${idx * 60}ms both`,
                }}
              >
                <span className="text-lg">{aluno.avatar}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/75 truncate">{aluno.nome}</p>
                  <p className="text-[10px] text-white/25">{aluno.turma} · {t('reengagement.lastSession')}: {aluno.ultimaSessao}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${risk.bg} ${risk.text}`}>
                    {aluno.diasAusente}d · {risk.label}
                  </span>
                  <ChevronRight size={14} className="text-white/15" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
