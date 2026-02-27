/**
 * Mock Data — Teen — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém dados mock para desenvolvimento.
 * Em produção com NEXT_PUBLIC_API_URL definida, substitua por API real.
 */

// Mock Data para Sistema Teen - BLACKBELT
// Perfil Adolescente (12-17 anos)

export interface TeenProfile {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  idade: number; // 12-17
  dataNascimento: string;
  nivel: 'Branca' | 'Azul' | 'Roxa' | 'Marrom';
  turma: string;
  instrutor: string;
  responsavel: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
  };
  status: 'ATIVO' | 'EM_ATRASO' | 'BLOQUEADO';
  progresso: {
    presenca30dias: number; // porcentagem
    sessõesAssistidas: number;
    tempoTreinoTotal: number; // em horas
    evolucaoNível: number; // 0-100%
    sequenciaAtual: number; // dias consecutivos
    ultimoTreino: string;
  };
  riscoEvasao: 'BAIXO' | 'MEDIO' | 'ALTO';
  avatar: string;
}

export interface TeenSessão {
  id: string;
  unidadeId?: string; // Multi-tenant
  titulo: string;
  instrutor: string;
  duracao: string;
  nivel: string;
  categoria: string;
  thumbnail: string;
  progresso: number; // 0-100
  assistido: boolean;
  descricao: string;
}

/** Alias */
export type TeenAula = TeenSessão;

export interface TeenConquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  conquistada: boolean;
  dataConquista?: string;
  progresso?: number; // para conquistas em andamento
  requisito?: string;
}

export interface TeenCheckin {
  id: string;
  unidadeId?: string; // Multi-tenant
  teenId: string;
  teenNome: string;
  responsavelNome: string;
  data: string;
  hora: string;
  iniciadoPor: 'teen' | 'responsavel' | 'recepcao';
  status: 'APROVADO' | 'PENDENTE' | 'NEGADO';
  motivo?: string;
}

// Perfis de Adolescentes
export const TEEN_PROFILES: TeenProfile[] = [
  {
    id: 'teen001',
    nome: 'Bruno Santos',
    idade: 15,
    dataNascimento: '2011-03-15',
    nivel: 'Azul',
    turma: 'Teen A - Terça e Quinta, 18:00',
    instrutor: 'Prof. João Silva',
    responsavel: {
      id: 'parent005',
      nome: 'Carlos Santos',
      email: 'carlos.santos@email.com',
      telefone: '(11) 98765-4321',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 85,
      sessõesAssistidas: 12,
      tempoTreinoTotal: 180, // horas
      evolucaoNível: 65,
      sequenciaAtual: 7,
      ultimoTreino: '2026-02-02',
    },
    riscoEvasao: 'BAIXO',
    avatar: '🧑',
  },
  {
    id: 'teen002',
    nome: 'Ana Silva',
    idade: 14,
    dataNascimento: '2012-07-22',
    nivel: 'Roxa',
    turma: 'Teen A - Terça e Quinta, 18:00',
    instrutor: 'Prof. João Silva',
    responsavel: {
      id: 'parent006',
      nome: 'Maria Silva',
      email: 'maria.silva@email.com',
      telefone: '(11) 97654-3210',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 90,
      sessõesAssistidas: 18,
      tempoTreinoTotal: 240,
      evolucaoNível: 75,
      sequenciaAtual: 12,
      ultimoTreino: '2026-02-02',
    },
    riscoEvasao: 'BAIXO',
    avatar: '👧',
  },
  {
    id: 'teen003',
    nome: 'Pedro Costa',
    idade: 16,
    dataNascimento: '2010-11-08',
    nivel: 'Azul',
    turma: 'Teen B - Segunda e Quarta, 19:00',
    instrutor: 'Prof. Ana Paula',
    responsavel: {
      id: 'parent007',
      nome: 'João Costa',
      email: 'joao.costa@email.com',
      telefone: '(11) 96543-2109',
    },
    status: 'EM_ATRASO',
    progresso: {
      presenca30dias: 65,
      sessõesAssistidas: 8,
      tempoTreinoTotal: 150,
      evolucaoNível: 50,
      sequenciaAtual: 0,
      ultimoTreino: '2026-01-28',
    },
    riscoEvasao: 'MEDIO',
    avatar: '🧑',
  },
  {
    id: 'teen004',
    nome: 'Lucas Martins',
    idade: 13,
    dataNascimento: '2013-05-19',
    nivel: 'Branca',
    turma: 'Teen A - Terça e Quinta, 18:00',
    instrutor: 'Prof. João Silva',
    responsavel: {
      id: 'parent008',
      nome: 'Roberto Martins',
      email: 'roberto.martins@email.com',
      telefone: '(11) 95432-1098',
    },
    status: 'BLOQUEADO',
    progresso: {
      presenca30dias: 30,
      sessõesAssistidas: 2,
      tempoTreinoTotal: 40,
      evolucaoNível: 20,
      sequenciaAtual: 0,
      ultimoTreino: '2026-01-10',
    },
    riscoEvasao: 'ALTO',
    avatar: '🧑',
  },
];

