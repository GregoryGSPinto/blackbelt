import { beforeEach, describe, expect, it, vi } from 'vitest';

const withAuthMock = vi.fn();
const getSupabaseAdminClientMock = vi.fn();
const buildDevelopmentSnapshotMock = vi.fn();
const extractEngagementInputMock = vi.fn();
const computeEngagementScoreMock = vi.fn();

vi.mock('@/lib/api/route-helpers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');
  return {
    ...actual,
    withAuth: withAuthMock,
  };
});

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: getSupabaseAdminClientMock,
}));

vi.mock('@/lib/application/progression/state/build-snapshot', () => ({
  buildDevelopmentSnapshot: buildDevelopmentSnapshotMock,
}));

vi.mock('@/lib/acl/mappers/engagement-mapper', () => ({
  extractEngagementInput: extractEngagementInputMock,
}));

vi.mock('@/lib/domain/intelligence/engines/engagement-scorer', () => ({
  computeEngagementScore: computeEngagementScoreMock,
}));

function createAcademiesAdminClient(options?: {
  academyId?: string;
  academyError?: { message: string } | null;
  profileError?: { message: string } | null;
  membershipError?: { message: string } | null;
}) {
  const calls = {
    academiesInsert: null as Record<string, unknown> | null,
    profileUpsert: null as Record<string, unknown> | null,
    membershipUpsert: null as Record<string, unknown> | null,
    academyDeleteId: null as string | null,
  };

  const academyRow = {
    id: options?.academyId ?? 'academy-1',
    name: 'Academia Teste',
    slug: 'academia-teste',
  };

  const admin = {
    from(table: string) {
      if (table === 'academies') {
        return {
          insert(payload: Record<string, unknown>) {
            calls.academiesInsert = payload;
            return {
              select() {
                return {
                  async single() {
                    return {
                      data: options?.academyError ? null : academyRow,
                      error: options?.academyError ?? null,
                    };
                  },
                };
              },
            };
          },
          delete() {
            return {
              eq(_field: string, value: string) {
                calls.academyDeleteId = value;
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      }

      if (table === 'profiles') {
        return {
          async upsert(payload: Record<string, unknown>) {
            calls.profileUpsert = payload;
            return { error: options?.profileError ?? null };
          },
        };
      }

      if (table === 'memberships') {
        return {
          async upsert(payload: Record<string, unknown>) {
            calls.membershipUpsert = payload;
            return { error: options?.membershipError ?? null };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
  };

  return { admin, calls };
}

describe('release-critical route coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bootstraps owner membership and profile when creating an academy', async () => {
    const { admin, calls } = createAcademiesAdminClient();
    getSupabaseAdminClientMock.mockReturnValue(admin);
    withAuthMock.mockResolvedValue({
      user: { id: 'user-1', email: 'owner@academy.test' },
      membership: null,
    });

    const { POST } = await import('@/app/api/academies/route');
    const response = await POST(new Request('http://localhost/api/academies', {
      method: 'POST',
      body: JSON.stringify({ name: 'Academia Teste', phone: '11999999999' }),
    }) as any);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(calls.academiesInsert).toMatchObject({
      name: 'Academia Teste',
      owner_id: 'user-1',
      phone: '11999999999',
    });
    expect(calls.profileUpsert).toMatchObject({
      id: 'user-1',
      full_name: 'owner',
      phone: '11999999999',
    });
    expect(calls.membershipUpsert).toMatchObject({
      profile_id: 'user-1',
      academy_id: 'academy-1',
      role: 'owner',
      status: 'active',
    });
    expect(body.data.id).toBe('academy-1');
  });

  it('rolls back academy creation if owner membership bootstrap fails', async () => {
    const { admin, calls } = createAcademiesAdminClient({
      membershipError: { message: 'membership bootstrap failed' },
    });
    getSupabaseAdminClientMock.mockReturnValue(admin);
    withAuthMock.mockResolvedValue({
      user: { id: 'user-2', email: 'owner2@academy.test' },
      membership: null,
    });

    const { POST } = await import('@/app/api/academies/route');
    const response = await POST(new Request('http://localhost/api/academies', {
      method: 'POST',
      body: JSON.stringify({ name: 'Rollback Academy' }),
    }) as any);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(calls.academyDeleteId).toBe('academy-1');
    expect(body.error).toBe('Internal Server Error');
  });

  it('blocks professors from accessing attendance for another instructor class', async () => {
    const supabase = {
      from(table: string) {
        if (table === 'class_schedules') {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async maybeSingle() {
                          return {
                            data: {
                              id: 'turma-1',
                              academy_id: 'academy-1',
                              instructor_id: 'other-professor',
                              active: true,
                            },
                            error: null,
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        }
        throw new Error(`Unexpected table ${table}`);
      },
    };

    withAuthMock.mockResolvedValue({
      supabase,
      user: { id: 'user-prof', email: 'prof@test.com' },
      membership: { id: 'prof-1', academy_id: 'academy-1', profile_id: 'user-prof', role: 'professor' },
    });

    const { GET } = await import('@/app/api/professor/chamada/[turmaId]/route');
    const response = await GET(
      new Request('http://localhost/api/professor/chamada/turma-1') as any,
      { params: Promise.resolve({ turmaId: 'turma-1' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('Sem permissão para acessar esta turma');
  });

  it('returns only active students from the current academy in professor attendance', async () => {
    const supabase = {
      from(table: string) {
        if (table === 'class_schedules') {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async maybeSingle() {
                          return {
                            data: {
                              id: 'turma-2',
                              academy_id: 'academy-1',
                              instructor_id: 'prof-1',
                              active: true,
                            },
                            error: null,
                          };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        }

        if (table === 'class_enrollments') {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return Promise.resolve({
                        data: [
                          {
                            membership: {
                              id: 'student-1',
                              academy_id: 'academy-1',
                              role: 'student',
                              status: 'active',
                              belt_rank: 'azul',
                              profiles: { full_name: 'Aluno Correto' },
                            },
                          },
                          {
                            membership: {
                              id: 'student-2',
                              academy_id: 'academy-2',
                              role: 'student',
                              status: 'active',
                              belt_rank: 'branca',
                              profiles: { full_name: 'Outro Tenant' },
                            },
                          },
                          {
                            membership: {
                              id: 'prof-aux',
                              academy_id: 'academy-1',
                              role: 'professor',
                              status: 'active',
                              belt_rank: 'preta',
                              profiles: { full_name: 'Professor Auxiliar' },
                            },
                          },
                          {
                            membership: {
                              id: 'student-3',
                              academy_id: 'academy-1',
                              role: 'student',
                              status: 'inactive',
                              belt_rank: 'roxa',
                              profiles: { full_name: 'Aluno Inativo' },
                            },
                          },
                        ],
                        error: null,
                      });
                    },
                  };
                },
              };
            },
          };
        }

        throw new Error(`Unexpected table ${table}`);
      },
    };

    withAuthMock.mockResolvedValue({
      supabase,
      user: { id: 'user-prof', email: 'prof@test.com' },
      membership: { id: 'prof-1', academy_id: 'academy-1', profile_id: 'user-prof', role: 'professor' },
    });

    const { GET } = await import('@/app/api/professor/chamada/[turmaId]/route');
    const response = await GET(
      new Request('http://localhost/api/professor/chamada/turma-2') as any,
      { params: Promise.resolve({ turmaId: 'turma-2' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([
      {
        id: 'student-1',
        nome: 'Aluno Correto',
        avatar: '🥋',
        nivel: 'azul',
        nivelCor: '#FFFFFF',
      },
    ]);
  });

  it('prevents a student from viewing another student engagement payload', async () => {
    withAuthMock.mockResolvedValue({
      supabase: {},
      user: { id: 'user-student', email: 'student@test.com' },
      membership: { id: 'student-1', academy_id: 'academy-1', profile_id: 'user-student', role: 'student' },
    });

    const { GET } = await import('@/app/api/ai/engagement/[memberId]/route');
    const response = await GET(
      new Request('http://localhost/api/ai/engagement/student-2') as any,
      { params: Promise.resolve({ memberId: 'student-2' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toContain('Acesso restrito');
  });

  it('returns 404 when a privileged user requests engagement for a member from another academy', async () => {
    const supabase = {
      from(table: string) {
        if (table === 'memberships') {
          return {
            select() {
              return {
                eq() {
                  return {
                    eq() {
                      return {
                        async single() {
                          return { data: null, error: null };
                        },
                      };
                    },
                  };
                },
              };
            },
          };
        }
        throw new Error(`Unexpected table ${table}`);
      },
    };

    withAuthMock.mockResolvedValue({
      supabase,
      user: { id: 'user-admin', email: 'admin@test.com' },
      membership: { id: 'admin-1', academy_id: 'academy-1', profile_id: 'user-admin', role: 'admin' },
    });
    buildDevelopmentSnapshotMock.mockResolvedValue({});
    extractEngagementInputMock.mockResolvedValue({});
    computeEngagementScoreMock.mockReturnValue({ score: 88 });

    const { GET } = await import('@/app/api/ai/engagement/[memberId]/route');
    const response = await GET(
      new Request('http://localhost/api/ai/engagement/member-foreign') as any,
      { params: Promise.resolve({ memberId: 'member-foreign' }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.error).toBe('Membro não encontrado nesta academia');
    expect(buildDevelopmentSnapshotMock).not.toHaveBeenCalled();
  });
});
