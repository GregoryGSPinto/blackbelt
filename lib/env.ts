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
  if (typeof process === 'undefined') return false;

  // Explicit false → never mock (production or dev with backend)
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'false') {
    return false;
  }

  // Explicit true → always mock
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return true;
  }

  // Not set → production defaults to false
  return false;
}

/** Simula latência de rede em ambiente mock */
export const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));
