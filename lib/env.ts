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

export function useMock(): boolean {
  return getOptionalEnv('NEXT_PUBLIC_USE_MOCK') === 'true';
}

export function isMock(): boolean {
  return useMock();
}

export async function mockDelay(ms = 200): Promise<void> {
  if (process.env.NODE_ENV === 'test') return;
  await new Promise(resolve => setTimeout(resolve, ms));
}
