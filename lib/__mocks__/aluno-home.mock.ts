// ============================================================
// Aluno Home Mock — Student Dashboard Mock Data
// ============================================================

export interface ProximaSessão {
  id: string;
  turmaNome: string;
  horario: string;       // "19:00"
  horarioFim: string;    // "20:30"
  instrutor: string;
  local: string;
  dia: string;           // "Hoje", "Amanhã", "Segunda"
  /** ISO timestamp of when the class starts */
  dataHoraInicio: string;
}

export interface FrequenciaMensal {
  sessõesAssistidas: number;
  metaMensal: number;
  percentual: number;
  /** Variação vs mês anterior em pontos percentuais */
  variacao: number;
  /** "up" | "down" | "stable" */
  tendencia: 'up' | 'down' | 'stable';
  /** Últimas 4 semanas: sessões assistidas por semana */
  historicoSemanal: number[];
}

export interface ConquistaRecente {
  id: string;
  tipo: 'badge' | 'medal' | 'belt' | 'milestone';
  nome: string;
  emoji: string;
  descricao: string;
  dataConquista: string;
}

export interface AlunoHomeData {
  proximaSessao: ProximaSessão | null;
  frequencia: FrequenciaMensal;
  conquistasRecentes: ConquistaRecente[];
  /** Next goal description */
  proximaMeta: string;
  /** Ranking position */
  posicaoRanking: number;
  /** Points total */
  pontosTotal: number;
}

// ── Generate dynamic "next class" based on current time ──
function getProximaAula(): ProximaSessão {
  const now = new Date();
  const hora = now.getHours();

  // Morning: next class today at 19h
  // Evening: next class tomorrow at 7h
  if (hora < 17) {
    const inicio = new Date(now);
    inicio.setHours(19, 0, 0, 0);
    return {
      id: 't2',
      turmaNome: 'Adulto Noite',
      horario: '19:00',
      horarioFim: '20:30',
      instrutor: 'Prof. Ricardo',
      local: 'Ambiente Principal',
      dia: 'Hoje',
      dataHoraInicio: inicio.toISOString(),
    };
  } else {
    const amanha = new Date(now);
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(7, 0, 0, 0);
    return {
      id: 't1',
      turmaNome: 'Adulto Manhã',
      horario: '07:00',
      horarioFim: '08:30',
      instrutor: 'Prof. André',
      local: 'Ambiente Principal',
      dia: 'Amanhã',
      dataHoraInicio: amanha.toISOString(),
    };
  }
}

export function getMockAlunoHomeData(): AlunoHomeData {
  return {
    proximaSessao: getProximaAula(),
    frequencia: {
      sessõesAssistidas: 18,
      metaMensal: 20,
      percentual: 90,
      variacao: 12,
      tendencia: 'up',
      historicoSemanal: [4, 5, 4, 5],
    },
    conquistasRecentes: [
      {
        id: 'c1',
        tipo: 'badge',
        nome: 'Guerreiro Consistente',
        emoji: '🔥',
        descricao: '20 sessões consecutivas sem faltas',
        dataConquista: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'c2',
        tipo: 'milestone',
        nome: '100 Check-ins',
        emoji: '💯',
        descricao: 'Atingiu 100 check-ins na unidade',
        dataConquista: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'c3',
        tipo: 'medal',
        nome: 'Top 10 Ranking',
        emoji: '🏆',
        descricao: 'Entrou no Top 10 do ranking geral',
        dataConquista: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
    ],
    proximaMeta: 'Nível Básico — 2 meses restantes',
    posicaoRanking: 7,
    pontosTotal: 1250,
  };
}
