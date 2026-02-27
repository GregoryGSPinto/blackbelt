/**
 * Mock Data — Plano de Sessão
 * TODO(BE-039): Substituir por endpoints plano-aula
 */

import type { TecnicaPratica, PlanoSessão } from '@/lib/api/contracts';

export const mockTecnicas: TecnicaPratica[] = [
  // Guarda
  { id: 't1', nome: 'Armlock da Guarda Fechada', posicao: 'Guarda Fechada', tipo: 'finalizacao', nivelMinimo: 'Nível Iniciante', descricao: 'Armlock clássico partindo da guarda fechada' },
  { id: 't2', nome: 'Triângulo da Guarda', posicao: 'Guarda Fechada', tipo: 'finalizacao', nivelMinimo: 'Nível Iniciante', descricao: 'Triângulo com as pernas a partir da guarda' },
  { id: 't3', nome: 'Raspagem de Tesoura', posicao: 'Guarda Fechada', tipo: 'raspagem', nivelMinimo: 'Nível Iniciante', descricao: 'Scissor sweep clássico' },
  { id: 't4', nome: 'Raspagem de Pendulum', posicao: 'Guarda Fechada', tipo: 'raspagem', nivelMinimo: 'Nível Básico' },
  { id: 't5', nome: 'Omoplata', posicao: 'Guarda Fechada', tipo: 'finalizacao', nivelMinimo: 'Nível Básico' },
  // Passagem
  { id: 't6', nome: 'Passagem de Toreando', posicao: 'Passagem', tipo: 'ataque', nivelMinimo: 'Nível Iniciante', descricao: 'Passagem rápida com controle das pernas' },
  { id: 't7', nome: 'Passagem com Pressão', posicao: 'Passagem', tipo: 'ataque', nivelMinimo: 'Nível Iniciante' },
  { id: 't8', nome: 'Passagem de X-Pass', posicao: 'Passagem', tipo: 'ataque', nivelMinimo: 'Nível Básico' },
  { id: 't9', nome: 'Leg Drag', posicao: 'Passagem', tipo: 'ataque', nivelMinimo: 'Nível Intermediário' },
  // Costas
  { id: 't10', nome: 'Mata Leão', posicao: 'Costas', tipo: 'finalizacao', nivelMinimo: 'Nível Iniciante', descricao: 'Rear naked choke' },
  { id: 't11', nome: 'Armlock das Costas', posicao: 'Costas', tipo: 'finalizacao', nivelMinimo: 'Nível Básico' },
  { id: 't12', nome: 'Defesa de Costas (Escape)', posicao: 'Costas', tipo: 'defesa', nivelMinimo: 'Nível Iniciante' },
  // Montada
  { id: 't13', nome: 'Americana da Montada', posicao: 'Montada', tipo: 'finalizacao', nivelMinimo: 'Nível Iniciante' },
  { id: 't14', nome: 'Ezekiel da Montada', posicao: 'Montada', tipo: 'finalizacao', nivelMinimo: 'Nível Básico' },
  { id: 't15', nome: 'Fuga da Montada (Upa)', posicao: 'Montada', tipo: 'defesa', nivelMinimo: 'Nível Iniciante' },
  // Meia Guarda
  { id: 't16', nome: 'Underhook da Meia Guarda', posicao: 'Meia Guarda', tipo: 'raspagem', nivelMinimo: 'Nível Básico' },
  { id: 't17', nome: 'Kimura da Meia Guarda', posicao: 'Meia Guarda', tipo: 'finalizacao', nivelMinimo: 'Nível Básico' },
  // No-Gi
  { id: 't18', nome: 'Guillotina', posicao: 'Clinch', tipo: 'finalizacao', nivelMinimo: 'Nível Iniciante' },
  { id: 't19', nome: 'Darce Choke', posicao: 'Lateral', tipo: 'finalizacao', nivelMinimo: 'Nível Intermediário' },
  { id: 't20', nome: 'Anaconda Choke', posicao: 'Lateral', tipo: 'finalizacao', nivelMinimo: 'Nível Intermediário' },
];

export const mockPlanos: PlanoSessão[] = [
  {
    id: 'pl-1', titulo: 'Fundamentals — Guarda Fechada', turmaId: 'TUR001', turmaNome: 'Fundamentals', data: '2026-02-17', professorId: 'PROF001',
    duracaoTotal: 60, template: false, tags: ['guarda', 'fundamentos'],
    itens: [
      { id: 'i1', fase: 'aquecimento', titulo: 'Mobilidade + solo drills', descricao: 'Granby roll, shrimp, ponte, rolamento', duracaoMinutos: 10 },
      { id: 'i2', fase: 'tecnica', titulo: 'Armlock da guarda fechada', descricao: 'Demonstração + detalhes da quebra de postura', duracaoMinutos: 15, tecnicaId: 't1' },
      { id: 'i3', fase: 'tecnica', titulo: 'Triângulo da guarda', descricao: 'Combinação armlock → triângulo', duracaoMinutos: 15, tecnicaId: 't2' },
      { id: 'i4', fase: 'drill', titulo: 'Drill de posição', descricao: 'Aluno A ataca, B defende. 3min cada lado', duracaoMinutos: 10 },
      { id: 'i5', fase: 'sparring', titulo: 'Rola livre', descricao: '2 rounds de 5 min', duracaoMinutos: 10 },
    ],
  },
  {
    id: 'pl-2', titulo: 'Template — Sessão Padrão Kids', professorId: 'PROF002',
    data: '', duracaoTotal: 45, template: true, tags: ['kids', 'template'],
    itens: [
      { id: 'i6', fase: 'aquecimento', titulo: 'Brincadeira funcional', descricao: 'Pega-pega no ambiente, jacaré', duracaoMinutos: 10 },
      { id: 'i7', fase: 'tecnica', titulo: 'Técnica do dia', descricao: 'Definir conforme planejamento semanal', duracaoMinutos: 15 },
      { id: 'i8', fase: 'drill', titulo: 'Drill em dupla', descricao: 'Repetição da técnica com parceiro', duracaoMinutos: 10 },
      { id: 'i9', fase: 'sparring', titulo: 'Rola kids', descricao: '3 rounds de 3 min', duracaoMinutos: 10 },
    ],
  },
];
