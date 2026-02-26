/**
 * Session Manager — Gerenciamento de Sessões (Padrão Bancário)
 *
 * Permite:
 * - Visualizar sessões ativas
 * - Encerrar sessão específica
 * - Encerrar TODAS sessões (logout global)
 * - Detectar login de dispositivo desconhecido
 *
 * Tabela backend: user_sessions
 *
 * TODO(BE-016): Implementar endpoints de sessão
 *   GET    /auth/sessions              (listar sessões ativas)
 *   DELETE /auth/sessions/:id          (encerrar sessão específica)
 *   DELETE /auth/sessions              (encerrar todas = logout global)
 *   POST   /auth/refresh               (rotação de refresh token)
 */

import { apiClient } from '@/lib/api/client';
import { useMock, mockDelay } from '@/lib/env';
import type { UserSession, DeviceInfo } from '@/lib/api/contracts';
import * as tokenStore from './token-store';
import { getDeviceInfo, isSameDevice } from './device-fingerprint';
import { audit } from './audit';

// ============================================================
// MOCK DATA
// ============================================================

const _mockSessions: UserSession[] = [];

function createMockSession(userId: string, device: DeviceInfo): UserSession {
  const now = new Date();
  const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    userId,
    deviceInfo: device,
    ipAddress: '127.0.0.1',
    refreshTokenHash: `hash_${Math.random().toString(36).slice(2, 16)}`,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    lastActivity: now.toISOString(),
    revoked: false,
  };
}

// ============================================================
// PUBLIC API
// ============================================================

/** Cria nova sessão ao fazer login */
export async function createSession(userId: string): Promise<UserSession> {
  const device = getDeviceInfo();

  if (useMock()) {
    await mockDelay(100);
    const session = createMockSession(userId, device);
    _mockSessions.push(session);
    return session;
  }

  const { data } = await apiClient.post<UserSession>('/auth/sessions', {
    deviceInfo: device,
  });
  return data;
}

/** Retorna sessões ativas do usuário */
export async function getActiveSessions(): Promise<UserSession[]> {
  if (useMock()) {
    await mockDelay(150);
    const user = tokenStore.getCurrentUser();
    if (!user) return [];
    return _mockSessions.filter(s => s.userId === user.id && !s.revoked);
  }

  const { data } = await apiClient.get<UserSession[]>('/auth/sessions');
  return data;
}

/**
 * Encerra sessão específica.
 * Invalida o refresh token associado.
 */
export async function revokeSession(sessionId: string): Promise<boolean> {
  if (useMock()) {
    await mockDelay(200);
    const session = _mockSessions.find(s => s.id === sessionId);
    if (session) {
      session.revoked = true;
      session.revokedAt = new Date().toISOString();
      session.revokedReason = 'user_initiated';
    }
    return true;
  }

  await apiClient.delete(`/auth/sessions/${sessionId}`);
  return true;
}

/**
 * Encerra TODAS as sessões (logout global).
 * Invalida todos os refresh tokens.
 * Blacklista o access token atual.
 */
export async function revokeAllSessions(): Promise<boolean> {
  const user = tokenStore.getCurrentUser();
  if (!user) return false;

  if (useMock()) {
    await mockDelay(300);
    _mockSessions
      .filter(s => s.userId === user.id && !s.revoked)
      .forEach(s => {
        s.revoked = true;
        s.revokedAt = new Date().toISOString();
        s.revokedReason = 'logout_all';
      });
    await audit.logoutAll(user.id);
    return true;
  }

  await apiClient.delete('/auth/sessions');
  await audit.logoutAll(user.id);
  return true;
}

/**
 * Refresh token rotation.
 *
 * Envia refresh token (httpOnly cookie) → recebe novo par access+refresh.
 * Refresh token antigo é invalidado (rotação obrigatória).
 *
 * Em mock mode: simula renovação com novo token em memória.
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Previne múltiplas chamadas simultâneas
  const inProgress = tokenStore.waitForRefresh();
  if (inProgress) return inProgress;

  const refreshPromise = doRefresh();
  tokenStore.setRefreshInProgress(refreshPromise);

  try {
    return await refreshPromise;
  } finally {
    tokenStore.clearRefreshInProgress();
  }
}

async function doRefresh(): Promise<boolean> {
  if (useMock()) {
    await mockDelay(200);
    const user = tokenStore.getCurrentUser();
    if (!user) return false;

    // Simula novo token
    const expiresAt = new Date(Date.now() + 900_000).toISOString(); // 15 min
    tokenStore.setAuth(
      `mock_token_${Date.now()}`,
      expiresAt,
      user,
      tokenStore.getSessionId() || 'mock_session'
    );
    tokenStore.mockPersistSession();
    return true;
  }

  try {
    // Backend lê httpOnly cookie, valida, rotaciona, e retorna novo access token
    const { data } = await apiClient.post<{
      accessToken: string;
      accessTokenExpiresAt: string;
      user: import('@/lib/api/contracts').AuthenticatedUser;
      sessionId: string;
    }>('/auth/refresh', undefined, {
      credentials: 'include', // Envia httpOnly cookie
    });

    tokenStore.setAuth(
      data.accessToken,
      data.accessTokenExpiresAt,
      data.user,
      data.sessionId
    );
    return true;
  } catch {
    // Refresh falhou → sessão expirada
    tokenStore.clearAuth();
    return false;
  }
}

/**
 * Verifica se o login é de um dispositivo/IP desconhecido.
 * Compara fingerprint com sessões anteriores.
 */
export function isNewDevice(sessions: UserSession[]): boolean {
  const currentDevice = getDeviceInfo();
  return !sessions.some(s =>
    !s.revoked && isSameDevice(s.deviceInfo.fingerprint, currentDevice.fingerprint)
  );
}

/** Retorna sessões mock (apenas para debugging) */
export function getMockSessions(): readonly UserSession[] {
  return Object.freeze([..._mockSessions]);
}
