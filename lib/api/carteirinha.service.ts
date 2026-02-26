/**
 * Carteirinha & Atleta Service — Carteirinha Digital + Perfil Público
 *
 * MOCK:  useMock() === true → retorna dados de __mocks__/carteirinha.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-021): Implementar endpoints
 *   GET /carteirinha/me
 *   GET /atleta/:id (rota pública, sem auth)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { CarteirinhaDigital, AtletaPublico } from './contracts';

export type { CarteirinhaDigital, AtletaPublico };

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/carteirinha.mock');
}

// ── Service functions ─────────────────────────────────────

/** Buscar carteirinha do aluno logado */
export async function getMinhaCarteirinha(): Promise<CarteirinhaDigital> {
  if (useMock()) {
    await mockDelay();
    const { mockCarteirinha } = await getMockModule();
    return mockCarteirinha;
  }

  return apiClient.get<CarteirinhaDigital>('/carteirinha/me').then(r => r.data);
}

/** Buscar perfil público de um atleta (rota pública, sem auth) */
export async function getAtletaPublico(id: string): Promise<AtletaPublico | null> {
  if (useMock()) {
    await mockDelay(300);
    const { getAtletaPublico } = await getMockModule();
    return getAtletaPublico(id) ?? null;
  }

  try {
    return await apiClient.get<AtletaPublico>(`/atleta/${id}`).then(r => r.data);
  } catch {
    return null;
  }
}
