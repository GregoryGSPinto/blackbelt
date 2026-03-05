/**
 * Mock Data — Ranking & Gamificação — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-020): Substituir por endpoints ranking
 *   GET /ranking?categoria=&turmaId=&periodo=
 *   GET /ranking/me
 *   GET /ranking/config/pontos
 */

import type {
  RankingEntry,
  PontoRegra,
  PontosResumo,
  CategoriaRanking,
} from '@/lib/api/contracts';

// ── Nomes brasileiros realistas ──────────────────────────

const NOMES_ADULTO = [
  'Rafael Mendes', 'Lucas Oliveira', 'Bruno Santos', 'Gabriel Ferreira',
  'André Barbosa', 'Felipe Costa', 'Thiago Lima', 'Marcelo Souza',
  'Ricardo Almeida', 'Pedro Nascimento', 'Diego Rocha', 'Leonardo Ribeiro',
  'Gustavo Pereira', 'Vinícius Carvalho', 'Mateus Gomes', 'João Martins',
  'Eduardo Araújo', 'Henrique Duarte', 'Carlos Teixeira', 'Fernando Moreira',
];

const NOMES_TEEN = [
  'Miguel Santos', 'Arthur Oliveira', 'Davi Lima', 'Bernardo Costa',
  'Nicolas Ferreira', 'Enzo Souza', 'Lorenzo Almeida', 'Heitor Nascimento',
  'Samuel Rocha', 'Theo Ribeiro', 'Pietro Pereira', 'Benjamin Carvalho',
  'Ryan Gomes', 'Caio Martins', 'Bryan Araújo',
];

const NOMES_KIDS = [
  'Noah Silva', 'Liam Santos', 'Matheus Oliveira', 'Lucas Jr. Lima',
  'Gael Costa', 'Ravi Ferreira', 'Benício Souza', 'Joaquim Almeida',
  'Isaac Nascimento', 'Caleb Rocha', 'Bento Ribeiro', 'Anthony Pereira',
  'Daniel Jr. Carvalho', 'Thomas Gomes', 'Davi Jr. Martins',
];

const NIVEIS_ADULTO = [
  'Nível Iniciante', 'Nível Iniciante', 'Nível Básico', 'Nível Básico',
  'Nível Intermediário', 'Nível Intermediário', 'Nível Avançado', 'Nível Máximo',
  'Nível Iniciante', 'Nível Básico', 'Nível Intermediário', 'Nível Básico',
  'Nível Iniciante', 'Nível Avançado', 'Nível Básico', 'Nível Intermediário',
  'Nível Máximo 1º Subnível', 'Nível Avançado', 'Nível Básico', 'Nível Iniciante',
];

const NIVEIS_TEEN = [
  'Nível Iniciante', 'Nível Cinza', 'Nível Amarelo', 'Nível Laranja',
  'Nível Verde', 'Nível Iniciante', 'Nível Cinza', 'Nível Amarelo',
  'Nível Laranja', 'Nível Iniciante', 'Nível Verde', 'Nível Cinza',
  'Nível Amarelo', 'Nível Iniciante', 'Nível Laranja',
];

const NIVEIS_KIDS = [
  'Nível Iniciante', 'Nível Cinza', 'Nível Cinza', 'Nível Amarelo',
  'Nível Amarelo', 'Nível Laranja', 'Nível Iniciante', 'Nível Iniciante',
  'Nível Cinza', 'Nível Laranja', 'Nível Verde', 'Nível Iniciante',
  'Nível Amarelo', 'Nível Cinza', 'Nível Iniciante',
];

const TURMAS_ADULTO = [
  { id: 'turma-1', nome: 'Iniciantes Manhã' },
  { id: 'turma-2', nome: 'Avançado Noite' },
  { id: 'turma-3', nome: 'Fundamentals' },
  { id: 'turma-4', nome: 'All Levels' },
];

const TURMAS_TEEN = [
  { id: 'turma-teen-1', nome: 'Teen Manhã' },
  { id: 'turma-teen-2', nome: 'Teen Tarde' },
];

const TURMAS_KIDS = [
  { id: 'turma-kids-1', nome: 'Kids Iniciante' },
  { id: 'turma-kids-2', nome: 'Kids Avançado' },
];

// ── Geração de dados ─────────────────────────────────────

function gerarEntradas(
  nomes: string[],
  niveis: string[],
  turmas: { id: string; nome: string }[],
  categoria: CategoriaRanking,
  basePontos: number,
): RankingEntry[] {
  return nomes.map((nome, i) => {
    const pontos = Math.max(50, basePontos - (i * Math.floor(basePontos / (nomes.length + 2))) + Math.floor(Math.random() * 100));
    const turma = turmas[i % turmas.length];
    return {
      posicao: i + 1,
      alunoId: `${categoria.toLowerCase()}-${String(i + 1).padStart(3, '0')}`,
      nome,
      avatar: undefined,
      nivel: niveis[i % niveis.length],
      pontos,
      variacaoSemana: Math.floor(Math.random() * 7) - 3,
      checkinsRecentes: Math.floor(Math.random() * 20) + 2,
      streakAtual: Math.floor(Math.random() * 30),
      categoria,
      turmaId: turma.id,
      turmaNome: turma.nome,
    };
  });
}