// Sessões Teen
export const TEEN_SESSÕES: TeenAula[] = [
  {
    id: 'aula_teen_001',
    titulo: 'Raspagem de Meia Guarda',
    instrutor: 'Prof. João Silva',
    duracao: '18 min',
    nivel: 'Azul',
    categoria: 'Raspagem',
    thumbnail: '🥋',
    progresso: 65,
    assistido: false,
    descricao: 'Aprenda técnicas eficientes de raspagem a partir da meia guarda',
  },
  {
    id: 'aula_teen_002',
    titulo: 'Passagem de Guarda Moderna',
    instrutor: 'Prof. Ana Paula',
    duracao: '22 min',
    nivel: 'Azul',
    categoria: 'Passagem',
    thumbnail: '🥋',
    progresso: 100,
    assistido: true,
    descricao: 'Técnicas modernas para passar guardas complexas',
  },
  {
    id: 'aula_teen_003',
    titulo: 'Defesa de Costas',
    instrutor: 'Prof. João Silva',
    duracao: '15 min',
    nivel: 'Branca',
    categoria: 'Defesa',
    thumbnail: '🥋',
    progresso: 0,
    assistido: false,
    descricao: 'Como se defender quando o adversário está nas suas costas',
  },
  {
    id: 'aula_teen_004',
    titulo: 'Finalização: Triângulo',
    instrutor: 'Prof. Ana Paula',
    duracao: '20 min',
    nivel: 'Azul',
    categoria: 'Finalização',
    thumbnail: '🥋',
    progresso: 0,
    assistido: false,
    descricao: 'Variações e detalhes do triângulo de guarda',
  },
  {
    id: 'aula_teen_005',
    titulo: 'Preparo Físico para Competição',
    instrutor: 'Prof. Ricardo',
    duracao: '25 min',
    nivel: 'Todas',
    categoria: 'Físico',
    thumbnail: '💪',
    progresso: 40,
    assistido: false,
    descricao: 'Treino físico específico para competidores juvenis',
  },
];

// Conquistas Teen
export const TEEN_CONQUISTAS: TeenConquista[] = [
  {
    id: 'conquista_teen_001',
    nome: '15 Treinos',
    descricao: 'Completou 15 treinos presenciais',
    icone: '🥋',
    conquistada: true,
    dataConquista: '2026-01-20',
  },
  {
    id: 'conquista_teen_002',
    nome: 'Sequência de Fogo',
    descricao: '7 dias consecutivos de treino',
    icone: '🔥',
    conquistada: true,
    dataConquista: '2026-02-01',
  },
  {
    id: 'conquista_teen_003',
    nome: 'Estudante Dedicado',
    descricao: 'Assistiu 10 sessões online',
    icone: '📚',
    conquistada: true,
    dataConquista: '2026-01-28',
  },
  {
    id: 'conquista_teen_004',
    nome: 'Competidor',
    descricao: 'Participou de 1 competição',
    icone: '🏆',
    conquistada: false,
    progresso: 0,
    requisito: 'Participar de uma competição oficial',
  },
  {
    id: 'conquista_teen_005',
    nome: 'Mestre do Tempo',
    descricao: '100 horas de treino acumuladas',
    icone: '⏱️',
    conquistada: false,
    progresso: 180,
    requisito: '180/200 horas',
  },
  {
    id: 'conquista_teen_006',
    nome: 'Evolução',
    descricao: 'Conquistou novo nível',
    icone: '🎖️',
    conquistada: false,
    progresso: 65,
    requisito: '65% completo para Nível Intermediário',
  },
];

