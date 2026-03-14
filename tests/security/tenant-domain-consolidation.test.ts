import { beforeEach, describe, expect, it, vi } from 'vitest';

const withAuthMock = vi.fn();
const withBillingManagerAccessMock = vi.fn();
const withSuperAdminAccessMock = vi.fn();
const getSubscriptionMock = vi.fn();
const checkStudentLimitMock = vi.fn();
const activateAddonMock = vi.fn();
const generateForecastMock = vi.fn();
const getAcademiesMock = vi.fn();
const buyCreditsMock = vi.fn();
const getSupabaseAdminClientMock = vi.fn();

vi.mock('@/lib/api/route-helpers', async () => {
  const actual = await vi.importActual<typeof import('@/lib/api/route-helpers')>('@/lib/api/route-helpers');
  return {
    ...actual,
    withAuth: withAuthMock,
  };
});

vi.mock('@/lib/api/access-context', () => ({
  withBillingManagerAccess: withBillingManagerAccessMock,
  withSuperAdminAccess: withSuperAdminAccessMock,
}));

vi.mock('@/lib/subscription/services-v3', () => ({
  planService: {
    getSubscription: getSubscriptionMock,
    checkStudentLimit: checkStudentLimitMock,
  },
}));

vi.mock('@/lib/subscription/services', () => ({
  addonManagement: {
    getAvailableAddons: vi.fn(),
    getActiveAddons: vi.fn(),
    activateAddon: activateAddonMock,
    deactivateAddon: vi.fn(),
  },
  billingForecast: {
    generateForecast: generateForecastMock,
  },
  prepaidCredits: {
    buyCredits: buyCreditsMock,
  },
}));

vi.mock('@/lib/pricing/service', () => ({
  pricingService: {
    getAcademies: getAcademiesMock,
  },
}));

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: getSupabaseAdminClientMock,
}));

describe('tenant domain consolidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSupabaseAdminClientMock.mockReturnValue({ from: vi.fn() });
  });

  it('rejects non-admin memberships in billing manager helper', async () => {
    const { withBillingManagerAccess } = await vi.importActual<typeof import('@/lib/api/access-context')>('@/lib/api/access-context');

    withAuthMock.mockResolvedValue({
      supabase: {},
      user: { id: 'user-1', email: 'student@test.com' },
      membership: { id: 'mem-1', academy_id: 'academy-1', role: 'student' },
    });

    await expect(withBillingManagerAccess(new Request('http://localhost'))).rejects.toMatchObject({ status: 403 });
  });

  it('uses membership academy_id for subscription data', async () => {
    const usageQuotas = [{ metric_type: 'api_requests', included_amount: 100, used_amount: 10 }];
    const fromMock = vi.fn((table: string) => {
      expect(table).not.toBe('usuarios_academia');
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            data: usageQuotas,
          }),
        }),
      };
    });

    withBillingManagerAccessMock.mockResolvedValue({
      supabase: { from: fromMock },
      user: { id: 'user-1', email: 'admin@test.com' },
      membership: { id: 'mem-1', academy_id: 'academy-9', role: 'admin' },
    });
    getSubscriptionMock.mockResolvedValue({ id: 'sub-1', plan: { id: 'plan-1' } });
    checkStudentLimitMock.mockResolvedValue({ current: 10, limit: 100, percentage: 10, exceeded: false, approaching: false });

    const { GET } = await import('@/app/api/subscription/route');
    const response = await GET(new Request('http://localhost/api/subscription'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getSubscriptionMock).toHaveBeenCalledWith('academy-9');
    expect(checkStudentLimitMock).toHaveBeenCalledWith('academy-9');
    expect(body.usage.quotas).toEqual(usageQuotas);
  });

  it('uses membership academy_id when activating addons', async () => {
    withBillingManagerAccessMock.mockResolvedValue({
      membership: { id: 'mem-2', academy_id: 'academy-22', role: 'owner' },
    });
    activateAddonMock.mockResolvedValue({ addon: { addon_type: 'whitelabel' } });

    const { POST } = await import('@/app/api/addons/route');
    const response = await POST(new Request('http://localhost/api/addons', {
      method: 'POST',
      body: JSON.stringify({ addonType: 'whitelabel', active: true }),
    }));

    expect(response.status).toBe(200);
    expect(activateAddonMock).toHaveBeenCalledWith('academy-22', 'whitelabel');
  });

  it('enforces super admin membership on academies listing', async () => {
    withSuperAdminAccessMock.mockResolvedValue({
      membership: { id: 'mem-super', academy_id: 'academy-root', role: 'super_admin' },
      user: { id: 'root-1', email: 'root@test.com' },
    });
    getAcademiesMock.mockResolvedValue([{ id: 'academy-1' }]);

    const { GET } = await import('@/app/api/super-admin/academies/route');
    const response = await GET(new Request('http://localhost/api/super-admin/academies?status=active'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getAcademiesMock).toHaveBeenCalledWith({ plan: undefined, status: 'active', search: undefined });
    expect(body.data).toEqual([{ id: 'academy-1' }]);
  });

  it('uses membership academy_id for billing forecast', async () => {
    withBillingManagerAccessMock.mockResolvedValue({
      membership: { id: 'mem-3', academy_id: 'academy-77', role: 'admin' },
    });
    generateForecastMock.mockResolvedValue({ total: 123 });

    const { GET } = await import('@/app/api/billing/forecast/route');
    const response = await GET(new Request('http://localhost/api/billing/forecast'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(generateForecastMock).toHaveBeenCalledWith('academy-77');
    expect(body).toEqual({ total: 123 });
  });

  it('uses billing manager membership academy_id when buying prepaid credits', async () => {
    buyCreditsMock.mockResolvedValue({ id: 'credit-1' });

    withBillingManagerAccessMock.mockResolvedValue({
      membership: { id: 'mem-4', academy_id: 'academy-55', profile_id: 'profile-4', role: 'owner' },
    });

    const { POST } = await import('@/app/api/usage/buy-credits/route');
    const response = await POST(new Request('http://localhost/api/usage/buy-credits', {
      method: 'POST',
      body: JSON.stringify({ creditType: 'api_requests', amount: 500 }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(buyCreditsMock).toHaveBeenCalledWith('academy-55', 'api_requests', 500);
    expect(body.credit).toEqual({ id: 'credit-1' });
  });

  it('uses membership-based super-admin access in leads helper', async () => {
    const fromMock = vi.fn();
    const { getSupabaseAdminClient } = await import('@/lib/supabase/admin');

    vi.mocked(getSupabaseAdminClient).mockReturnValue({ from: fromMock } as any);
    withSuperAdminAccessMock.mockResolvedValue({
      user: { id: 'root-2', email: 'root@test.com' },
      membership: { id: 'mem-root', academy_id: 'academy-root', profile_id: 'root-2', role: 'super_admin' },
    });

    const { requireSuperAdmin } = await import('@/lib/leads/server');
    const result = await requireSuperAdmin();

    expect(withSuperAdminAccessMock).toHaveBeenCalled();
    expect(result.user.id).toBe('root-2');
    expect(result.supabase.from).toBe(fromMock);
  });
});
