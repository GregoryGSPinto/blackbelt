import { getOptionalEnv, getRequiredEnv } from '@/lib/env';

export const env = {
  SUPABASE_URL: getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getOptionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: getOptionalEnv('SUPABASE_SERVICE_ROLE_KEY'),
  STRIPE_PUBLIC_KEY: getOptionalEnv('NEXT_PUBLIC_STRIPE_PUBLIC_KEY'),
  STRIPE_SECRET_KEY: getOptionalEnv('STRIPE_SECRET_KEY'),
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
