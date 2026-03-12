import { getRequiredEnv } from '@/lib/env';

function readOptionalEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;

  const normalized = value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/[\r\n]+/g, '')
    .trim();

  return normalized || undefined;
}

export const env = {
  SUPABASE_URL: readOptionalEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: readOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: readOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  STRIPE_PUBLIC_KEY:
    readOptionalEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') ||
    readOptionalEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY'),
  STRIPE_SECRET_KEY: readOptionalEnv('STRIPE_SECRET_KEY'),
} as const;

export function getMissingEnvVariables(): string[] {
  const missing: string[] = [];

  if (!env.SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.SUPABASE_ANON_KEY) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  return missing;
}

export function hasRequiredSupabaseEnv(): boolean {
  return getMissingEnvVariables().length === 0;
}

export function validateEnv(): void {
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL');
  getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
