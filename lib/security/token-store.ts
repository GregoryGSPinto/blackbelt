/**
 * Token Store — Armazenamento seguro de tokens
 *
 * PRINCÍPIO ZERO TRUST: NUNCA armazenar tokens em localStorage.
 *
 * ESTRATÉGIA:
 * - Access Token: armazenado APENAS em memória (variável JS)
 * - Refresh Token: gerenciado via httpOnly cookie pelo backend
 * - Em mock mode: simula o comportamento com memória volátil
 *
 * CONSEQUÊNCIA: ao fechar/recarregar a aba, access token é perdido.
 * O refresh token (httpOnly cookie) permite obter novo access token
 * via endpoint /auth/refresh silenciosamente.
 *
 * Isso é INTENCIONAL — padrão de segurança de bancos digitais.
 */

import type { AuthenticatedUser, SecurityConfig } from '@/lib/api/contracts';

// ============================================================
// IN-MEMORY TOKEN STORAGE (nunca persiste no disco)
// ============================================================

let _accessToken: string | null = null;
let _accessTokenExpiresAt: number | null = null;
let _currentUser: AuthenticatedUser | null = null;
let _sessionId: string | null = null;
let _refreshInProgress: Promise<boolean> | null = null;

/** Configuração padrão (sobrescrita pelo backend em produção) */
const DEFAULT_CONFIG: SecurityConfig = {
  accessTokenTTL: 900,          // 15 minutos
  refreshTokenTTL: 604800,      // 7 dias
  maxLoginAttempts: 5,
  lockoutDuration: 900,          // 15 minutos
  requireReauthForCritical: true,
  maxConcurrentSessions: 5,
};

let _config: SecurityConfig = { ...DEFAULT_CONFIG };

// ============================================================
// PUBLIC API
// ============================================================

/** Armazena resultado de autenticação em memória */
export function setAuth(
  accessToken: string,
  expiresAt: string,
  user: AuthenticatedUser,
  sessionId: string
): void {
  _accessToken = accessToken;
  _accessTokenExpiresAt = new Date(expiresAt).getTime();
  _currentUser = { ...user };
  _sessionId = sessionId;
}

/** Limpa todos os dados de autenticação da memória */
export function clearAuth(): void {
  _accessToken = null;
  _accessTokenExpiresAt = null;
  _currentUser = null;
  _sessionId = null;
  _refreshInProgress = null;
}

/** Retorna access token se válido, null se expirado ou ausente */
export function getAccessToken(): string | null {
  if (!_accessToken || !_accessTokenExpiresAt) return null;
  // Margem de 30s para evitar usar token prestes a expirar
  if (Date.now() > _accessTokenExpiresAt - 30_000) return null;
  return _accessToken;
}

/** Verifica se há sessão ativa (token em memória) */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/** Retorna dados do usuário autenticado */
export function getCurrentUser(): AuthenticatedUser | null {
  if (!isAuthenticated()) return null;
  return _currentUser ? { ..._currentUser } : null;
}

/** Retorna ID da sessão atual */
export function getSessionId(): string | null {
  return _sessionId;
}

/** Retorna configuração de segurança */
export function getSecurityConfig(): SecurityConfig {
  return { ..._config };
}

/** Atualiza configuração de segurança (carregada do backend) */
export function setSecurityConfig(config: Partial<SecurityConfig>): void {
  _config = { ..._config, ...config };
}

/**
 * Marca que um refresh está em andamento.
 * Previne múltiplas requisições simultâneas de refresh.
 */
export function setRefreshInProgress(promise: Promise<boolean>): void {
  _refreshInProgress = promise;
}

/** Aguarda refresh em andamento (se houver) */
export async function waitForRefresh(): Promise<boolean> {
  if (_refreshInProgress) {
    return _refreshInProgress;
  }
  return false;
}

/** Limpa flag de refresh em andamento */
export function clearRefreshInProgress(): void {
  _refreshInProgress = null;
}

// ============================================================
// MOCK PERSISTENCE (apenas para desenvolvimento)
// ============================================================

const MOCK_SESSION_KEY = '__blackbelt_dev_session__';

/**
 * Em modo mock, persiste sessão minimamente para não perder
 * login ao hot-reload do Next.js dev server.
 * Em produção, NUNCA é chamado.
 */
export function mockPersistSession(): void {
  if (!_currentUser || !_accessToken) return;
  try {
    const data = JSON.stringify({
      accessToken: _accessToken,
      expiresAt: _accessTokenExpiresAt,
      user: _currentUser,
      sessionId: _sessionId,
    });
    sessionStorage.setItem(MOCK_SESSION_KEY, data);
  } catch {
    // sessionStorage pode não estar disponível
  }
}

/** Restaura sessão mock (apenas dev) */
export function mockRestoreSession(): boolean {
  try {
    const raw = sessionStorage.getItem(MOCK_SESSION_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data.accessToken || !data.user) return false;
    _accessToken = data.accessToken;
    _accessTokenExpiresAt = data.expiresAt;
    _currentUser = data.user;
    _sessionId = data.sessionId;
    return true;
  } catch {
    return false;
  }
}

/** Limpa sessão mock */
export function mockClearSession(): void {
  try {
    sessionStorage.removeItem(MOCK_SESSION_KEY);
  } catch {
    // ignore
  }
}
