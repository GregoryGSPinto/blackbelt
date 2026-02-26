// ============================================================
// conquistas.mock — Mock de conquistas disponíveis para concessão
// ============================================================

export interface ConquistaDisponivel {
  id: string;
  emoji: string;
  nome: string;
  descricao: string;
  categoria: 'dedicacao' | 'tecnica' | 'competicao' | 'comportamento' | 'especial';
}

export interface ConquistaConcessao {
  conquistaId: string;
  alunoId: string;
  observacao?: string;
  concedidaPor: string;
  dataConquista: string;
}

const CONQUISTAS_CATALOGO: ConquistaDisponivel[] = [
  // Dedicação
  { id: 'med-001', emoji: '🔥', nome: '10 Treinos', descricao: 'Completou 10 treinos na unidade', categoria: 'dedicacao' },
  { id: 'med-002', emoji: '💪', nome: '50 Treinos', descricao: 'Completou 50 treinos na unidade', categoria: 'dedicacao' },
  { id: 'med-003', emoji: '🏆', nome: '100 Treinos', descricao: 'Completou 100 treinos na unidade', categoria: 'dedicacao' },
  { id: 'med-004', emoji: '⭐', nome: 'Guerreiro Dedicado', descricao: 'Treinou 5 dias na mesma semana', categoria: 'dedicacao' },
  { id: 'med-005', emoji: '📅', nome: 'Sequência de 30 Dias', descricao: '30 dias consecutivos de treino', categoria: 'dedicacao' },

  // Técnica
  { id: 'med-006', emoji: '🛡️', nome: 'Mestre da Guarda', descricao: 'Excelência em técnicas de guarda', categoria: 'tecnica' },
  { id: 'med-007', emoji: '⚔️', nome: 'Passador Implacável', descricao: 'Domínio em passagem de guarda', categoria: 'tecnica' },
  { id: 'med-008', emoji: '🔒', nome: 'Rei das Finalizações', descricao: 'Alta taxa de finalizações no sparring', categoria: 'tecnica' },
  { id: 'med-009', emoji: '🦵', nome: 'Leg Lock Specialist', descricao: 'Especialista em ataques de perna', categoria: 'tecnica' },
  { id: 'med-010', emoji: '🔄', nome: 'Raspagem Perfeita', descricao: 'Domínio em sweeps e inversões', categoria: 'tecnica' },

  // Competição
  { id: 'med-011', emoji: '🥇', nome: 'Primeiro Ouro', descricao: 'Primeira conquista de ouro em competição', categoria: 'competicao' },
  { id: 'med-012', emoji: '🥈', nome: 'Prata Guerreira', descricao: 'Conquista de prata em competição', categoria: 'competicao' },
  { id: 'med-013', emoji: '🥉', nome: 'Bronze Honroso', descricao: 'Conquista de bronze em competição', categoria: 'competicao' },
  { id: 'med-014', emoji: '🎖️', nome: 'Competidor Nato', descricao: 'Participou de 5+ competições', categoria: 'competicao' },

  // Comportamento
  { id: 'med-015', emoji: '🤝', nome: 'Espírito de Equipe', descricao: 'Sempre ajuda os colegas no treino', categoria: 'comportamento' },
  { id: 'med-016', emoji: '🧘', nome: 'Disciplina Exemplar', descricao: 'Pontualidade e respeito constante', categoria: 'comportamento' },
  { id: 'med-017', emoji: '👨‍🏫', nome: 'Mentor', descricao: 'Ajudou niveis mais baixas a evoluir', categoria: 'comportamento' },

  // Especial
  { id: 'med-018', emoji: '🎯', nome: 'Primeiro Nível', descricao: 'Conquistou sua primeira graduação', categoria: 'especial' },
  { id: 'med-019', emoji: '🦁', nome: 'Leão do BlackBelt', descricao: 'Reconhecimento especial da unidade', categoria: 'especial' },
  { id: 'med-020', emoji: '💎', nome: 'Destaque do Mês', descricao: 'Aluno destaque do mês', categoria: 'especial' },
];

export function getConquistasDisponiveis(): ConquistaDisponivel[] {
  return CONQUISTAS_CATALOGO;
}

export function getConquistaById(id: string): ConquistaDisponivel | undefined {
  return CONQUISTAS_CATALOGO.find(m => m.id === id);
}
