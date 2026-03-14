import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSupabaseServerClientMock = vi.fn();
const getSupabaseServerClientSafeMock = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: getSupabaseServerClientMock,
  getSupabaseServerClientSafe: getSupabaseServerClientSafeMock,
}));

function createSupabaseForMeRoute() {
  const profileQuery = {
    eq: vi.fn().mockReturnValue({
      maybeSingle: vi.fn().mockResolvedValue({
        data: { full_name: 'Gregory Pinto' },
        error: null,
      }),
    }),
  };

  const membershipsQuery = {
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            { id: 'mem-1', academy_id: 'academy-1', role: 'admin', status: 'active' },
            { id: 'mem-2', academy_id: 'academy-2', role: 'owner', status: 'active' },
          ],
          error: null,
        }),
      }),
    }),
  };

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'owner@blackbelt.app' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'memberships') {
        return {
          select: vi.fn().mockReturnValue(membershipsQuery),
        };
      }

      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue(profileQuery),
        };
      }

      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

describe('real runtime flow hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    process.env.NEXT_PUBLIC_USE_MOCK = 'false';
  });

  it('returns 409 from /api/me when multiple active tenant memberships exist without explicit selection', async () => {
    getSupabaseServerClientMock.mockResolvedValue(createSupabaseForMeRoute());

    const { GET } = await import('@/app/api/me/route');
    const response = await GET(new Request('http://localhost/api/me'));
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toContain('Múltiplas memberships ativas');
  });

  it('uses x-academy-id in /api/me to resolve the correct tenant context', async () => {
    getSupabaseServerClientMock.mockResolvedValue(createSupabaseForMeRoute());

    const { GET } = await import('@/app/api/me/route');
    const response = await GET(new Request('http://localhost/api/me', {
      headers: { 'x-academy-id': 'academy-2' },
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      memberId: 'mem-2',
      perfil: 'ADMINISTRADOR',
      academiaId: 'academy-2',
    });
  });

  it('does not silently fall back to mock data when NEXT_PUBLIC_USE_MOCK=false', async () => {
    vi.doMock('@/lib/env', async () => {
      const actual = await vi.importActual<typeof import('@/lib/env')>('@/lib/env');
      return {
        ...actual,
        useMock: () => false,
        isMock: () => false,
        mockDelay: async () => {},
      };
    });

    const fetchMock = vi.fn().mockRejectedValue(new Error('network down'));
    vi.stubGlobal('fetch', fetchMock);

    const { safeGet } = await import('@/lib/api/safe-client');
    const result = await safeGet('/admin/usuarios', {
      fallback: [],
      useMockFallback: true,
      mockPath: '@/lib/__mocks__/admin.mock',
      mockExtractor: (mock) => mock.usuarios || [],
      silent: true,
    });

    expect(result).toEqual([]);
  });
});
