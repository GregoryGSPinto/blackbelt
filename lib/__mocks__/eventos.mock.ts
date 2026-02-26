/**
 * Mock Data — Eventos & Campeonatos — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-022): Substituir por endpoints eventos
 *   GET /eventos?status=&tipo=
 *   GET /eventos/:id
 *   POST /eventos (admin)
 *   POST /eventos/:id/inscrever
 *   PUT /eventos/:id/resultados (admin)
 */

import type {
  Evento,
  InscricaoEvento,
  CategoriaEvento,
  TipoEvento,
  StatusEvento,
} from '@/lib/api/contracts';

// ── Categorias reutilizáveis ─────────────────────────────

const CATEGORIAS_PADRAO: CategoriaEvento[] = [
  { id: 'cat-1', nivel: 'Nível Iniciante', peso: 'Galo (até 57.5kg)' },
  { id: 'cat-2', nivel: 'Nível Iniciante', peso: 'Pena (até 70kg)' },
  { id: 'cat-3', nivel: 'Nível Iniciante', peso: 'Leve (até 76kg)' },
  { id: 'cat-4', nivel: 'Nível Básico', peso: 'Pena (até 70kg)' },
  { id: 'cat-5', nivel: 'Nível Básico', peso: 'Leve (até 76kg)' },
  { id: 'cat-6', nivel: 'Nível Básico', peso: 'Médio (até 82.3kg)' },
  { id: 'cat-7', nivel: 'Nível Intermediário', peso: 'Leve (até 76kg)' },
  { id: 'cat-8', nivel: 'Nível Intermediário', peso: 'Médio (até 82.3kg)' },
  { id: 'cat-9', nivel: 'Nível Avançado', peso: 'Pesado (até 94.3kg)', limiteInscritos: 16 },
  { id: 'cat-10', nivel: 'Nível Máximo', peso: 'Absoluto (sem limite)', limiteInscritos: 32 },
];

const CATEGORIAS_INTERNO: CategoriaEvento[] = [
  { id: 'cat-int-1', nivel: 'Iniciantes', peso: 'Peso livre' },
  { id: 'cat-int-2', nivel: 'Intermediário', peso: 'Peso livre' },
  { id: 'cat-int-3', nivel: 'Avançado', peso: 'Peso livre' },
];

// ── Inscrições mock ──────────────────────────────────────

function gerarInscritos(eventoId: string, categorias: CategoriaEvento[], qtd: number): InscricaoEvento[] {
  const nomes = [
    'Rafael Mendes', 'Lucas Oliveira', 'Bruno Santos', 'Gabriel Ferreira',
    'André Barbosa', 'Felipe Costa', 'Thiago Lima', 'Marcelo Souza',
    'Ricardo Almeida', 'Pedro Nascimento', 'Diego Rocha', 'Leonardo Ribeiro',
    'Carlos Silva', 'Gustavo Pereira', 'Vinícius Carvalho', 'João Martins',
    'Eduardo Araújo', 'Henrique Duarte', 'Fernando Moreira', 'Mateus Gomes',
  ];

  return Array.from({ length: Math.min(qtd, nomes.length) }, (_, i) => {
    const cat = categorias[i % categorias.length];
    return {
      id: `insc-${eventoId}-${i + 1}`,
      alunoId: `adulto-${String(i + 1).padStart(3, '0')}`,
      alunoNome: nomes[i],
      eventoId,
      categoriaId: cat.id,
      categoriaDescricao: `${cat.nivel} - ${cat.peso}`,
      peso: cat.peso,
      dataInscricao: '2025-12-01',
    };
  });
}

// ── Eventos mockados ─────────────────────────────────────

