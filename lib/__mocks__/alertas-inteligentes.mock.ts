// ============================================================
// Alertas Inteligentes — Mock Data
// ============================================================
// Pattern detection engine that analyzes student data and
// generates proactive alerts for professors and admins.
// ============================================================

export type AlertaTipo = 'ausencia' | 'queda_frequencia' | 'graduacao' | 'evasao' | 'aniversario' | 'celebracao';
export type AlertaPrioridade = 'critica' | 'alta' | 'media' | 'baixa';
export type AlertaCategoria = 'info' | 'warning' | 'success' | 'celebration';

export interface AlertaInteligente {
  id: string;
  tipo: AlertaTipo;
  categoria: AlertaCategoria;
  prioridade: AlertaPrioridade;
  titulo: string;
  descricao: string;
  emoji: string;
  alunoId?: string;
  alunoNome?: string;
  /** Suggested action label */
  acaoLabel?: string;
  /** Route or action identifier */
  acaoHref?: string;
  /** When the alert was generated */
  criadoEm: string;
  /** Whether the alert has been dismissed */
  dispensado?: boolean;
}

export interface TendenciaData {
  atual: number;
  anterior: number;
  /** Percent change: positive = improvement */
  variacao: number;
}

// ── Alert generation from student data ──

export interface AlunoAlertInput {
  id: string;
  nome: string;
  presenca30d: number;
  presenca90d: number;
  diasAusente: number;
  ultimaSessao: string;
  nivel: string;
  tempoTreino: string;
  statusGraduacao: string;
  dataInicio: string;
}

export function gerarAlertas(alunos: AlunoAlertInput[]): AlertaInteligente[] {
  const alertas: AlertaInteligente[] = [];
  const now = new Date();

  for (const aluno of alunos) {
    // 1. Padrão de ausência (2+ faltas consecutivas / 5+ dias ausente)
    if (aluno.diasAusente >= 5) {
      alertas.push({
        id: `aus-${aluno.id}`,
        tipo: 'ausencia',
        categoria: 'warning',
        prioridade: aluno.diasAusente >= 14 ? 'critica' : 'alta',
        titulo: `${aluno.nome} ausente há ${aluno.diasAusente} dias`,
        descricao: `Última sessão: ${aluno.ultimaSessao}. Considere enviar mensagem.`,
        emoji: '⚠️',
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        acaoLabel: 'Enviar mensagem',
        acaoHref: `/professor-aluno-detalhe?id=${aluno.id}`,
        criadoEm: now.toISOString(),
      });
    }

    // 2. Queda de frequência (>20% queda 30d vs 90d)
    if (aluno.presenca90d > 0) {
      const diff = aluno.presenca90d - aluno.presenca30d;
      if (diff > 20) {
        alertas.push({
          id: `freq-${aluno.id}`,
          tipo: 'queda_frequencia',
          categoria: 'warning',
          prioridade: diff > 40 ? 'critica' : 'media',
          titulo: `Frequência de ${aluno.nome} caiu ${diff}%`,
          descricao: `De ${aluno.presenca90d}% (90d) para ${aluno.presenca30d}% (30d).`,
          emoji: '📉',
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          acaoLabel: 'Ver detalhe',
          acaoHref: `/professor-aluno-detalhe?id=${aluno.id}`,
          criadoEm: now.toISOString(),
        });
      }
    }

    // 3. Aluno pronto para graduação
    if (aluno.statusGraduacao === 'APTO') {
      alertas.push({
        id: `grad-${aluno.id}`,
        tipo: 'graduacao',
        categoria: 'success',
        prioridade: 'media',
        titulo: `${aluno.nome} apto para graduação`,
        descricao: `${aluno.nivel} há ${aluno.tempoTreino}. Frequência: ${aluno.presenca30d}%.`,
        emoji: '🎯',
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        acaoLabel: 'Avaliar',
        acaoHref: '/professor-avaliacoes',
        criadoEm: now.toISOString(),
      });
    }

    // 4. Risco de evasão (< 50% frequência)
    if (aluno.presenca30d < 50 && aluno.presenca30d > 0) {
      alertas.push({
        id: `eva-${aluno.id}`,
        tipo: 'evasao',
        categoria: 'warning',
        prioridade: 'critica',
        titulo: `Risco de evasão: ${aluno.nome}`,
        descricao: `Frequência de apenas ${aluno.presenca30d}% nos últimos 30 dias.`,
        emoji: '🚨',
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        acaoLabel: 'Intervir',
        acaoHref: `/professor-aluno-detalhe?id=${aluno.id}`,
        criadoEm: now.toISOString(),
      });
    }

    // 5. Aniversário de matrícula
    try {
      const inicio = new Date(aluno.dataInicio);
      const diffMs = now.getTime() - inicio.getTime();
      const meses = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
      if (meses > 0 && meses % 12 === 0) {
        const anos = meses / 12;
        alertas.push({
          id: `aniv-${aluno.id}`,
          tipo: 'aniversario',
          categoria: 'celebration',
          prioridade: 'baixa',
          titulo: `${anos} ano(s) de ${aluno.nome}!`,
          descricao: `Matriculado desde ${inicio.toLocaleDateString('pt-BR')}.`,
          emoji: '🎂',
          alunoId: aluno.id,
          alunoNome: aluno.nome,
          acaoLabel: 'Parabenizar',
          criadoEm: now.toISOString(),
        });
      }
    } catch { /* skip invalid dates */ }
  }

  // Sort by priority
  const PRIO: Record<AlertaPrioridade, number> = { critica: 0, alta: 1, media: 2, baixa: 3 };
  return alertas.sort((a, b) => PRIO[a.prioridade] - PRIO[b.prioridade]);
}

