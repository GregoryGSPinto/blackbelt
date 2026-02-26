/**
 * Mock Data — Professor — APENAS DESENVOLVIMENTO
 *
 * Tipos importados de instrutor.service.ts (import type, sem runtime dep).
 */

import type {
  TurmaResumo,
  AvaliacaoPendente,
  VideoRecente,
  AlunoProgresso,
  AtividadeRecente,
  EstatisticaGeral,
  ProfessorDashboard,
} from '@/lib/api/instrutor.service';

export const TURMAS: TurmaResumo[] = [
  {
    id: 'turma_kids_a',
    nome: 'Kids Iniciante',
    categoria: 'Kids',
    horario: '17:00 – 18:00',
    dias: 'Ter · Qui',
    totalAlunos: 14,
    presentes: 12,
    presencaMedia: 88,
    proximaSessao: 'Amanhã, 17:00',
    cor: 'from-sky-500 to-blue-600',
  },
  {
    id: 'turma_teen',
    nome: 'Teen Competição',
    categoria: 'Teen',
    horario: '18:00 – 19:00',
    dias: 'Seg · Qua',
    totalAlunos: 10,
    presentes: 8,
    presencaMedia: 82,
    proximaSessao: 'Hoje, 18:00',
    cor: 'from-violet-500 to-purple-600',
  },
  {
    id: 'turma_adulto',
    nome: 'Adulto Fundamentos',
    categoria: 'Adulto',
    horario: '19:30 – 21:00',
    dias: 'Seg · Qua · Sex',
    totalAlunos: 22,
    presentes: 18,
    presencaMedia: 78,
    proximaSessao: 'Hoje, 19:30',
    cor: 'from-amber-500 to-orange-600',
  },
  {
    id: 'turma_avancado',
    nome: 'Avançado / Competição',
    categoria: 'Avançado',
    horario: '21:00 – 22:30',
    dias: 'Seg · Qua · Sex',
    totalAlunos: 8,
    presentes: 7,
    presencaMedia: 92,
    proximaSessao: 'Hoje, 21:00',
    cor: 'from-red-500 to-rose-600',
  },
];

export const AVALIACOES_PENDENTES: AvaliacaoPendente[] = [
  { id: 'aval_01', aluno: 'Carlos Silva', avatar: '🥋', turma: 'Adulto Fundamentos', tipo: 'graduacao', prazo: '3 dias', prioridade: 'alta' },
  { id: 'aval_02', aluno: 'Pedro Ferreira', avatar: '👦', turma: 'Kids Iniciante', tipo: 'tecnica', prazo: '5 dias', prioridade: 'media' },
  { id: 'aval_03', aluno: 'Miguel Oliveira', avatar: '🤸', turma: 'Teen Competição', tipo: 'comportamento', prazo: '7 dias', prioridade: 'baixa' },
  { id: 'aval_04', aluno: 'Ana Torres', avatar: '💪', turma: 'Avançado / Competição', tipo: 'graduacao', prazo: '2 dias', prioridade: 'alta' },
];

export const VIDEOS_RECENTES: VideoRecente[] = [
  { id: 'vid_01', titulo: 'Passagem de Guarda — Toreando', thumbnail: '/images/bg-dark.jpg', duracao: '12:34', turma: 'Adulto Fundamentos', dataEnvio: 'Hoje', visualizacoes: 47, tipo: 'aula' },
  { id: 'vid_02', titulo: 'Análise de Luta — Regional', thumbnail: '/images/bg-dark.jpg', duracao: '08:22', turma: 'Avançado', dataEnvio: 'Ontem', visualizacoes: 23, tipo: 'analise' },
  { id: 'vid_03', titulo: 'Defesa de Triângulo', thumbnail: '/images/bg-dark.jpg', duracao: '06:15', turma: 'Teen Competição', dataEnvio: '3 dias atrás', visualizacoes: 31, tipo: 'demonstracao' },
];

export const ALUNOS_DESTAQUE: AlunoProgresso[] = [
  { id: 'al_01', nome: 'Ana Torres', avatar: '💪', nivel: 'Roxa', presenca30d: 96, ultimaSessao: 'Hoje', status: 'em_dia' },
  { id: 'al_02', nome: 'Carlos Silva', avatar: '🥋', nivel: 'Azul', presenca30d: 90, ultimaSessao: 'Ontem', status: 'em_dia' },
  { id: 'al_03', nome: 'Beatriz Oliveira', avatar: '🤸', nivel: 'Cinza', presenca30d: 92, ultimaSessao: 'Hoje', status: 'em_dia' },
  { id: 'al_04', nome: 'Lucas Mendes', avatar: '🏋️', nivel: 'Branca', presenca30d: 45, ultimaSessao: '12 dias atrás', status: 'ausente' },
  { id: 'al_05', nome: 'Fernanda Rocha', avatar: '🥇', nivel: 'Azul', presenca30d: 68, ultimaSessao: '5 dias atrás', status: 'atencao' },
];

export const ATIVIDADES_RECENTES: AtividadeRecente[] = [
  { id: 'act_01', tipo: 'checkin', descricao: 'Check-in de 18 alunos — Adulto Fundamentos', tempo: '2h atrás', icone: '✅' },
  { id: 'act_02', tipo: 'video', descricao: 'Novo vídeo enviado: Passagem de Guarda', tempo: '4h atrás', icone: '🎬' },
  { id: 'act_03', tipo: 'graduacao', descricao: 'Ana Torres aprovada para Nível Intermediário', tempo: 'Ontem', icone: '🎖️' },
  { id: 'act_04', tipo: 'avaliacao', descricao: 'Avaliação técnica de Pedro Ferreira criada', tempo: 'Ontem', icone: '📋' },
  { id: 'act_05', tipo: 'checkin', descricao: 'Check-in de 8 alunos — Teen Competição', tempo: '2 dias atrás', icone: '✅' },
];

export const ESTATISTICAS: EstatisticaGeral = {
  totalAlunos: 54,
  totalTurmas: 4,
  presencaMedia: 84,
  avaliacoesPendentes: 4,
  sessõesEsteMes: 18,
  horasTreinadas: 27,
};

export function getMockDashboard(): ProfessorDashboard {
  return {
    estatisticas: { ...ESTATISTICAS },
    turmas: [...TURMAS],
    avaliacoesPendentes: [...AVALIACOES_PENDENTES],
    videosRecentes: [...VIDEOS_RECENTES],
    alunosDestaque: [...ALUNOS_DESTAQUE],
    atividadesRecentes: [...ATIVIDADES_RECENTES],
  };
}