export const mockEventos: Evento[] = [
  // ── 1. Passado COM resultados ──
  {
    id: 'evt-1',
    nome: 'Copa BlackBelt de treinamento especializado 2025',
    descricao: 'Campeonato interno anual da unidade. Todas as niveis e categorias de peso. Premiação com conquistas e troféus.',
    data: '2025-11-15',
    dataFim: '2025-11-15',
    local: 'Ginásio Municipal de Vespasiano',
    endereco: 'Rua das Flores, 500 - Vespasiano, MG',
    tipo: 'INTERNO',
    status: 'FINALIZADO',
    categorias: CATEGORIAS_INTERNO,
    inscricoesAbertas: false,
    valorInscricao: 0,
    regulamento: 'Regulamento oficial adaptado. Lutas de 5 minutos para iniciantes, 6 minutos para intermediário e 7 para avançado. Uso obrigatório de uniforme branco, azul ou preto.',
    inscritos: gerarInscritos('evt-1', CATEGORIAS_INTERNO, 18),
    resultados: [
      { id: 'res-1', alunoId: 'adulto-001', alunoNome: 'Rafael Mendes', eventoId: 'evt-1', categoriaId: 'cat-int-3', categoriaDescricao: 'Avançado - Peso livre', peso: 'Peso livre', dataInscricao: '2025-10-20', resultado: { posicao: 1, conquista: 'OURO' } },
      { id: 'res-2', alunoId: 'adulto-005', alunoNome: 'André Barbosa', eventoId: 'evt-1', categoriaId: 'cat-int-3', categoriaDescricao: 'Avançado - Peso livre', peso: 'Peso livre', dataInscricao: '2025-10-22', resultado: { posicao: 2, conquista: 'PRATA' } },
      { id: 'res-3', alunoId: 'adulto-003', alunoNome: 'Bruno Santos', eventoId: 'evt-1', categoriaId: 'cat-int-2', categoriaDescricao: 'Intermediário - Peso livre', peso: 'Peso livre', dataInscricao: '2025-10-18', resultado: { posicao: 1, conquista: 'OURO' } },
      { id: 'res-4', alunoId: 'adulto-007', alunoNome: 'Thiago Lima', eventoId: 'evt-1', categoriaId: 'cat-int-2', categoriaDescricao: 'Intermediário - Peso livre', peso: 'Peso livre', dataInscricao: '2025-10-25', resultado: { posicao: 3, conquista: 'BRONZE' } },
      { id: 'res-5', alunoId: 'adulto-013', alunoNome: 'Carlos Silva', eventoId: 'evt-1', categoriaId: 'cat-int-1', categoriaDescricao: 'Iniciantes - Peso livre', peso: 'Peso livre', dataInscricao: '2025-10-28', resultado: { posicao: 2, conquista: 'PRATA' } },
    ],
    totalVagas: 0,
  },

  // ── 2. Passado COM resultados (externo) ──
  {
    id: 'evt-2',
    nome: 'Campeonato Mineiro de treinamento especializado 2025',
    descricao: 'Etapa estadual do circuito mineiro Federação Estadual. Evento oficial com arbitragem certificada Federação.',
    data: '2025-10-05',
    dataFim: '2025-10-06',
    local: 'Minas Tênis Clube',
    endereco: 'Av. Olegário Maciel, 1516 - Belo Horizonte, MG',
    tipo: 'EXTERNO',
    status: 'FINALIZADO',
    categorias: CATEGORIAS_PADRAO,
    inscricoesAbertas: false,
    valorInscricao: 120,
    regulamento: 'Regulamento oficial Federação Estadual. Pesagem no dia. Documentação obrigatória: RG, atestado médico válido, carteirinha de filiação.',
    inscritos: gerarInscritos('evt-2', CATEGORIAS_PADRAO, 8),
    resultados: [
      { id: 'res-6', alunoId: 'adulto-001', alunoNome: 'Rafael Mendes', eventoId: 'evt-2', categoriaId: 'cat-7', categoriaDescricao: 'Nível Intermediário - Leve', peso: 'Leve (até 76kg)', dataInscricao: '2025-09-15', resultado: { posicao: 1, conquista: 'OURO' } },
      { id: 'res-7', alunoId: 'adulto-004', alunoNome: 'Gabriel Ferreira', eventoId: 'evt-2', categoriaId: 'cat-5', categoriaDescricao: 'Nível Básico - Leve', peso: 'Leve (até 76kg)', dataInscricao: '2025-09-18', resultado: { posicao: 3, conquista: 'BRONZE' } },
    ],
    totalVagas: 200,
  },

  // ── 3. Futuro (inscrições abertas) ──
  {
    id: 'evt-3',
    nome: 'Open BlackBelt 2026',
    descricao: 'Grande evento aberto a todas as unidades da região metropolitana de BH. Premiação em dinheiro para niveis marrom e preta.',
    data: '2026-04-18',
    dataFim: '2026-04-19',
    local: 'Ginásio Poliesportivo de Vespasiano',
    endereco: 'Av. Prefeito Sebastião, 1200 - Vespasiano, MG',
    tipo: 'EXTERNO',
    status: 'INSCRICOES_ABERTAS',
    categorias: CATEGORIAS_PADRAO,
    inscricoesAbertas: true,
    prazoInscricao: '2026-04-10',
    valorInscricao: 90,
    regulamento: 'Regulamento Federação. Pesagem na véspera. Uniforme oficial obrigatório. Menores devem apresentar autorização dos responsáveis.',
    inscritos: gerarInscritos('evt-3', CATEGORIAS_PADRAO, 5),
    totalVagas: 150,
  },

  // ── 4. Futuro (agendado, inscrições em breve) ──
  {
    id: 'evt-4',
    nome: 'Seminário com Mestre Roberto Traven',
    descricao: 'Seminário exclusivo de passagem de guarda e controle de distância com o lendário Mestre Roberto Traven. Vagas limitadas.',
    data: '2026-06-07',
    local: 'BlackBelt — Unidade Centro',
    endereco: 'Rua Principal, 100 - Vespasiano, MG',
    tipo: 'EXTERNO',
    status: 'AGENDADO',
    categorias: [
      { id: 'cat-sem-1', nivel: 'Todas as niveis', peso: 'N/A' },
    ],
    inscricoesAbertas: false,
    prazoInscricao: '2026-05-30',
    valorInscricao: 150,
    inscritos: [],
    totalVagas: 40,
  },

  // ── 5. Interno (futuro, inscrições abertas) ──
  {
    id: 'evt-5',
    nome: 'Desafio Interno — Março 2026',
    descricao: 'Desafio mensal entre turmas. Pontuação extra no ranking para todos os participantes. Sem cobrança de inscrição.',
    data: '2026-03-22',
    local: 'BlackBelt — Unidade Centro',
    tipo: 'INTERNO',
    status: 'INSCRICOES_ABERTAS',
    categorias: CATEGORIAS_INTERNO,
    inscricoesAbertas: true,
    prazoInscricao: '2026-03-20',
    valorInscricao: 0,
    regulamento: 'Lutas de 5 minutos. Sistema de pontos com vantagem. Sem finalização por cervical para iniciantes.',
    inscritos: gerarInscritos('evt-5', CATEGORIAS_INTERNO, 12),
    totalVagas: 0,
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getEventoById(id: string): Evento | undefined {
  return mockEventos.find(e => e.id === id);
}

export function getEventosFuturos(): Evento[] {
  return mockEventos.filter(e => ['AGENDADO', 'INSCRICOES_ABERTAS', 'EM_ANDAMENTO'].includes(e.status));
}

export function getEventosPassados(): Evento[] {
  return mockEventos.filter(e => ['FINALIZADO', 'CANCELADO'].includes(e.status));
}
