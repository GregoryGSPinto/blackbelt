/**
 * Mock Data — Kids & Teens — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém dados mock para desenvolvimento.
 * Em produção com NEXT_PUBLIC_API_URL definida, substitua por API real.
 * 
 * FAMÍLIAS:
 * ┌──────────────────┬──────────────────────────────────────────────────────────┐
 * │ Família Ferreira │ Ana (mãe) + Pedro (8, kids) + Sofia (6, kids)           │
 * │ Família Oliveira │ Roberto (pai) + Miguel (15, teen) + Beatriz (14, teen)  │
 * └──────────────────┴──────────────────────────────────────────────────────────┘
 */

// ============================================================
// TIPOS
// ============================================================

export interface KidProfile {
  id: string;
  userId: string; // ID do usuário autenticado (AuthContext)
  unidadeId?: string; // Multi-tenant
  nome: string;
  idade: number;
  nivel: 'Cinza' | 'Amarela' | 'Laranja' | 'Verde';
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
    presenca30dias: number;
    sessõesAssistidas: number;
    desafiosConcluidos: number;
    conquistasConquistadas: number;
  };
  avatar: string;
  familyId: string;
}

export interface TeenProfile {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  idade: number;
  nivel: 'Branca' | 'Cinza' | 'Amarela' | 'Laranja' | 'Verde';
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
    presenca30dias: number;
    sessõesAssistidas: number;
    desafiosConcluidos: number;
    conquistasConquistadas: number;
  };
  avatar: string;
  familyId: string;
}

export interface ParentProfile {
  id: string;
  unidadeId?: string; // Multi-tenant
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  filhos: string[]; // IDs dos filhos
  statusFinanceiro: 'ATIVO' | 'EM_ATRASO' | 'BLOQUEADO';
  mensalidade: number;
  familyId: string;
}

export interface KidsMascot {
  id: string;
  nome: string;
  animal: string;
  emoji: string;
  personalidade: string;
  cor: string;
  descricao: string;
}

export interface KidsChallenge {
  id: string;
  titulo: string;
  tipo: 'quiz' | 'memoria' | 'semanal';
  dificuldade: 'facil' | 'medio' | 'dificil';
  estrelas: number;
  concluido: boolean;
  progresso: number;
}

export interface KidsMedal {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  conquistada: boolean;
  dataConquista?: string;
}

// ============================================================
// MASCOTES
// ============================================================

export const MASCOTES: KidsMascot[] = [
  {
    id: 'tora',
    nome: 'Tora',
    animal: 'Tigre',
    emoji: '🐯',
    personalidade: 'Corajoso e Forte',
    cor: 'orange',
    descricao: 'O tigre corajoso que ensina força e determinação!',
  },
  {
    id: 'pandi',
    nome: 'Pandi',
    animal: 'Panda',
    emoji: '🐼',
    personalidade: 'Calmo e Sábio',
    cor: 'gray',
    descricao: 'O panda sábio que ensina paciência e equilíbrio!',
  },
  {
    id: 'leo',
    nome: 'Leo',
    animal: 'Leão',
    emoji: '🦁',
    personalidade: 'Líder e Confiante',
    cor: 'yellow',
    descricao: 'O leão líder que ensina confiança e coragem!',
  },
  {
    id: 'tatu',
    nome: 'Tatu',
    animal: 'Elefante',
    emoji: '🐘',
    personalidade: 'Forte e Paciente',
    cor: 'blue',
    descricao: 'O elefante forte que ensina paciência e persistência!',
  },
  {
    id: 'zen',
    nome: 'Zen',
    animal: 'Bicho-Preguiça',
    emoji: '🦥',
    personalidade: 'Tranquilo e Focado',
    cor: 'green',
    descricao: 'O bicho-preguiça zen que ensina foco e tranquilidade!',
  },
  {
    id: 'kiko',
    nome: 'Kiko',
    animal: 'Macaco',
    emoji: '🐵',
    personalidade: 'Ágil e Esperto',
    cor: 'purple',
    descricao: 'O macaco ágil que ensina velocidade e esperteza!',
  },
  {
    id: 'gira',
    nome: 'Gira',
    animal: 'Girafa',
    emoji: '🦒',
    personalidade: 'Elegante e Alto',
    cor: 'pink',
    descricao: 'A girafa elegante que ensina postura e visão ampla!',
  },
];

// ============================================================
// FAMÍLIA FERREIRA — Kids (Pedro 8, Sofia 6) + Mãe (Ana)
// ============================================================

