import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getOptionalEnvMock = vi.fn();

vi.mock('@/lib/env', () => ({
  getOptionalEnv: getOptionalEnvMock,
}));

describe('mobile runtime route', () => {
  const originalDatabaseUrl = process.env.DATABASE_URL;
  const originalSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.DATABASE_URL = 'postgres://postgres:postgres@localhost:5432/blackbelt';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';
  });

  afterEach(() => {
    if (originalDatabaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = originalDatabaseUrl;

    if (originalSupabaseUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalSupabaseUrl;

    if (originalSupabaseAnonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = originalSupabaseAnonKey;
  });

  it('reports a controlled-ready runtime when explicit operational envs are configured', async () => {
    getOptionalEnvMock.mockImplementation((name: string) => ({
      NEXT_PUBLIC_APP_URL: 'https://blackbelt.app',
      CAPACITOR_FALLBACK_URLS: 'https://m.blackbelt.app, https://backup.blackbelt.app',
      SUPPORT_EMAIL: 'suporte@blackbelt.app',
      PRIVACY_EMAIL: 'privacidade@blackbelt.app',
    }[name]));

    const { GET } = await import('@/app/api/mobile/runtime/route');
    const response = await GET(new Request('https://blackbelt.app/api/mobile/runtime'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shell.primaryHost).toBe('https://blackbelt.app');
    expect(body.shell.fallbackHosts).toEqual([
      'https://m.blackbelt.app',
      'https://backup.blackbelt.app',
    ]);
    expect(body.runtimeConfig).toMatchObject({
      primaryHostSource: 'next_public_app_url',
      releaseMode: 'multi-host',
      supportEmailConfigured: true,
      privacyEmailConfigured: true,
      fallbackHostCount: 2,
    });
    expect(body.contacts).toMatchObject({
      supportEmail: 'suporte@blackbelt.app',
      privacyEmail: 'privacidade@blackbelt.app',
    });
    expect(body.operational).toMatchObject({
      status: 'ready_for_controlled_distribution',
      warnings: [],
    });
    expect(response.headers.get('Cache-Control')).toBe('no-store, max-age=0');
  });

  it('surfaces operational warnings when runtime still relies on defaults and single-host mode', async () => {
    getOptionalEnvMock.mockImplementation(() => undefined);

    const { GET } = await import('@/app/api/mobile/runtime/route');
    const response = await GET(new Request('https://runtime.blackbelt.app/api/mobile/runtime'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.shell.primaryHost).toBe('https://runtime.blackbelt.app');
    expect(body.shell.fallbackHosts).toEqual([]);
    expect(body.runtimeConfig).toMatchObject({
      primaryHostSource: 'request_origin',
      releaseMode: 'single-host',
      supportEmailConfigured: false,
      privacyEmailConfigured: false,
      fallbackHostCount: 0,
    });
    expect(body.contacts).toMatchObject({
      supportEmail: 'suporte@blackbelt.app',
      privacyEmail: 'suporte@blackbelt.app',
    });
    expect(body.operational.status).toBe('attention_required');
    expect(body.operational.warnings).toEqual(expect.arrayContaining([
      'SUPPORT_EMAIL is not explicitly configured; runtime is using the default support contact.',
      'PRIVACY_EMAIL is not explicitly configured and currently falls back to SUPPORT_EMAIL.',
      'CAPACITOR_FALLBACK_URLS is empty; mobile release is operating in single-host mode.',
      'Primary mobile runtime host is falling back to request origin; configure NEXT_PUBLIC_APP_URL or CAPACITOR_SERVER_URL before external distribution.',
    ]));
  });
});
