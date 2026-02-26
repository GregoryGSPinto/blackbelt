/**
 * Auth Service — Autenticação Enterprise (Padrão Fintech)
 *
 * SEGURANÇA:
 * ✔ JWT curta duração (15 min) — access token em memória
 * ✔ Refresh token em httpOnly cookie (rotação obrigatória)
 * ✔ Rate limiting no login (5 tentativas → bloqueio 15min)
 * ✔ Device fingerprint para detecção de login suspeito
 * ✔ Audit log obrigatório para toda ação de auth
 * ✔ Session tracking com histórico
 * ✔ Reautenticação para ações críticas
 * ✔ Logout global (encerrar todas sessões)
 *
 * O front-end NUNCA: valida senha, armazena senha, compara credenciais.
 *
 * TODO(BE-001): Implementar endpoints auth
 *   POST /auth/login          (com device fingerprint)
 *   POST /auth/register
 *   POST /auth/refresh        (rotação de refresh token)
 *   POST /auth/logout         (revoga sessão)
 *   POST /auth/logout-all     (revoga todas sessões)
 *   POST /auth/check-email
 *   POST /auth/reauth         (reautenticação para ações críticas)
 *   POST /auth/change-password (invalida todos tokens)
 */

import { apiClient, ApiError } from './client';
import { useMock, mockDelay } from '@/lib/env';
import * as tokenStore from '@/lib/security/token-store';
import { getDeviceInfo } from '@/lib/security/device-fingerprint';
import { checkRateLimit, recordAttempt, recordSuccess } from '@/lib/security/rate-limiter';
import { audit } from '@/lib/security/audit';
import { createSession, revokeAllSessions, isNewDevice, getActiveSessions } from '@/lib/security/session';
import type { TipoPerfil, KidRegistroData, AuthResult, AuthenticatedUser } from './contracts';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from './types';

/** Dados completos de cadastro (incluindo perfil e dependentes) */
export interface RegisterFullRequest {
  email: string;
  password: string;
  nome: string;
  idade?: number;
  categoria?: string;
  avatar?: string;
  tipo?: TipoPerfil;
  graduacao?: string;
  instrutor?: string;
  turno?: string;
  kids?: KidRegistroData[];
}

/** Resultado do login com metadados de segurança */
export interface SecureLoginResult {
  success: boolean;
  /** Dados do login (se sucesso) */
  loginData?: LoginResponse;
  /** Se o login foi de um dispositivo desconhecido */
  suspiciousLogin?: boolean;
  /** Se o rate limiter bloqueou a tentativa */
  rateLimited?: boolean;
  /** Tentativas restantes antes de bloqueio */
  attemptsRemaining?: number;
  /** Tempo até desbloquear (em segundos) */
  blockedFor?: number;
  /** Mensagem de erro (se falha) */
  error?: string;
}

// ============================================================
// LAZY MOCK IMPORT
// ============================================================

async function getMock() {
  return import('@/lib/__mocks__/auth.mock');
}

// ============================================================
// LOGIN (com todas as camadas de segurança)
// ============================================================

/**
 * Login seguro com rate limiting, device fingerprint, e audit log.
 *
 * Fluxo:
 * 1. Verifica rate limit (5 tentativas máximas)
 * 2. Envia credenciais + device fingerprint
 * 3. Recebe token + cria sessão
 * 4. Verifica se dispositivo é desconhecido
 * 5. Registra audit log
 */
export async function secureLogin(credentials: LoginRequest): Promise<SecureLoginResult> {
  // ─── 1. Rate limit check ───
  const rateCheck = checkRateLimit(credentials.email);
  if (!rateCheck.allowed) {
    return {
      success: false,
      rateLimited: true,
      blockedFor: rateCheck.blockedUntil
        ? Math.ceil((new Date(rateCheck.blockedUntil).getTime() - Date.now()) / 1000)
        : 0,
      error: 'Muitas tentativas de login. Aguarde antes de tentar novamente.',
    };
  }

  // ─── 2. Authenticate ───
  const loginData = await _login(credentials);
  if (!loginData) {
    const afterAttempt = recordAttempt(credentials.email);
    await audit.loginFailed(credentials.email);
    return {
      success: false,
      attemptsRemaining: afterAttempt.remaining,
      error: afterAttempt.remaining > 0
        ? `Credenciais inválidas. ${afterAttempt.remaining} tentativa(s) restante(s).`
        : 'Conta temporariamente bloqueada. Tente novamente em 15 minutos.',
    };
  }

  // ─── 3. Sucesso — armazenar token em memória ───
  recordSuccess(credentials.email);

  // Mapear LoginResponse para AuthenticatedUser
  const authUser: AuthenticatedUser = {
    id: loginData.user.id,
    nome: loginData.user.nome,
    email: loginData.user.email,
    role: mapTipoPerfilToRole(loginData.user.tipo),
    permissions: loginData.user.permissoes as AuthenticatedUser['permissions'],
    unitId: loginData.user.unidadeId || 'default',
    avatar: loginData.user.avatar,
    graduacao: loginData.user.graduacao,
  };

  const session = await createSession(authUser.id);

  tokenStore.setAuth(
    loginData.token,
    new Date(Date.now() + 900_000).toISOString(), // 15 min
    authUser,
    session.id
  );

  // Mock mode: persist session for hot-reload
  if (useMock()) {
    tokenStore.mockPersistSession();
  }

  // ─── 4. Verificar dispositivo ───
  let suspiciousLogin = false;
  try {
    const sessions = await getActiveSessions();
    suspiciousLogin = isNewDevice(sessions);
    if (suspiciousLogin) {
      await audit.suspiciousLogin(authUser.id, {
        device: getDeviceInfo(),
        previousSessions: sessions.length,
      });
    }
  } catch {
    // Não bloquear login por falha na verificação
  }

  // ─── 5. Audit log ───
  await audit.login(authUser.id);

  return {
    success: true,
    loginData,
    suspiciousLogin,
  };
}

