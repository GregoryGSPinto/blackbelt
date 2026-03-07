/**
 * Teen Service — Perfis teen, sessões, conquistas, check-ins
 *
 * MOCK:  useMock() === true → dados de __mocks__/teen.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-015): Implementar endpoints teen
 *   GET /teen/profiles
 *   GET /teen/sessões
 *   GET /teen/conquistas
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

import type {
  TeenProfile, TeenAula, TeenConquista, TeenCheckin,
} from '@/lib/__mocks__/teen.mock';

export type {
  TeenProfile, TeenAula, TeenConquista, TeenCheckin,
};

async function getMock() {
  return import('@/lib/__mocks__/teen.mock');
}

export async function getTeenProfiles(responsavelId?: string): Promise<TeenProfile[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (responsavelId) return m.getTeensByResponsavel(responsavelId);
    return [...m.TEEN_PROFILES];
  }
  const url = responsavelId ? `/teen/profiles?responsavelId=${responsavelId}` : '/teen/profiles';
  const { data } = await apiClient.get<TeenProfile[]>(url);
  return data;
}

export async function getTeenSessoes(nivel?: string): Promise<TeenAula[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (nivel) return m.getSessoesByNivel(nivel);
    return [...m.TEEN_SESSÕES];
  }
  const url = nivel ? `/teen/sessões?nivel=${nivel}` : '/teen/sessões';
  const { data } = await apiClient.get<TeenAula[]>(url);
  return data;
}

export async function getConquistas(): Promise<TeenConquista[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.TEEN_CONQUISTAS]; }
  const { data } = await apiClient.get<TeenConquista[]>('/teen/conquistas');
  return data;
}

export async function getTeenCheckins(): Promise<TeenCheckin[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.TEEN_CHECKINS]; }
  const { data } = await apiClient.get<TeenCheckin[]>('/teen/checkins');
  return data;
}

// TODO(BE-011): Migrar helpers síncronos para endpoints async quando backend estiver pronto
// Re-export synchronous helpers
export {
  getTeenById, getTeensByResponsavel, getSessoesByNivel,
  calcularRiscoEvasao, getProximaMeta,
  TEEN_PROFILES, TEEN_SESSÕES, TEEN_CONQUISTAS, TEEN_CHECKINS,
} from '@/lib/__mocks__/teen.mock';

/** Alias with accent for consumers using the accented name */
export const getTeenSessões = getTeenSessoes;

// ── Knowledge Areas (Academia) ──
export interface KnowledgeArea {
  id: string;
  icon: string;
  title: string;
  description: string;
  progress: number;
  questions: number;
  answered: number;
  accent: 'ocean' | 'purple' | 'emerald' | 'energy';
}

export async function getKnowledgeAreas(): Promise<KnowledgeArea[]> {
  if (useMock()) {
    await mockDelay();
    return [
      { id: 'fundamentos', icon: 'GraduationCap', title: 'Fundamentos do treinamento especializado', description: 'As bases essenciais para evoluir com seguranca no ambiente.', progress: 80, questions: 5, answered: 5, accent: 'ocean' },
      { id: 'conceitos', icon: 'Brain', title: 'Conceitos Essenciais', description: 'Os conceitos por tras de cada movimento no ambiente.', progress: 40, questions: 5, answered: 2, accent: 'purple' },
      { id: 'regras', icon: 'Users', title: 'Regras e Etica', description: 'As regras que fazem do ambiente um lugar de respeito.', progress: 60, questions: 5, answered: 3, accent: 'emerald' },
      { id: 'historia', icon: 'BookOpen', title: 'Historia e Filosofia', description: 'A historia do treinamento especializado e seus valores fundamentais.', progress: 55, questions: 5, answered: 2, accent: 'energy' },
      { id: 'mental', icon: 'Heart', title: 'Preparacao Mental', description: 'Como sua mente pode acelerar sua evolucao.', progress: 75, questions: 5, answered: 4, accent: 'purple' },
      { id: 'seguranca', icon: 'Shield', title: 'Seguranca e Prevencao', description: 'Treinar forte e seguro, sem se machucar.', progress: 65, questions: 5, answered: 3, accent: 'ocean' },
    ];
  }
  const { data } = await apiClient.get<KnowledgeArea[]>('/teen/unidade/areas');
  return data;
}