export const KIDS_PROFILES: KidProfile[] = [
  {
    id: 'kid001',
    userId: 'USR_KID_01',
    nome: 'Pedro Ferreira',
    idade: 8,
    nivel: 'Cinza',
    turma: 'Kids A - Terça e Quinta, 17:00',
    instrutor: 'Prof. Ana Paula',
    responsavel: {
      id: 'parent_ferreira',
      nome: 'Ana Ferreira',
      email: 'paikids@blackbelt.com',
      telefone: '(31) 98765-4321',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 85,
      sessõesAssistidas: 18,
      desafiosConcluidos: 10,
      conquistasConquistadas: 14,
    },
    avatar: '👦',
    familyId: 'FAM_FERREIRA',
  },
  {
    id: 'kid002',
    userId: 'USR_KID_02',
    nome: 'Sofia Ferreira',
    idade: 6,
    nivel: 'Amarela',
    turma: 'Kids B - Terça e Quinta, 17:00',
    instrutor: 'Prof. Ana Paula',
    responsavel: {
      id: 'parent_ferreira',
      nome: 'Ana Ferreira',
      email: 'paikids@blackbelt.com',
      telefone: '(31) 98765-4321',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 90,
      sessõesAssistidas: 22,
      desafiosConcluidos: 15,
      conquistasConquistadas: 18,
    },
    avatar: '👧',
    familyId: 'FAM_FERREIRA',
  },
];

// ============================================================
// FAMÍLIA OLIVEIRA — Teens (Miguel 15, Beatriz 14) + Pai (Roberto)
// ============================================================

export const TEEN_PROFILES: TeenProfile[] = [
  {
    id: 'teen001',
    nome: 'Miguel Oliveira',
    idade: 15,
    nivel: 'Branca',
    turma: 'Teen - Segunda e Quarta, 18:00',
    instrutor: 'Prof. Ricardo',
    responsavel: {
      id: 'parent_oliveira',
      nome: 'Roberto Oliveira',
      email: 'paiteen@blackbelt.com',
      telefone: '(31) 91234-5678',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 75,
      sessõesAssistidas: 15,
      desafiosConcluidos: 8,
      conquistasConquistadas: 12,
    },
    avatar: '🤸',
    familyId: 'FAM_OLIVEIRA',
  },
  {
    id: 'teen002',
    nome: 'Beatriz Oliveira',
    idade: 14,
    nivel: 'Cinza',
    turma: 'Teen - Segunda e Quarta, 18:00',
    instrutor: 'Prof. Ricardo',
    responsavel: {
      id: 'parent_oliveira',
      nome: 'Roberto Oliveira',
      email: 'paiteen@blackbelt.com',
      telefone: '(31) 91234-5678',
    },
    status: 'ATIVO',
    progresso: {
      presenca30dias: 92,
      sessõesAssistidas: 24,
      desafiosConcluidos: 18,
      conquistasConquistadas: 20,
    },
    avatar: '💪',
    familyId: 'FAM_OLIVEIRA',
  },
];

// ============================================================
// PERFIS DE RESPONSÁVEIS
// ============================================================

export const PARENT_PROFILES: ParentProfile[] = [
  // Mãe dos Kids
  {
    id: 'parent_ferreira',
    nome: 'Ana Ferreira',
    email: 'paikids@blackbelt.com',
    telefone: '(31) 98765-4321',
    cpf: '123.456.789-00',
    filhos: ['kid001', 'kid002'],
    statusFinanceiro: 'ATIVO',
    mensalidade: 150,
    familyId: 'FAM_FERREIRA',
  },
  // Pai dos Teens
  {
    id: 'parent_oliveira',
    nome: 'Roberto Oliveira',
    email: 'paiteen@blackbelt.com',
    telefone: '(31) 91234-5678',
    cpf: '234.567.890-11',
    filhos: ['teen001', 'teen002'],
    statusFinanceiro: 'ATIVO',
    mensalidade: 180,
    familyId: 'FAM_OLIVEIRA',
  },
];

// ============================================================
// DESAFIOS & CONQUISTAS (Kids)
// ============================================================

export const KIDS_CHALLENGES: KidsChallenge[] = [
  {
    id: 'challenge001',
    titulo: 'Qual o nome dessa posição?',
    tipo: 'quiz',
    dificuldade: 'facil',
    estrelas: 3,
    concluido: true,
    progresso: 100,
  },
  {
    id: 'challenge002',
    titulo: 'Para onde o braço vai?',
    tipo: 'quiz',
    dificuldade: 'medio',
    estrelas: 4,
    concluido: false,
    progresso: 60,
  },
  {
    id: 'challenge003',
    titulo: 'Complete o Desafio da Semana!',
    tipo: 'semanal',
    dificuldade: 'medio',
    estrelas: 5,
    concluido: false,
    progresso: 40,
  },
  {
    id: 'challenge004',
    titulo: 'Jogo da Memória das Posições',
    tipo: 'memoria',
    dificuldade: 'facil',
    estrelas: 3,
    concluido: true,
    progresso: 100,
  },
];

