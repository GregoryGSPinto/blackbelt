import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSupabaseAdminClientMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: getSupabaseAdminClientMock,
}));

type State = {
  academies: Array<Record<string, any>>;
  profiles: Array<Record<string, any>>;
  memberships: Array<Record<string, any>>;
  academySubscriptions: Array<Record<string, any>>;
  trialTracking: Array<Record<string, any>>;
  usageQuotas: Array<Record<string, any>>;
  subscriptionPlans: Array<Record<string, any>>;
  deletedAcademyIds: string[];
  failMembershipUpsert?: boolean;
};

function createAdminClient(state: State) {
  function selectRows(table: string, filters: Record<string, any>) {
    const rows = (
      table === 'academies' ? state.academies :
      table === 'profiles' ? state.profiles :
      table === 'memberships' ? state.memberships :
      table === 'academy_subscriptions' ? state.academySubscriptions :
      table === 'trial_tracking' ? state.trialTracking :
      table === 'usage_quotas' ? state.usageQuotas :
      table === 'subscription_plans' ? state.subscriptionPlans :
      []
    );

    return rows.filter((row) => Object.entries(filters).every(([field, value]) => {
      if (field === 'metadata_contains') {
        return row.metadata?.cnpj_normalized === value.cnpj_normalized;
      }
      return row[field] === value;
    }));
  }

  return {
    from(table: string) {
      let filters: Record<string, any> = {};
      let payload: any = null;

      const query: any = {
        select() {
          return query;
        },
        eq(field: string, value: any) {
          filters[field] = value;
          return query;
        },
        contains(field: string, value: any) {
          filters[`${field}_contains`] = value;
          return query;
        },
        order() {
          return query;
        },
        limit() {
          return query;
        },
        delete() {
          return query;
        },
        insert(nextPayload: any) {
          payload = nextPayload;
          return query;
        },
        update(nextPayload: any) {
          payload = nextPayload;
          return query;
        },
        upsert(nextPayload: any) {
          payload = nextPayload;
          return query;
        },
        async single() {
          if (table === 'subscription_plans') {
            return { data: selectRows(table, filters)[0] ?? null, error: null };
          }

          if (table === 'academies') {
            if (payload && !filters.id) {
              const academy = { id: `academy-${state.academies.length + 1}`, ...payload };
              state.academies.push(academy);
              return { data: academy, error: null };
            }

            if (payload && filters.id) {
              const academy = state.academies.find((row) => row.id === filters.id) ?? null;
              if (academy) Object.assign(academy, payload);
              return { data: academy, error: null };
            }
          }

          if (table === 'academy_subscriptions') {
            if (payload) {
              const subscription = { id: `sub-${state.academySubscriptions.length + 1}`, ...payload };
              state.academySubscriptions.push(subscription);
              return { data: subscription, error: null };
            }
          }

          if (table === 'trial_tracking') {
            if (payload) {
              const tracking = { id: `trial-${state.trialTracking.length + 1}`, ...payload };
              state.trialTracking.push(tracking);
              return { data: tracking, error: null };
            }
          }

          return { data: selectRows(table, filters)[0] ?? null, error: null };
        },
        then(resolve: (value: any) => any, reject?: (reason: unknown) => any) {
          if (table === 'profiles') {
            const existing = state.profiles.find((row) => row.id === payload.id);
            if (existing) Object.assign(existing, payload);
            else state.profiles.push(payload);
            return Promise.resolve({ data: payload, error: null }).then(resolve, reject);
          }

          if (table === 'memberships') {
            if (state.failMembershipUpsert) {
              return Promise.resolve({ data: null, error: { message: 'membership bootstrap failed' } }).then(resolve, reject);
            }

            const existing = state.memberships.find((row) => row.profile_id === payload.profile_id && row.academy_id === payload.academy_id);
            if (existing) Object.assign(existing, payload);
            else state.memberships.push(payload);
            return Promise.resolve({ data: payload, error: null }).then(resolve, reject);
          }

          if (table === 'academies' && payload === null && filters.id) {
            state.deletedAcademyIds.push(filters.id);
            state.academies = state.academies.filter((row) => row.id !== filters.id);
            state.memberships = state.memberships.filter((row) => row.academy_id !== filters.id);
            state.academySubscriptions = state.academySubscriptions.filter((row) => row.academy_id !== filters.id);
            state.trialTracking = state.trialTracking.filter((row) => row.academy_id !== filters.id);
            return Promise.resolve({ data: null, error: null }).then(resolve, reject);
          }

          if (table === 'usage_quotas' && payload) {
            const quotaRows = Array.isArray(payload) ? payload : [payload];
            state.usageQuotas.push(...quotaRows);
            return Promise.resolve({ data: quotaRows, error: null }).then(resolve, reject);
          }

          if (table === 'academy_subscriptions' && payload === null) {
            return Promise.resolve({ data: selectRows(table, filters), error: null }).then(resolve, reject);
          }

          if (table === 'trial_tracking' && payload === null) {
            return Promise.resolve({ data: selectRows(table, filters), error: null }).then(resolve, reject);
          }

          if (table === 'subscription_plans') {
            return Promise.resolve({ data: selectRows(table, filters), error: null }).then(resolve, reject);
          }

          if (table === 'academy_subscriptions' && payload) {
            const subscription = { id: `sub-${state.academySubscriptions.length + 1}`, ...payload };
            state.academySubscriptions.push(subscription);
            return Promise.resolve({ data: subscription, error: null }).then(resolve, reject);
          }

          if (table === 'trial_tracking' && payload) {
            const tracking = { id: `trial-${state.trialTracking.length + 1}`, ...payload };
            state.trialTracking.push(tracking);
            return Promise.resolve({ data: tracking, error: null }).then(resolve, reject);
          }

          if (table === 'academies' && payload && filters.id) {
            const academy = state.academies.find((row) => row.id === filters.id) ?? null;
            if (academy) Object.assign(academy, payload);
            return Promise.resolve({ data: academy, error: null }).then(resolve, reject);
          }

          return Promise.resolve({ data: selectRows(table, filters), error: null }).then(resolve, reject);
        },
      };

      return query;
    },
  };
}

