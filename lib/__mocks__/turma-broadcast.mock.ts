// ============================================================
// Turma Broadcast Mock — Send messages to entire classes
// ============================================================

export interface TurmaBroadcast {
  id: string;
  turmaId: string;
  turmaNome: string;
  remetenteId: string;
  remetenteNome: string;
  conteudo: string;
  totalDestinatarios: number;
  lidoPor: string[];
  enviadoEm: string;
}

export interface BroadcastTemplate {
  id: string;
  label: string;
  texto: string;
}

// ── Templates ──

export const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  { id: 'bt-1', label: '🕐 Mudança de Horário', texto: 'Atenção: houve alteração no horário da sessão. Confira o novo horário na aba de turmas.' },
  { id: 'bt-2', label: '🏆 Campeonato', texto: 'Pessoal, estão abertas as inscrições para o campeonato. Quem tiver interesse, fale comigo após a sessão.' },
  { id: 'bt-3', label: '📋 Aviso de Aula', texto: 'A sessão de hoje será focada em drills de repetição. Tragam protetor bucal.' },
  { id: 'bt-4', label: '🔴 Cancelamento', texto: 'Infelizmente a sessão de hoje está cancelada. Reponham na próxima sessão.' },
  { id: 'bt-5', label: '🎉 Parabéns Turma', texto: 'Parabéns a todos pelo empenho na sessão de hoje! Continuem assim!' },
];

// ── In-memory store ──

let nextId = 500;

const BROADCASTS: TurmaBroadcast[] = [
  {
    id: 'bc-1',
    turmaId: 'TUR001',
    turmaNome: 'Gi Avançado',
    remetenteId: 'prof-001',
    remetenteNome: 'Mestre João Silva',
    conteudo: 'Pessoal, a sessão de sexta será focada em guard passing. Tragam disposição!',
    totalDestinatarios: 24,
    lidoPor: ['a1', 'a2', 'a3', 'a4'],
    enviadoEm: '2026-02-17T10:30:00Z',
  },
  {
    id: 'bc-2',
    turmaId: 'TUR002',
    turmaNome: 'Fundamentos',
    remetenteId: 'prof-001',
    remetenteNome: 'Mestre João Silva',
    conteudo: 'Lembrete: amanhã é dia de revisão de técnicas. Não faltem!',
    totalDestinatarios: 18,
    lidoPor: ['a1', 'a5'],
    enviadoEm: '2026-02-16T14:00:00Z',
  },
];

// ── Functions ──

export function sendToTurma(turmaId: string, turmaNome: string, remetenteId: string, remetenteNome: string, conteudo: string, totalDestinatarios: number): TurmaBroadcast {
  const bc: TurmaBroadcast = {
    id: `bc-${++nextId}`,
    turmaId,
    turmaNome,
    remetenteId,
    remetenteNome,
    conteudo,
    totalDestinatarios,
    lidoPor: [],
    enviadoEm: new Date().toISOString(),
  };
  BROADCASTS.unshift(bc);
  return bc;
}

export function getBroadcastsByProfessor(profId: string): TurmaBroadcast[] {
  return BROADCASTS.filter(b => b.remetenteId === profId)
    .sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
}

export function getBroadcastsForAluno(_alunoId: string): TurmaBroadcast[] {
  // In production, would filter by turma membership
  return [...BROADCASTS].sort((a, b) => b.enviadoEm.localeCompare(a.enviadoEm));
}

export function markBroadcastRead(broadcastId: string, alunoId: string): void {
  const bc = BROADCASTS.find(b => b.id === broadcastId);
  if (bc && !bc.lidoPor.includes(alunoId)) {
    bc.lidoPor.push(alunoId);
  }
}
