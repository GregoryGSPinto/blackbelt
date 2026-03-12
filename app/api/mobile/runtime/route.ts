import { NextResponse } from 'next/server';
import { getOptionalEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

function normalizeHostUrl(value?: string): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function parseFallbackUrls(value?: string): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map(entry => normalizeHostUrl(entry.trim()))
    .filter((entry): entry is string => Boolean(entry));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const primaryHost =
    normalizeHostUrl(getOptionalEnv('CAPACITOR_SERVER_URL')) ||
    normalizeHostUrl(getOptionalEnv('NEXT_PUBLIC_APP_URL')) ||
    requestUrl.origin;

  const fallbackHosts = parseFallbackUrls(getOptionalEnv('CAPACITOR_FALLBACK_URLS'));
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supportEmail = getOptionalEnv('SUPPORT_EMAIL') || 'suporte@blackbelt.app';
  const privacyEmail = getOptionalEnv('PRIVACY_EMAIL') || supportEmail;

  const response = NextResponse.json({
    status: hasSupabase ? 'ok' : 'degraded',
    strategy: 'remote-hosted-capacitor-shell',
    shell: {
      primaryHost,
      fallbackHosts,
      requiresHttps: true,
      bootTimeoutMs: 7000,
      retryLimit: 2,
    },
    bootstrap: {
      healthPath: '/api/health',
      sessionPath: '/api/auth/session',
      reviewAccessPath: '/review-access',
      accountDeletionPath: '/excluir-conta',
      privacyPolicyPath: '/politica-privacidade',
      termsPath: '/termos-de-uso',
      supportPath: '/review-access',
    },
    auth: {
      sessionTransport: 'cookie',
      sameSiteExpectation: 'lax-or-stricter',
      requiresHostedOrigin: true,
    },
    checks: {
      database: hasDatabase ? 'ok' : hasSupabase ? 'degraded' : 'error',
      supabasePublicEnv: hasSupabase ? 'ok' : 'error',
    },
    contacts: {
      supportEmail,
      privacyEmail,
    },
    timestamp: new Date().toISOString(),
  });

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
