// ============================================================
// Minhas Turmas Mock — Student's enrolled classes
// ============================================================

export interface TurmaAluno {
  id: string;
  nome: string;
  categoria: 'Kids' | 'Teen' | 'Adulto' | 'Avançado' | 'Competição';
  professorNome: string;
  professorAvatar?: string;
  diasSemana: string[];
  horario: string;
  sala: string;
  /** Capacity / enrolled */
  capacidade: number;
  matriculados: number;
  /** Student's attendance % in this class */
  minhaPresenca: number;
  /** Next class info */
  proximaSessao: {
    dia: string;       // "Hoje", "Amanhã", "Segunda"
    horario: string;   // "19:00"
    emAndamento: boolean;
  };
  /** Recent class topics */
  ultimosAssuntos: string[];
  /** Accent color */
  cor: string;
}

function getProximaAulaDia(dias: string[]): { dia: string; horario: string; emAndamento: boolean } {
  const DIAS_MAP: Record<string, number> = {
    'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3,
    'Quinta': 4, 'Sexta': 5, 'Sábado': 6,
  };
  const now = new Date();
  const hoje = now.getDay();
  const hora = now.getHours();

  for (const d of dias) {
    const diaNum = DIAS_MAP[d];
    if (diaNum === hoje && hora < 22) {
      return { dia: 'Hoje', horario: '19:00', emAndamento: hora >= 19 && hora < 21 };
    }
  }
  for (const d of dias) {
    const diaNum = DIAS_MAP[d];
    if (diaNum === (hoje + 1) % 7) {
      return { dia: 'Amanhã', horario: '19:00', emAndamento: false };
    }
  }
  return { dia: dias[0], horario: '19:00', emAndamento: false };
}

export function getMockMinhasTurmas(): TurmaAluno[] {
  return [
    {
      id: 'TUR001',
      nome: 'Gi Avançado',
      categoria: 'Avançado',
      professorNome: 'Mestre João Silva',
      diasSemana: ['Segunda', 'Quarta', 'Sexta'],
      horario: '19:00 – 20:30',
      sala: 'Ambiente Principal',
      capacidade: 30,
      matriculados: 24,
      minhaPresenca: 92,
      proximaSessao: getProximaAulaDia(['Segunda', 'Quarta', 'Sexta']),
      ultimosAssuntos: ['Passagem de guarda DLR', 'Raspagem X-Guard', 'Leg drag'],
      cor: '#8B5CF6',
    },
    {
      id: 'TUR002',
      nome: 'Fundamentos',
      categoria: 'Adulto',
      professorNome: 'Prof. Carlos Lima',
      diasSemana: ['Terça', 'Quinta'],
      horario: '20:00 – 21:00',
      sala: 'Ambiente 2',
      capacidade: 25,
      matriculados: 18,
      minhaPresenca: 85,
      proximaSessao: getProximaAulaDia(['Terça', 'Quinta']),
      ultimosAssuntos: ['Fuga de montada', 'Armlock da guarda', 'Postura na guarda fechada'],
      cor: '#3B82F6',
    },
    {
      id: 'TUR005',
      nome: 'No-Gi / Submission',
      categoria: 'Competição',
      professorNome: 'Mestre João Silva',
      diasSemana: ['Sábado'],
      horario: '10:00 – 11:30',
      sala: 'Ambiente Principal',
      capacidade: 20,
      matriculados: 14,
      minhaPresenca: 75,
      proximaSessao: getProximaAulaDia(['Sábado']),
      ultimosAssuntos: ['Heel hook defense', 'Wrestling takedowns', 'Guillotine setups'],
      cor: '#F59E0B',
    },
  ];
}
