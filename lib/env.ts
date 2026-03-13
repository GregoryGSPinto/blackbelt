export function sanitizeEnvValue(value?: string | null): string | undefined {
  if (typeof value !== 'string') return undefined;

  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[\r\n]+/g, '')
    .trim();

  return normalized || undefined;
}

export function getOptionalEnv(name: string): string | undefined {
  return sanitizeEnvValue(process.env[name]);
}

export function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name);
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return value;
}

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
  if (getOptionalEnv('NEXT_PUBLIC_USE_MOCK') === 'false') {
    return false;
  }

  // Explicit true → always mock
  if (getOptionalEnv('NEXT_PUBLIC_USE_MOCK') === 'true') {
    return true;
  }

  // Not set → production defaults to false
  return false;
}

/**
 * Alias compatível com o padrão isMock() usado em alguns services.
 * Encapsula useMock() para manter a API estável.
 */
export function isMock(): boolean {
  return useMock();
}

/** Simula latência de rede em ambiente mock */
export const mockDelay = (ms = 200) => new Promise(resolve => setTimeout(resolve, ms));
