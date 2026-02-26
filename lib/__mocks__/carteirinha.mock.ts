/**
 * Mock Data — Carteirinha Digital + Perfil Público — APENAS DESENVOLVIMENTO
 *
 * TODO(BE-021): Substituir por endpoints
 *   GET /carteirinha/me
 *   GET /atleta/:id (público, sem auth)
 */

import type {
  CarteirinhaDigital,
  AtletaPublico,
  GraduacaoHistorico,
} from '@/lib/api/contracts';

// ── Carteirinha do aluno logado ──────────────────────────

export const mockCarteirinha: CarteirinhaDigital = {
  alunoId: 'USR_ADULTO_01',
  matricula: 'COL-2024-0147',
  nome: 'Carlos Silva',
  avatar: undefined,
  nivel: 'Nível Básico',
  unidade: 'BlackBelt',
  unidadeNome: 'Unidade Centro',
  dataInicio: '2023-03-15',
  dataValidade: '2026-03-15',
  status: 'ATIVA',
  codigoQR: 'BLACKBELT-USR_ADULTO_01-2024-A7B3C9',
  codigoBarras: '7891234567890',
  instrutor: 'Prof. Ricardo',
  turma: 'Avançado Noite',
};

// ── Perfis públicos de atletas ───────────────────────────

export const mockAtletasPublicos: AtletaPublico[] = [
  {
    id: 'USR_ADULTO_01',
    nome: 'Carlos Silva',
    avatar: undefined,
    nivelAtual: 'Nível Básico',
    unidade: 'BlackBelt',
    tempoTreino: 34,
    totalCheckins: 312,
    mesesTreinando: 34,
    conquistasRecebidas: 7,
    graduacoes: [
      { nivel: 'Nível Iniciante', data: '2023-03-15', professorNome: 'Prof. Ricardo' },
      { nivel: 'Nível Básico', data: '2024-09-20', professorNome: 'Prof. Ricardo' },
    ],
    linkPublico: 'blackbelt.com.br/atleta/USR_ADULTO_01',
  },
  {
    id: 'USR_TEEN_01',
    nome: 'Miguel Oliveira',
    avatar: undefined,
    nivelAtual: 'Nível Iniciante',
    unidade: 'BlackBelt',
    tempoTreino: 8,
    totalCheckins: 64,
    mesesTreinando: 8,
    conquistasRecebidas: 3,
    graduacoes: [
      { nivel: 'Nível Iniciante', data: '2025-06-10', professorNome: 'Prof. Ricardo' },
    ],
    linkPublico: 'blackbelt.com.br/atleta/USR_TEEN_01',
  },
  {
    id: 'adulto-001',
    nome: 'Rafael Mendes',
    avatar: undefined,
    nivelAtual: 'Nível Intermediário',
    unidade: 'BlackBelt',
    tempoTreino: 72,
    totalCheckins: 890,
    mesesTreinando: 72,
    conquistasRecebidas: 15,
    graduacoes: [
      { nivel: 'Nível Iniciante', data: '2019-02-10', professorNome: 'Prof. Anderson' },
      { nivel: 'Nível Básico', data: '2020-08-15', professorNome: 'Prof. Anderson' },
      { nivel: 'Nível Intermediário', data: '2023-01-20', professorNome: 'Prof. Ricardo' },
    ],
    linkPublico: 'blackbelt.com.br/atleta/adulto-001',
  },
  {
    id: 'adulto-008',
    nome: 'Marcelo Souza',
    avatar: undefined,
    nivelAtual: 'Nível Máximo',
    unidade: 'BlackBelt',
    tempoTreino: 144,
    totalCheckins: 2150,
    mesesTreinando: 144,
    conquistasRecebidas: 42,
    graduacoes: [
      { nivel: 'Nível Iniciante', data: '2014-01-05' },
      { nivel: 'Nível Básico', data: '2015-07-12' },
      { nivel: 'Nível Intermediário', data: '2017-03-28', professorNome: 'Prof. Anderson' },
      { nivel: 'Nível Avançado', data: '2019-11-15', professorNome: 'Prof. Anderson' },
      { nivel: 'Nível Máximo', data: '2022-06-01', professorNome: 'Prof. Ricardo' },
    ],
    linkPublico: 'blackbelt.com.br/atleta/adulto-008',
  },
];

// ── Helpers ───────────────────────────────────────────────

export function getAtletaPublico(id: string): AtletaPublico | undefined {
  return mockAtletasPublicos.find(a => a.id === id);
}