export const KIDS_MEDALS: KidsMedal[] = [
  {
    id: 'medal001',
    nome: 'Primeira Aula',
    descricao: 'Assistiu sua primeira sessão completa!',
    icone: '🎖️',
    conquistada: true,
    dataConquista: '2025-01-15',
  },
  {
    id: 'medal002',
    nome: 'Estudante Dedicado',
    descricao: 'Assistiu 10 sessões no app!',
    icone: '📚',
    conquistada: true,
    dataConquista: '2025-02-01',
  },
  {
    id: 'medal003',
    nome: 'Pequeno Samurai',
    descricao: 'Completou 5 desafios!',
    icone: '🥋',
    conquistada: true,
    dataConquista: '2025-01-28',
  },
  {
    id: 'medal004',
    nome: 'Guerreiro Persistente',
    descricao: 'Treinou 10 dias consecutivos!',
    icone: '🏆',
    conquistada: false,
  },
  {
    id: 'medal005',
    nome: 'Mestre dos Desafios',
    descricao: 'Completou 20 desafios!',
    icone: '⭐',
    conquistada: false,
  },
];

// ============================================================
// DICAS DO MASCOTE
// ============================================================

export const TORA_TIPS = [
  'Continue treinando, pequeno guerreiro!',
  'Você está indo muito bem!',
  'Mais uma sessão e você desbloqueia uma conquista!',
  'Que tal fazer um desafio hoje?',
  'Treine com dedicação e você vai longe!',
  'Parabéns pelo seu progresso!',
  'Continue assim, campeão!',
];

// ============================================================
// HISTÓRICO DE CHECK-INS
// ============================================================

export interface KidsCheckin {
  id: string;
  unidadeId?: string; // Multi-tenant
  kidId: string;
  kidNome: string;
  responsavelNome: string;
  data: string;
  hora: string;
  validadoPor: 'app_pai' | 'recepcao';
  status: 'ATIVO' | 'EM_ATRASO' | 'BLOQUEADO';
}

export const KIDS_CHECKINS: KidsCheckin[] = [
  {
    id: 'checkin001',
    kidId: 'kid001',
    kidNome: 'Pedro Ferreira',
    responsavelNome: 'Ana Ferreira',
    data: '2026-02-03',
    hora: '17:15',
    validadoPor: 'recepcao',
    status: 'ATIVO',
  },
  {
    id: 'checkin002',
    kidId: 'kid002',
    kidNome: 'Sofia Ferreira',
    responsavelNome: 'Ana Ferreira',
    data: '2026-02-03',
    hora: '17:20',
    validadoPor: 'app_pai',
    status: 'ATIVO',
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export const getKidById = (kidId: string): KidProfile | undefined => {
  return KIDS_PROFILES.find(kid => kid.id === kidId);
};

/** Retorna perfil kid pelo userId do AuthContext */
export const getKidByUserId = (userId: string): KidProfile | undefined => {
  return KIDS_PROFILES.find(kid => kid.userId === userId);
};

export const getTeenById = (teenId: string): TeenProfile | undefined => {
  return TEEN_PROFILES.find(teen => teen.id === teenId);
};

export const getParentById = (parentId: string): ParentProfile | undefined => {
  return PARENT_PROFILES.find(parent => parent.id === parentId);
};

/** Retorna filhos KIDS de um responsável */
export const getKidsByParent = (parentId: string): KidProfile[] => {
  const parent = getParentById(parentId);
  if (!parent) return [];
  return KIDS_PROFILES.filter(kid => parent.filhos.includes(kid.id));
};

/** Retorna filhos TEEN de um responsável */
export const getTeensByParent = (parentId: string): TeenProfile[] => {
  const parent = getParentById(parentId);
  if (!parent) return [];
  return TEEN_PROFILES.filter(teen => parent.filhos.includes(teen.id));
};

/** Retorna responsável pelo familyId */
export const getParentByFamily = (familyId: string): ParentProfile | undefined => {
  return PARENT_PROFILES.find(p => p.familyId === familyId);
};

/** Retorna o responsável da Família Ferreira (kids) */
export const getKidsParent = (): ParentProfile => {
  return PARENT_PROFILES.find(p => p.familyId === 'FAM_FERREIRA')!;
};

/** Retorna o responsável da Família Oliveira (teens) */
export const getTeensParent = (): ParentProfile => {
  return PARENT_PROFILES.find(p => p.familyId === 'FAM_OLIVEIRA')!;
};

export const getMascotByName = (name: string): KidsMascot | undefined => {
  return MASCOTES.find(mascot => mascot.nome.toLowerCase() === name.toLowerCase());
};

export const getRandomTip = (): string => {
  return TORA_TIPS[Math.floor(Math.random() * TORA_TIPS.length)];
};
