import { beforeEach, describe, expect, it, vi } from 'vitest';

const withAuthMock = vi.fn();
const getSupabaseServerClientMock = vi.fn();

vi.mock('@/lib/api/route-helpers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');
  return {
    ...actual,
    withAuth: withAuthMock,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  getSupabaseServerClient: getSupabaseServerClientMock,
}));

describe('API security guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 403 when authenticated user has no active membership', async () => {
    const { withAuth } = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');

    getSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1', email: 'user@test.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        }),
      }),
    });

    await expect(withAuth()).rejects.toMatchObject({ status: 403 });
  });

  it('returns 409 when multiple active memberships exist without explicit academy selection', async () => {
    const { withAuth } = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');

    getSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-tenant', email: 'tenant@test.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { id: 'mem-1', academy_id: 'academy-1', profile_id: 'user-tenant', role: 'admin' },
                  { id: 'mem-2', academy_id: 'academy-2', profile_id: 'user-tenant', role: 'owner' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    await expect(withAuth(new Request('http://localhost/api/subscription'))).rejects.toMatchObject({ status: 409 });
  });

  it('honors x-academy-id when selecting the active membership context', async () => {
    const { withAuth } = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');

    getSupabaseServerClientMock.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-tenant', email: 'tenant@test.com' } },
          error: null,
        }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { id: 'mem-1', academy_id: 'academy-1', profile_id: 'user-tenant', role: 'admin' },
                  { id: 'mem-2', academy_id: 'academy-2', profile_id: 'user-tenant', role: 'owner' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      }),
    });

    const context = await withAuth(new Request('http://localhost/api/subscription', {
      headers: { 'x-academy-id': 'academy-2' },
    }));

    expect(context.membership).toMatchObject({ id: 'mem-2', academy_id: 'academy-2', role: 'owner' });
  });

  it('blocks professor access on admin members route', async () => {
    const { GET } = await import('@/app/api/members/route');

    withAuthMock.mockResolvedValue({
      supabase: {},
      user: { id: 'user-1', email: 'prof@test.com' },
      membership: { id: 'mem-1', academy_id: 'academy-1', role: 'professor' },
    });

    const response = await GET(new Request('http://localhost/api/members') as any);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Sem permissão para listar membros');
  });

  it('blocks student manual check-in attempts', async () => {
    const { POST } = await import('@/app/api/checkin/register/route');

    withAuthMock.mockResolvedValue({
      supabase: {},
      user: { id: 'user-2', email: 'student@test.com' },
      membership: { id: 'mem-2', academy_id: 'academy-1', role: 'student' },
    });

    const response = await POST(new Request('http://localhost/api/checkin/register', {
      method: 'POST',
      body: JSON.stringify({ alunoId: 'student-1', turmaId: 'class-1' }),
    }) as any);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Sem permissão para registrar check-in');
  });

  it('rejects forged QR payloads even for privileged users', async () => {
    const { POST } = await import('@/app/api/checkin/validate-qr/route');

    withAuthMock.mockResolvedValue({
      supabase: {},
      user: { id: 'user-3', email: 'admin@test.com' },
      membership: { id: 'mem-3', academy_id: 'academy-1', role: 'admin' },
    });

    const response = await POST(new Request('http://localhost/api/checkin/validate-qr', {
      method: 'POST',
      body: JSON.stringify({
        alunoId: 'student-1',
        timestamp: Date.now(),
        hash: 'forged-hash',
      }),
    }) as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.success).toBe(false);
    expect(body.data.error).toContain('QR code inválido');
  });
});
