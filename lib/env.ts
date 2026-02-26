/**
 * Environment helpers — BLACKBELT
 *
 * NEXT_PUBLIC_USE_MOCK controla a fonte de dados:
 *   "true"  → Serviços retornam dados mock (desenvolvimento sem backend)
 *   "false" → Serviços chamam API real via apiClient
 *
 * Em produção, NEXT_PUBLIC_USE_MOCK nunca deve ser "true".
 *
 * Uso nos .env:
 *   NEXT_PUBLIC_USE_MOCK=true     # dev sem backend
 *   NEXT_PUBLIC_USE_MOCK=false    # dev com backend local
 *   (não definir)                 # produção — assume false
 */

export function useMock(): boolean {
  // Explícita: variável de ambiente controla tudo
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return true;
  }

  // Fallback: dev sem API_URL = mock automático
  if (
    typeof process !== 'undefined' &&
    process.env.NODE_ENV === 'development' &&
    !process.env.NEXT_PUBLIC_API_URL
  ) {
    return true;
  }

  return false;
}

/** Simula latência de rede em ambiente mock */
export const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));
