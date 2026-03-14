import { NextRequest } from 'next/server';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const loggerErrorMock = vi.fn();
const withAuthMock = vi.fn();
const getSupabaseAdminClientMock = vi.fn();

vi.mock('@/src/infrastructure/logger', () => ({
  logger: {
    error: loggerErrorMock,
  },
}));

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

describe('sensitive data hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redacts nested sensitive fields before logging or auditing', async () => {
    const { redactSensitiveData } = await import('@/lib/security/sensitive-data');

    const sanitized = redactSensitiveData({
      actor: {
        email: 'owner@blackbelt.app',
        telefone: '(11) 99999-1111',
        cpf: '123.456.789-00',
      },
      ipAddress: '177.10.20.30',
      nested: {
        authorization: 'Bearer secret-token',
      },
      safe: 'ok',
    });

    expect(sanitized).toEqual({
      actor: {
        email: 'o***r@b***t.app',
        telefone: '*******1111',
        cpf: '*******8900',
      },
      ipAddress: '177.10.*.*',
      nested: {
        authorization: '[REDACTED]',
      },
      safe: 'ok',
    });
  });

  it('returns a generic server error response instead of raw internal messages', async () => {
    const { handleServerError } = await import('@/lib/server/error-handler');

    const response = handleServerError(
      'Billing API',
      new Error('duplicate key value violates unique constraint academy_subscriptions_pkey'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe('Internal Server Error');
    expect(loggerErrorMock).toHaveBeenCalled();
    expect(JSON.stringify(loggerErrorMock.mock.calls)).not.toContain('academy_subscriptions_pkey');
  });

  it('masks public LGPD deletion request email and avoids storing free-form reason in audit metadata', async () => {
    const response401 = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    withAuthMock.mockRejectedValue(response401);

    const auditInsertMock = vi.fn().mockResolvedValue({ error: null });
    const deletionInsertMock = vi.fn().mockResolvedValue({ error: null });

    getSupabaseAdminClientMock.mockReturnValue({
      auth: {
        admin: {
          listUsers: vi.fn().mockResolvedValue({
            data: {
              users: [{ id: 'profile-1', email: 'owner@blackbelt.app' }],
            },
            error: null,
          }),
        },
      },
      from: vi.fn((table: string) => {
        if (table === 'data_deletion_requests') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
            insert: deletionInsertMock,
          };
        }

        if (table === 'audit_log') {
          return {
            insert: auditInsertMock,
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }),
    });

    const { POST } = await import('@/app/api/lgpd/delete/route');
    const response = await POST(new NextRequest('http://localhost/api/lgpd/delete', {
      method: 'POST',
      body: JSON.stringify({
        email: 'owner@blackbelt.app',
        reason: 'Meu CPF e endereco estao errados neste cadastro',
      }),
      headers: { 'content-type': 'application/json' },
    }));
    const body = await response.json();

    expect(response.status).toBe(202);
    expect(body.data.accepted).toBe(true);
    expect(auditInsertMock).toHaveBeenCalledWith(expect.objectContaining({
      new_value: expect.objectContaining({
        email_masked: 'o***r@b***t.app',
        reason_provided: true,
        existingRequest: false,
      }),
    }));
    expect(JSON.stringify(auditInsertMock.mock.calls[0][0])).not.toContain('Meu CPF e endereco');
    expect(JSON.stringify(auditInsertMock.mock.calls[0][0])).not.toContain('owner@blackbelt.app');
  });
});
