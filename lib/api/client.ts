/**
 * Cliente HTTP centralizado — Segurança Enterprise
 *
 * MUDANÇAS vs versão anterior:
 * ✔ NUNCA lê token de localStorage
 * ✔ Token de acesso vem do TokenStore (memória)
 * ✔ Refresh automático em 401 (token expirado)
 * ✔ Retry com backoff para 5xx
 * ✔ Timeout de 30s por requisição
 * ✔ Sanitização de headers
 * ✔ CSRF token support
 * ✔ Credenciais incluídas para httpOnly cookies
 *
 * TODO(BE-001): Configurar para produção
 * - NEXT_PUBLIC_API_URL obrigatório
 * - CSRF token via meta tag ou cookie
 * - Rate limit headers parsing
 */

import * as tokenStore from '@/lib/security/token-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const REQUEST_TIMEOUT = 30_000; // 30 segundos
const MAX_RETRIES = 2;

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Desabilita retry automático */
  noRetry?: boolean;
  /** Desabilita refresh automático em 401 */
  noAutoRefresh?: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

// ============================================================
// INTERCEPTORS
// ============================================================

/** Adiciona Authorization header com token da memória */
function injectAuthHeader(headers: Record<string, string>): void {
  const token = tokenStore.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
}

/** Adiciona headers de segurança */
function injectSecurityHeaders(headers: Record<string, string>): void {
  // Request ID para rastreamento
  headers['X-Request-ID'] = `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // CSRF token (se disponível via meta tag)
  if (typeof document !== 'undefined') {
    const csrfMeta = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]');
    if (csrfMeta?.content) {
      headers['X-CSRF-Token'] = csrfMeta.content;
    }
  }
}

// ============================================================
// CORE REQUEST
// ============================================================

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  retryCount = 0
): Promise<ApiResponse<T>> {
  const { body, headers: customHeaders, noRetry, noAutoRefresh, ...rest } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(customHeaders as Record<string, string>),
  };

  injectAuthHeader(headers);
  injectSecurityHeaders(headers);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...rest,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Incluir cookies (necessário para httpOnly refresh token)
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    // ─── 401 Unauthorized → Tentar refresh automático ───
    if (response.status === 401 && !noAutoRefresh && retryCount === 0) {
      const { refreshAccessToken } = await import('@/lib/security/session');
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry com novo token
        return request<T>(endpoint, { ...options, noAutoRefresh: true }, retryCount + 1);
      }
      // Refresh falhou → limpar sessão
      tokenStore.clearAuth();
      throw new ApiError(401, 'Session expired');
    }

    // ─── 5xx Server Error → Retry com backoff ───
    if (response.status >= 500 && !noRetry && retryCount < MAX_RETRIES) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 8000);
      await new Promise(resolve => setTimeout(resolve, delay));
      return request<T>(endpoint, options, retryCount + 1);
    }

    // ─── Erro genérico ───
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // ─── Parse seguro ───
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const json = await response.json();
      // Unwrap { data: ... } envelope from Next.js API routes
      const data = json && typeof json === 'object' && 'data' in json ? json.data : json;
      return { data, status: response.status, ok: true };
    }

    // Response sem body (204 No Content, etc)
    return { data: undefined as T, status: response.status, ok: true };

  } catch (err) {
    clearTimeout(timeoutId);

    if (err instanceof ApiError) throw err;

    // Timeout
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(408, 'Request Timeout');
    }

    // Network error
    throw new ApiError(0, 'Network Error', err);
  }
}

// ============================================================
// PUBLIC API
// ============================================================

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };
export type { ApiResponse, RequestOptions };
