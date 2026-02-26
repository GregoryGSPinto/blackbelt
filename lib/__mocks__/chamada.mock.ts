/**
 * Mock Data — Chamada Rápida (Professor)
 *
 * TODO(BE-061): Substituir por endpoints reais
 *   GET  /professor/chamada/:turmaId
 *   POST /professor/chamada/:turmaId/salvar
 */

export interface AlunoPresenca {
  id: string;
  nome: string;
  avatar: string;
  nivel: string;
  nivelCor: string;
  status: 'presente' | 'falta' | 'nao_marcado';
}

export interface ChamadaPayload {
  turmaId: string;
  data: string;
  presencas: { alunoId: string; status: 'presente' | 'falta' }[];
  observacao?: string;
}

export interface ChamadaResumo {
  turmaId: string;
  turmaNome: string;
  data: string;
  totalAlunos: number;
  presentes: number;
  faltas: number;
  percentual: number;
  observacao?: string;
}

const FAIXA_CORES: Record<string, string> = {
  'Branca': '#E5E7EB',
  'Cinza': '#9CA3AF',
  'Amarela': '#EAB308',
  'Laranja': '#F97316',
  'Verde': '#22C55E',
  'Azul': '#3B82F6',
  'Roxa': '#8B5CF6',
  'Marrom': '#92400E',
  'Preta': '#1F2937',
};