export const rankingAdulto = gerarEntradas(NOMES_ADULTO, NIVEIS_ADULTO, TURMAS_ADULTO, 'ADULTO', 2800);
export const rankingTeen = gerarEntradas(NOMES_TEEN, NIVEIS_TEEN, TURMAS_TEEN, 'TEEN', 2200);
export const rankingKids = gerarEntradas(NOMES_KIDS, NIVEIS_KIDS, TURMAS_KIDS, 'KIDS', 1800);

/** Ranking completo (50 alunos totais) */
export const mockRankingCompleto: RankingEntry[] = [
  ...rankingAdulto,
  ...rankingTeen,
  ...rankingKids,
];

/** Posição do aluno logado (simulated) */
export const mockMinhaPosicao: RankingEntry = {
  posicao: 7,
  alunoId: 'adulto-007',
  nome: 'Você',
  avatar: undefined,
  nivel: 'Nível Básico',
  pontos: 1850,
  variacaoSemana: 2,
  checkinsRecentes: 12,
  streakAtual: 8,
  categoria: 'ADULTO',
  turmaId: 'turma-2',
  turmaNome: 'Avançado Noite',
};

/** Regras de pontuação configuráveis */
export const mockPontosConfig: PontoRegra[] = [
  {
    id: 'reg-1',
    nome: 'Check-in presencial',
    descricao: 'Registrar presença na unidade via QR code ou biometria',
    pontos: 10,
    icone: 'ScanLine',
    ativa: true,
  },
  {
    id: 'reg-2',
    nome: 'Sessão completa',
    descricao: 'Permanecer até o fim da sessão (bônus)',
    pontos: 5,
    icone: 'CheckCircle',
    ativa: true,
  },
  {
    id: 'reg-3',
    nome: 'Conquista recebida',
    descricao: 'Receber qualquer conquista ou conquista',
    pontos: 50,
    icone: 'Medal',
    ativa: true,
  },
  {
    id: 'reg-4',
    nome: '7 dias consecutivos',
    descricao: 'Treinar 7 dias seguidos (bônus streak)',
    pontos: 100,
    icone: 'Flame',
    ativa: true,
  },
  {
    id: 'reg-5',
    nome: 'Vídeo assistido',
    descricao: 'Assistir um vídeo de técnica por completo',
    pontos: 5,
    icone: 'Video',
    ativa: true,
  },
  {
    id: 'reg-6',
    nome: 'Mês sem falta',
    descricao: 'Presença em 100% das sessões do mês',
    pontos: 200,
    icone: 'Calendar',
    ativa: true,
  },
  {
    id: 'reg-7',
    nome: 'Campeonato — Participação',
    descricao: 'Participar de qualquer campeonato',
    pontos: 300,
    icone: 'Trophy',
    ativa: true,
  },
  {
    id: 'reg-8',
    nome: 'Campeonato — Conquista',
    descricao: 'Conquistar conquista em campeonato',
    pontos: 500,
    icone: 'Award',
    ativa: true,
  },
];

/** Resumo de pontos do aluno logado (simulado) */
export const mockPontosResumo: PontosResumo = {
  total: 1850,
  esteMes: 310,
  ultimaSemana: 85,
  posicaoGeral: 7,
  posicaoCategoria: 5,
  streakAtual: 8,
  melhorStreak: 21,
  fontes: [
    { fonte: 'Check-ins', pontos: 980, quantidade: 98 },
    { fonte: 'Sessões completas', pontos: 340, quantidade: 68 },
    { fonte: 'Conquistas', pontos: 250, quantidade: 5 },
    { fonte: 'Streaks', pontos: 200, quantidade: 2 },
    { fonte: 'Vídeos', pontos: 80, quantidade: 16 },
  ],
};

// ── Helpers ───────────────────────────────────────────────

export function getRankingPorCategoria(categoria: CategoriaRanking): RankingEntry[] {
  switch (categoria) {
    case 'ADULTO': return rankingAdulto;
    case 'TEEN': return rankingTeen;
    case 'KIDS': return rankingKids;
    default: return mockRankingCompleto;
  }
}

export function getRankingPorTurma(turmaId: string): RankingEntry[] {
  return mockRankingCompleto.filter(e => e.turmaId === turmaId);
}

export function getRankingMensal(): RankingEntry[] {
  // Simula ranking mensal com pontuações reduzidas
  return rankingAdulto.map((e, i) => ({
    ...e,
    pontos: Math.floor(e.pontos * 0.15),
    posicao: i + 1,
  }));
}
