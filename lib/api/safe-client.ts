/**
 * Safe Client Wrapper — BLACKBELT
 *
 * Este wrapper garante que NUNCA propagamos erros para a UI.
 * Se a API falhar, retornamos dados vazios/fallback em vez de throw.
 *
 * PRINCÍPIO: Fail-safe — o app sempre funciona, mesmo com API indisponível.
 */

import { apiClient, ApiError } from './client';
import { mockDelay } from '@/lib/env';
import { useMock } from '@/lib/env';
import { logger } from '@/lib/logger';

const MOCK_MODULE_LOADERS: Record<string, () => Promise<any>> = {
  '@/lib/__mocks__/admin.mock': () => import('@/lib/__mocks__/admin.mock'),
};

export interface SafeOptions<T> {
  /** Valor fallback em caso de erro */
  fallback: T;
  /** Se true, tenta carregar mock quando API falha */
  useMockFallback?: boolean;
  /** Path do mock para import dinâmico (ex: '@/lib/__mocks__/admin.mock') */
  mockPath?: string;
  /** Função para extrair dados do mock */
  mockExtractor?: (mock: any) => T;
  /** Não logar erro (para chamadas não-críticas) */
  silent?: boolean;
}

/**
 * Chamada API segura que NUNCA throw.
 * Sempre retorna dados, mesmo em falha total.
 */
export async function safeCall<T>(
  operation: () => Promise<T>,
  options: SafeOptions<T>
): Promise<T> {
  const { fallback, useMockFallback, mockPath, mockExtractor, silent } = options;

  try {
    // Tentar operação real
    const result = await operation();
    return result;
  } catch (err) {
    // Logar erro (se não for silencioso)
    if (!silent) {
      const errorMessage = err instanceof ApiError 
        ? `[${err.status}] ${err.message}`
        : err instanceof Error ? err.message : 'Unknown error';
      
      logger.warn('[safeCall]', 'API call failed, using fallback', { 
        error: errorMessage,
        useMockFallback 
      });
    }

    // Se habilitado, tentar fallback para mock
    if (useMock() && useMockFallback && mockPath && mockExtractor) {
      const loader = MOCK_MODULE_LOADERS[mockPath];
      if (!loader) {
        logger.error('[safeCall]', 'No mock loader registered for path', mockPath);
      } else {
        try {
          await mockDelay(100);
          const mockModule = await loader();
          return mockExtractor(mockModule);
        } catch (mockErr) {
          logger.error('[safeCall]', 'Mock fallback also failed', mockErr);
        }
      }
    }

    // Retornar fallback seguro
    return fallback;
  }
}

/**
 * Wrapper para apiClient.get com fallback automático
 */
export async function safeGet<T>(
  endpoint: string,
  options: SafeOptions<T> & { params?: Record<string, string> } = { fallback: {} as T }
): Promise<T> {
  const { fallback, params, ...safeOptions } = options;
  
  // Construir URL com query params
  let url = endpoint;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value);
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  return safeCall(
    async () => {
      const { data } = await apiClient.get<T>(url);
      return data;
    },
    { fallback, ...safeOptions }
  );
}

export async function safePut<T>(
  endpoint: string,
  body: unknown,
  options: SafeOptions<T> = { fallback: {} as T }
): Promise<T> {
  const { fallback, ...safeOptions } = options;
  return safeCall(
    async () => {
      const { data } = await apiClient.put<T>(endpoint, body);
      return data;
    },
    { fallback, ...safeOptions }
  );
}

// Export types
export type { ApiResponse } from './client';

// ============================================================================
// FALLBACK HELPERS — Dados vazios seguros
// ============================================================================

/** Retorna array vazio como fallback */
export function emptyArray<T>(): T[] {
  return [];
}

/** Retorna objeto vazio como fallback */
export function emptyObject<T extends Record<string, any>>(): T {
  return {} as T;
}

/** Retorna zero como fallback */
export function zero(): number {
  return 0;
}

/** Retorna false como fallback */
export function falseValue(): boolean {
  return false;
}

/** Retorna null como fallback */
export function nullValue<T>(): T | null {
  return null;
}