// Check-ins Teen
export const TEEN_CHECKINS: TeenCheckin[] = [
  {
    id: 'checkin_teen_001',
    teenId: 'teen001',
    teenNome: 'Bruno Santos',
    responsavelNome: 'Carlos Santos',
    data: '2026-02-03',
    hora: '17:45',
    iniciadoPor: 'teen',
    status: 'APROVADO',
  },
  {
    id: 'checkin_teen_002',
    teenId: 'teen002',
    teenNome: 'Ana Silva',
    responsavelNome: 'Maria Silva',
    data: '2026-02-03',
    hora: '17:50',
    iniciadoPor: 'teen',
    status: 'APROVADO',
  },
  {
    id: 'checkin_teen_003',
    teenId: 'teen003',
    teenNome: 'Pedro Costa',
    responsavelNome: 'João Costa',
    data: '2026-02-03',
    hora: '18:50',
    iniciadoPor: 'teen',
    status: 'PENDENTE',
    motivo: 'Validação do responsável necessária',
  },
];

// Helper functions
export const getTeenById = (teenId: string): TeenProfile | undefined => {
  return TEEN_PROFILES.find(teen => teen.id === teenId);
};

export const getTeensByResponsavel = (responsavelId: string): TeenProfile[] => {
  return TEEN_PROFILES.filter(teen => teen.responsavel.id === responsavelId);
};

export const getSessoesByNivel = (nivel: string): TeenAula[] => {
  const niveisHierarquia = ['Branca', 'Azul', 'Roxa', 'Marrom', 'Preta'];
  const indice = niveisHierarquia.indexOf(nivel);
  
  return TEEN_SESSÕES.filter(sessão => {
    const indiceSessão = niveisHierarquia.indexOf(sessão.nivel);
    return sessão.nivel === 'Todas' || indiceSessão <= indice;
  });
};

export const calcularRiscoEvasao = (teen: TeenProfile): 'BAIXO' | 'MEDIO' | 'ALTO' => {
  const { presenca30dias, sessõesAssistidas, sequenciaAtual } = teen.progresso;
  
  let pontuacao = 0;
  
  // Presença (40%)
  if (presenca30dias >= 75) pontuacao += 40;
  else if (presenca30dias >= 50) pontuacao += 20;
  
  // Engajamento online (20%)
  if (sessõesAssistidas >= 10) pontuacao += 20;
  else if (sessõesAssistidas >= 5) pontuacao += 10;
  
  // Sequência (20%)
  if (sequenciaAtual >= 5) pontuacao += 20;
  else if (sequenciaAtual >= 3) pontuacao += 10;
  
  // Status (20%)
  if (teen.status === 'ATIVO') pontuacao += 20;
  else if (teen.status === 'EM_ATRASO') pontuacao += 10;
  
  if (pontuacao >= 70) return 'BAIXO';
  if (pontuacao >= 40) return 'MEDIO';
  return 'ALTO';
};

export const getProximaMeta = (evolucaoAtual: number): string => {
  if (evolucaoAtual < 100) {
    return `Faltam ${100 - evolucaoAtual}% para a próxima nivel`;
  }
  return 'Pronto para avaliação de nível!';
};