describe('commercial readiness hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts a trial on the current academies domain and bootstraps the owner membership', async () => {
    const state: State = {
      academies: [],
      profiles: [],
      memberships: [],
      academySubscriptions: [],
      trialTracking: [],
      usageQuotas: [],
      subscriptionPlans: [{
        id: 'plan-start',
        name: 'start',
        trial_days: 14,
        setup_price: 0,
        default_quotas: {},
      }],
      deletedAcademyIds: [],
    };

    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { trialService } = await import('@/lib/subscription/services-v3');
    const result = await trialService.startTrial({
      plan_id: 'plan-start',
      owner_profile_id: 'owner-1',
      owner_name: 'Gregory',
      academy_data: {
        name: 'Black Belt HQ',
        email: 'owner@blackbelt.app',
        cnpj: '12.345.678/0001-90',
        phone: '11999999999',
      },
    });

    expect(result.academy_id).toBe('academy-1');
    expect(state.academies[0]).toMatchObject({
      id: 'academy-1',
      name: 'Black Belt HQ',
      owner_id: 'owner-1',
      status: 'trial',
      slug: 'black-belt-hq-owner-1',
    });
    expect(state.memberships[0]).toMatchObject({
      profile_id: 'owner-1',
      academy_id: 'academy-1',
      role: 'owner',
      status: 'active',
    });
    expect(state.academySubscriptions[0]).toMatchObject({
      academy_id: 'academy-1',
      plan_id: 'plan-start',
      status: 'trialing',
    });
    expect(state.trialTracking[0].metadata).toMatchObject({
      cnpj_normalized: '12345678000190',
      owner_profile_id: 'owner-1',
    });
  });

  it('rolls back the academy if owner membership bootstrap fails during trial start', async () => {
    const state: State = {
      academies: [],
      profiles: [],
      memberships: [],
      academySubscriptions: [],
      trialTracking: [],
      usageQuotas: [],
      subscriptionPlans: [{
        id: 'plan-start',
        name: 'start',
        trial_days: 14,
        setup_price: 0,
        default_quotas: {},
      }],
      deletedAcademyIds: [],
      failMembershipUpsert: true,
    };

    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { trialService } = await import('@/lib/subscription/services-v3');
    await expect(trialService.startTrial({
      plan_id: 'plan-start',
      owner_profile_id: 'owner-2',
      academy_data: {
        name: 'Rollback Dojo',
        email: 'owner@rollback.test',
        cnpj: '98.765.432/0001-10',
        phone: '11999999999',
      },
    })).rejects.toThrow('Failed to bootstrap owner membership');

    expect(state.deletedAcademyIds).toEqual(['academy-1']);
    expect(state.academies).toEqual([]);
    expect(state.academySubscriptions).toEqual([]);
  });

  it('lists academy subscriptions through the current academies relation and searchable fields', async () => {
    const state: State = {
      academies: [{
        id: 'academy-9',
        name: 'Dojo Searchable',
        email: 'contato@dojo.test',
        phone: '1133334444',
      }],
      profiles: [],
      memberships: [],
      academySubscriptions: [{
        id: 'sub-9',
        academy_id: 'academy-9',
        plan_id: 'plan-pro',
        status: 'active',
        billing_cycle: 'monthly',
        created_at: '2026-03-14T00:00:00.000Z',
        academy: {
          id: 'academy-9',
          name: 'Dojo Searchable',
          email: 'contato@dojo.test',
          phone: '1133334444',
        },
        plan: {
          id: 'plan-pro',
          name: 'pro',
          display_name: 'Pro',
          student_limit: 150,
        },
      }],
      trialTracking: [],
      usageQuotas: [],
      subscriptionPlans: [],
      deletedAcademyIds: [],
    };

    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { pricingService } = await import('@/lib/pricing/service');
    const result = await pricingService.getAcademies({ search: 'dojo' });

    expect(result).toEqual([
      expect.objectContaining({
        academy_id: 'academy-9',
        academy: expect.objectContaining({
          id: 'academy-9',
          name: 'Dojo Searchable',
          email: 'contato@dojo.test',
          phone: '1133334444',
        }),
      }),
    ]);
  });
});
