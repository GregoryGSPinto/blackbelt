import { NextResponse } from 'next/server';
import { getOptionalEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';
const DEFAULT_SUPPORT_EMAIL = 'suporte@blackbelt.app';

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

  return [...new Set(
    value
      .split(',')
      .map(entry => normalizeHostUrl(entry.trim()))
      .filter((entry): entry is string => Boolean(entry)),
  )];
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const capacitorServerUrl = normalizeHostUrl(getOptionalEnv('CAPACITOR_SERVER_URL'));
  const publicAppUrl = normalizeHostUrl(getOptionalEnv('NEXT_PUBLIC_APP_URL'));
  const primaryHost = capacitorServerUrl || publicAppUrl || requestUrl.origin;
  const primaryHostSource = capacitorServerUrl
    ? 'capacitor_server_url'
    : publicAppUrl
      ? 'next_public_app_url'
      : 'request_origin';

  const fallbackHosts = parseFallbackUrls(getOptionalEnv('CAPACITOR_FALLBACK_URLS'))
    .filter(host => host !== primaryHost);
  const hasDatabase = Boolean(process.env.DATABASE_URL);
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const configuredSupportEmail = getOptionalEnv('SUPPORT_EMAIL')?.trim() || '';
  const configuredPrivacyEmail = getOptionalEnv('PRIVACY_EMAIL')?.trim() || '';
  const supportEmail = configuredSupportEmail || DEFAULT_SUPPORT_EMAIL;
  const privacyEmail = configuredPrivacyEmail || supportEmail;
  const warnings: string[] = [];

  if (!configuredSupportEmail) {
    warnings.push('SUPPORT_EMAIL is not explicitly configured; runtime is using the default support contact.');
  }

  if (!configuredPrivacyEmail) {
    warnings.push(configuredSupportEmail
      ? 'PRIVACY_EMAIL is not explicitly configured; runtime is currently reusing SUPPORT_EMAIL.'
      : 'PRIVACY_EMAIL is not explicitly configured and currently falls back to SUPPORT_EMAIL.');
  } else if (configuredPrivacyEmail === configuredSupportEmail) {
    warnings.push('PRIVACY_EMAIL matches SUPPORT_EMAIL; a dedicated privacy inbox is recommended before broader rollout.');
  }

  if (!fallbackHosts.length) {
    warnings.push('CAPACITOR_FALLBACK_URLS is empty; mobile release is operating in single-host mode.');
  }

  if (primaryHostSource === 'request_origin') {
    warnings.push('Primary mobile runtime host is falling back to request origin; configure NEXT_PUBLIC_APP_URL or CAPACITOR_SERVER_URL before external distribution.');
  }

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
      supportPath: '/suporte',
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
    runtimeConfig: {
      primaryHostSource,
      releaseMode: fallbackHosts.length ? 'multi-host' : 'single-host',
      supportEmailConfigured: Boolean(configuredSupportEmail),
      privacyEmailConfigured: Boolean(configuredPrivacyEmail),
      fallbackHostCount: fallbackHosts.length,
    },
    contacts: {
      supportEmail,
      privacyEmail,
    },
    operational: {
      status: warnings.length ? 'attention_required' : 'ready_for_controlled_distribution',
      warnings,
    },
    timestamp: new Date().toISOString(),
  });

  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