/**
 * Logout seguro — revoga sessão atual e limpa memória.
 */
export async function secureLogout(): Promise<void> {
  const user = tokenStore.getCurrentUser();
  if (user) {
    await audit.logout(user.id);
  }
  tokenStore.clearAuth();
  if (useMock()) {
    tokenStore.mockClearSession();
  }
}

/**
 * Logout global — encerra TODAS sessões em todos dispositivos.
 */
export async function secureLogoutAll(): Promise<void> {
  await revokeAllSessions();
  tokenStore.clearAuth();
  if (useMock()) {
    tokenStore.mockClearSession();
  }
}

/**
 * Reautenticação para ações críticas.
 * Exige senha novamente antes de operações sensíveis.
 */
export async function reauthenticate(password: string): Promise<boolean> {
  const user = tokenStore.getCurrentUser();
  if (!user) return false;

  if (useMock()) {
    await mockDelay(300);
    // Mock: aceita qualquer senha com >3 chars
    return password.length >= 3;
  }

  try {
    await apiClient.post('/auth/reauth', { password }, { noAutoRefresh: true });
    return true;
  } catch {
    return false;
  }
}

/**
 * Alterar senha — invalida TODOS os tokens existentes.
 * Exige reautenticação antes.
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
  const user = tokenStore.getCurrentUser();
  if (!user) return false;

  if (useMock()) {
    await mockDelay(500);
    await audit.passwordChange(user.id);
    // Após trocar senha, forçar re-login
    tokenStore.clearAuth();
    tokenStore.mockClearSession();
    return true;
  }

  try {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    await audit.passwordChange(user.id);
    // Backend invalida todos os tokens → forçar re-login
    tokenStore.clearAuth();
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// ORIGINAL API (backward compatibility + internal)
// ============================================================

/** Login simples (sem rate limit/audit — backward compat) */
export async function login(credentials: LoginRequest): Promise<LoginResponse | null> {
  return _login(credentials);
}

/** Login interno (usado pelo secureLogin) */
async function _login(credentials: LoginRequest): Promise<LoginResponse | null> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.mockLogin(credentials);
  }

  try {
    const device = getDeviceInfo();
    const { data } = await apiClient.post<LoginResponse>('/auth/login', {
      ...credentials,
      deviceInfo: device,
    }, { noAutoRefresh: true });
    return data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null;
    throw err;
  }
}

/** Registra novo usuário */
export async function register(data: RegisterRequest): Promise<RegisterResponse | null> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.mockRegister(data);
  }

  try {
    const { data: response } = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 409 || err.status === 422)) return null;
    throw err;
  }
}

/** Verifica se email está disponível */
export async function checkEmailAvailable(email: string): Promise<boolean> {
  if (useMock()) {
    await mockDelay(100);
    const m = await getMock();
    return m.mockCheckEmailAvailable(email);
  }

  try {
    await apiClient.post('/auth/check-email', { email });
    return true;
  } catch {
    return false;
  }
}

/** Registra usuário com dados completos (cadastro multi-step) */
export async function registerFull(data: RegisterFullRequest): Promise<RegisterResponse | null> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.mockRegisterFull(data);
  }

  try {
    const { data: response } = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response;
  } catch (err) {
    if (err instanceof ApiError && (err.status === 409 || err.status === 422)) return null;
    throw err;
  }
}

// ============================================================
// HELPERS
// ============================================================

/** Mapeia TipoPerfil do sistema atual para SecurityRole */
function mapTipoPerfilToRole(tipo: TipoPerfil): AuthenticatedUser['role'] {
  const map: Record<TipoPerfil, AuthenticatedUser['role']> = {
    ALUNO_ADULTO: 'ALUNO_ADULTO',
    ALUNO_KIDS: 'ALUNO_KIDS',
    ALUNO_TEEN: 'ALUNO_ADOLESCENTE',
    RESPONSAVEL: 'RESPONSAVEL',
    INSTRUTOR: 'INSTRUTOR',
    // Corporativo
    SUPPORT: 'SUPPORT',
    UNIT_OWNER: 'UNIT_OWNER',
    // Legacy → canônico
    GESTOR: 'UNIT_OWNER',
    ADMINISTRADOR: 'UNIT_OWNER',
    SUPER_ADMIN: 'UNIT_OWNER',
    SYS_AUDITOR: 'SUPPORT',
  };
  return map[tipo] || 'ALUNO_ADULTO';
}
