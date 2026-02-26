/**
 * Perfil Estendido Service
 * TODO(BE-068): Implementar endpoints perfil estendido
 */
import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { PerfilEstendido } from '@/lib/api/contracts';

async function getMock() { return import('@/lib/__mocks__/perfil-estendido.mock'); }

export async function getPerfilEstendido(): Promise<PerfilEstendido> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return { ...m.PERFIL_MOCK }; }
  const { data } = await apiClient.get<PerfilEstendido>('/perfil/estendido'); return data;
}

export async function getModalidadesInfo() {
  if (useMock()) { const m = await getMock(); return m.MODALIDADES_INFO; }
  const { data } = await apiClient.get('/perfil/modalidades'); return data;
}

export async function getCategoriasInfo() {
  if (useMock()) { const m = await getMock(); return m.CATEGORIAS_PESO; }
  const { data } = await apiClient.get('/perfil/categorias'); return data;
}