// ── Alunos por turma ──
const ALUNOS_TURMA: Record<string, AlunoPresenca[]> = {
  turma_kids_a: [
    { id: 'ka1', nome: 'Pedro Henrique', avatar: '👦', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka2', nome: 'Sofia Martins', avatar: '👧', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka3', nome: 'Gabriel Santos', avatar: '🧒', nivel: 'Amarela', nivelCor: FAIXA_CORES['Amarela'], status: 'nao_marcado' },
    { id: 'ka4', nome: 'Laura Oliveira', avatar: '👧', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka5', nome: 'Davi Costa', avatar: '👦', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ka6', nome: 'Maria Eduarda', avatar: '👧', nivel: 'Amarela', nivelCor: FAIXA_CORES['Amarela'], status: 'nao_marcado' },
    { id: 'ka7', nome: 'Lucas Ferreira', avatar: '🧒', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka8', nome: 'Valentina Lima', avatar: '👧', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ka9', nome: 'Arthur Souza', avatar: '👦', nivel: 'Amarela', nivelCor: FAIXA_CORES['Amarela'], status: 'nao_marcado' },
    { id: 'ka10', nome: 'Helena Rocha', avatar: '👧', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka11', nome: 'Bernardo Alves', avatar: '🧒', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ka12', nome: 'Alice Pereira', avatar: '👧', nivel: 'Cinza', nivelCor: FAIXA_CORES['Cinza'], status: 'nao_marcado' },
    { id: 'ka13', nome: 'Theo Ribeiro', avatar: '👦', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ka14', nome: 'Lara Mendes', avatar: '👧', nivel: 'Amarela', nivelCor: FAIXA_CORES['Amarela'], status: 'nao_marcado' },
  ],

  turma_teen: [
    { id: 'te1', nome: 'Miguel Oliveira', avatar: '🤸', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'te2', nome: 'Isabella Torres', avatar: '💪', nivel: 'Verde', nivelCor: FAIXA_CORES['Verde'], status: 'nao_marcado' },
    { id: 'te3', nome: 'Rafael Nunes', avatar: '🥋', nivel: 'Laranja', nivelCor: FAIXA_CORES['Laranja'], status: 'nao_marcado' },
    { id: 'te4', nome: 'Camila Dias', avatar: '⭐', nivel: 'Verde', nivelCor: FAIXA_CORES['Verde'], status: 'nao_marcado' },
    { id: 'te5', nome: 'Felipe Araújo', avatar: '🏆', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'te6', nome: 'Giovanna Costa', avatar: '🌟', nivel: 'Laranja', nivelCor: FAIXA_CORES['Laranja'], status: 'nao_marcado' },
    { id: 'te7', nome: 'Henrique Lima', avatar: '🔥', nivel: 'Verde', nivelCor: FAIXA_CORES['Verde'], status: 'nao_marcado' },
    { id: 'te8', nome: 'Manuela Rocha', avatar: '💜', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'te9', nome: 'Enzo Ferreira', avatar: '🥊', nivel: 'Laranja', nivelCor: FAIXA_CORES['Laranja'], status: 'nao_marcado' },
    { id: 'te10', nome: 'Beatriz Almeida', avatar: '🤸', nivel: 'Verde', nivelCor: FAIXA_CORES['Verde'], status: 'nao_marcado' },
  ],

  turma_adulto: [
    { id: 'ad1', nome: 'Carlos Silva', avatar: '🥋', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad2', nome: 'Ana Torres', avatar: '💪', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'ad3', nome: 'Marcos Souza', avatar: '🔥', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad4', nome: 'Juliana Mendes', avatar: '⭐', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad5', nome: 'Roberto Lima', avatar: '🏋️', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad6', nome: 'Fernanda Rocha', avatar: '🥇', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad7', nome: 'Gustavo Alves', avatar: '💜', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'ad8', nome: 'Patrícia Costa', avatar: '🥋', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad9', nome: 'Thiago Ferreira', avatar: '🏆', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad10', nome: 'Beatriz Oliveira', avatar: '🤸', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad11', nome: 'Lucas Mendes', avatar: '🏋️', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad12', nome: 'Daniela Santos', avatar: '💪', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad13', nome: 'André Pereira', avatar: '🥊', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad14', nome: 'Camila Nunes', avatar: '⭐', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad15', nome: 'Paulo Ricardo', avatar: '🔥', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'ad16', nome: 'Marina Almeida', avatar: '🌟', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad17', nome: 'Ricardo Barros', avatar: '🥋', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad18', nome: 'Larissa Dias', avatar: '💜', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad19', nome: 'Eduardo Moreira', avatar: '🏆', nivel: 'Marrom', nivelCor: FAIXA_CORES['Marrom'], status: 'nao_marcado' },
    { id: 'ad20', nome: 'Vanessa Ribeiro', avatar: '💪', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
    { id: 'ad21', nome: 'Rodrigo Gomes', avatar: '🥊', nivel: 'Branca', nivelCor: FAIXA_CORES['Branca'], status: 'nao_marcado' },
    { id: 'ad22', nome: 'Natália Freitas', avatar: '⭐', nivel: 'Azul', nivelCor: FAIXA_CORES['Azul'], status: 'nao_marcado' },
  ],

  turma_avancado: [
    { id: 'av1', nome: 'Ana Torres', avatar: '💪', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'av2', nome: 'Eduardo Moreira', avatar: '🏆', nivel: 'Marrom', nivelCor: FAIXA_CORES['Marrom'], status: 'nao_marcado' },
    { id: 'av3', nome: 'Gustavo Alves', avatar: '💜', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'av4', nome: 'Paulo Ricardo', avatar: '🔥', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'av5', nome: 'Prof. André', avatar: '🥋', nivel: 'Preta', nivelCor: FAIXA_CORES['Preta'], status: 'nao_marcado' },
    { id: 'av6', nome: 'Marcos Tanaka', avatar: '🥇', nivel: 'Marrom', nivelCor: FAIXA_CORES['Marrom'], status: 'nao_marcado' },
    { id: 'av7', nome: 'Renata Vieira', avatar: '💪', nivel: 'Roxa', nivelCor: FAIXA_CORES['Roxa'], status: 'nao_marcado' },
    { id: 'av8', nome: 'Diego Monteiro', avatar: '🔥', nivel: 'Marrom', nivelCor: FAIXA_CORES['Marrom'], status: 'nao_marcado' },
  ],
};

export function getChamadaByTurma(turmaId: string): AlunoPresenca[] {
  return (ALUNOS_TURMA[turmaId] || []).map(a => ({ ...a, status: 'nao_marcado' as const }));
}

export function salvarChamadaMock(payload: ChamadaPayload): ChamadaResumo {
  const alunos = ALUNOS_TURMA[payload.turmaId] || [];
  const presentes = payload.presencas.filter(p => p.status === 'presente').length;
  const faltas = payload.presencas.filter(p => p.status === 'falta').length;

  const turmaNames: Record<string, string> = {
    turma_kids_a: 'Kids Iniciante',
    turma_teen: 'Teen Competição',
    turma_adulto: 'Adulto Fundamentos',
    turma_avancado: 'Avançado / Competição',
  };

  return {
    turmaId: payload.turmaId,
    turmaNome: turmaNames[payload.turmaId] || 'Turma',
    data: payload.data,
    totalAlunos: alunos.length,
    presentes,
    faltas,
    percentual: alunos.length > 0 ? Math.round((presentes / alunos.length) * 100) : 0,
    observacao: payload.observacao,
  };
}