// ── Pre-built mock alerts (for when service can't analyze live data) ──

export const MOCK_ALERTAS: AlertaInteligente[] = [
  {
    id: 'alert-1', tipo: 'evasao', categoria: 'warning', prioridade: 'critica',
    titulo: 'Risco de evasão: Pedro Costa', descricao: 'Frequência de apenas 35% nos últimos 30 dias.',
    emoji: '🚨', alunoId: 'a3', alunoNome: 'Pedro Costa',
    acaoLabel: 'Intervir', acaoHref: '/professor-aluno-detalhe?id=a3',
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'alert-2', tipo: 'ausencia', categoria: 'warning', prioridade: 'alta',
    titulo: 'Lucas Mendes ausente há 12 dias', descricao: 'Última sessão: 06/02. Considere enviar mensagem.',
    emoji: '⚠️', alunoId: 'a5', alunoNome: 'Lucas Mendes',
    acaoLabel: 'Enviar mensagem', acaoHref: '/professor-aluno-detalhe?id=a5',
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'alert-3', tipo: 'graduacao', categoria: 'success', prioridade: 'media',
    titulo: 'Maria Silva apta para graduação', descricao: 'Nível Iniciante há 8 meses. Frequência: 92%.',
    emoji: '🎯', alunoId: 'a2', alunoNome: 'Maria Silva',
    acaoLabel: 'Avaliar', acaoHref: '/professor-avaliacoes',
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'alert-4', tipo: 'queda_frequencia', categoria: 'warning', prioridade: 'media',
    titulo: 'Frequência de Ana Oliveira caiu 25%', descricao: 'De 88% (90d) para 63% (30d).',
    emoji: '📉', alunoId: 'a4', alunoNome: 'Ana Oliveira',
    acaoLabel: 'Ver detalhe', acaoHref: '/professor-aluno-detalhe?id=a4',
    criadoEm: new Date().toISOString(),
  },
  {
    id: 'alert-5', tipo: 'aniversario', categoria: 'celebration', prioridade: 'baixa',
    titulo: '1 ano de Rafael Santos!', descricao: 'Matriculado desde 18/02/2025. Parabéns! 🎉',
    emoji: '🎂', alunoId: 'a1', alunoNome: 'Rafael Santos',
    acaoLabel: 'Parabenizar',
    criadoEm: new Date().toISOString(),
  },
];
