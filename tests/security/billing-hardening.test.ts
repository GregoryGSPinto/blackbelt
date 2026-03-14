import { beforeEach, describe, expect, it, vi } from 'vitest';

const publishMock = vi.fn();
const getSupabaseAdminClientMock = vi.fn();
const withBillingManagerAccessMock = vi.fn();
const getSubscriptionMock = vi.fn();
const createCheckoutSessionMock = vi.fn();
const resolveStripePriceIdMock = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: getSupabaseAdminClientMock,
}));

vi.mock('@/lib/application/events/event-bus', () => ({
  eventBus: {
    publish: publishMock,
  },
}));

vi.mock('@/lib/domain/events/domain-events', () => ({
  startCausationChain: vi.fn(() => ({ correlationId: 'corr-1', causationId: 'cause-1' })),
  createEvent: vi.fn((type: string, academyId: string, payload: unknown) => ({ type, academyId, payload })),
}));

vi.mock('@/lib/api/access-context', () => ({
  withBillingManagerAccess: withBillingManagerAccessMock,
}));

vi.mock('@/lib/subscription/services-v3', async () => {
  const actual = await vi.importActual<typeof import('@/lib/subscription/services-v3')>('@/lib/subscription/services-v3');
  return {
    ...actual,
    planService: {
      ...actual.planService,
      getSubscription: getSubscriptionMock,
    },
  };
});

vi.mock('@/lib/payments/stripe-checkout', () => ({
  createCheckoutSession: createCheckoutSessionMock,
}));

vi.mock('@/lib/payments/stripe-plan-mapping', () => ({
  resolveStripePriceId: resolveStripePriceIdMock,
  inferBillingCycleFromPriceId: vi.fn(() => null),
}));

vi.mock('@/lib/env', async () => {
  const actual = await vi.importActual<typeof import('@/lib/env')>('@/lib/env');
  return {
    ...actual,
    getRequiredEnv: vi.fn((name: string) => {
      const value = process.env[name];
      if (!value) throw new Error(`Missing ${name} environment variable`);
      return value;
    }),
  };
});

type State = {
  academySubscriptions: Array<Record<string, any>>;
  subscriptionPlans: Array<Record<string, any>>;
  academyUpdates: Array<Record<string, any>>;
  invoiceUpserts: Array<Record<string, any>>;
};

function createAdminClient(state: State) {
  function execute(table: string, action: string, payload: any, filters: Record<string, any>) {
    if (action === 'select') {
      if (table === 'academy_subscriptions') {
        if (filters.academy_id) {
          return state.academySubscriptions.find((row) => row.academy_id === filters.academy_id) ?? null;
        }
        if (filters.stripe_subscription_id) {
          return state.academySubscriptions.find((row) => row.stripe_subscription_id === filters.stripe_subscription_id) ?? null;
        }
      }

      if (table === 'subscription_plans') {
        if (filters.id) {
          return state.subscriptionPlans.find((row) => row.id === filters.id) ?? null;
        }
        return state.subscriptionPlans;
      }

      if (table === 'usage_quotas') {
        return [];
      }
    }

    if (action === 'update') {
      if (table === 'academies') {
        state.academyUpdates.push({ payload, filters });
        return null;
      }

      if (table === 'academy_subscriptions') {
        const row = state.academySubscriptions.find((item) => (
          (filters.id && item.id === filters.id) ||
          (filters.academy_id && item.academy_id === filters.academy_id)
        ));
        if (row) Object.assign(row, payload);
        return row ?? null;
      }
    }

    if (action === 'insert') {
      if (table === 'academy_subscriptions') {
        const row = { id: payload.id ?? `sub-${state.academySubscriptions.length + 1}`, ...payload };
        state.academySubscriptions.push(row);
        return row;
      }
    }

    if (action === 'upsert') {
      if (table === 'subscription_invoices') {
        state.invoiceUpserts.push(payload);
        return { id: payload.stripe_invoice_id ?? `inv-${state.invoiceUpserts.length}` };
      }
    }

    return null;
  }

  return {
    from(table: string) {
      let action = 'select';
      let payload: any = null;
      const filters: Record<string, any> = {};

      const query: any = {
        select() {
          action = 'select';
          return query;
        },
        eq(field: string, value: any) {
          filters[field] = value;
          return query;
        },
        maybeSingle: async () => ({ data: execute(table, action, payload, filters), error: null }),
        single: async () => ({ data: execute(table, action, payload, filters), error: null }),
        update(nextPayload: any) {
          action = 'update';
          payload = nextPayload;
          return query;
        },
        insert(nextPayload: any) {
          action = 'insert';
          payload = nextPayload;
          return query;
        },
        upsert(nextPayload: any) {
          action = 'upsert';
          payload = nextPayload;
          return query;
        },
        limit() {
          return query;
        },
        order() {
          return query;
        },
        lte() {
          return query;
        },
        gte() {
          return query;
        },
        then(resolve: (value: any) => any, reject?: (reason: unknown) => any) {
          return Promise.resolve({ data: execute(table, action, payload, filters), error: null }).then(resolve, reject);
        },
      };

      return query;
    },
  };
}

describe('billing hardening', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
  });

  it('syncs checkout completion into academy_subscriptions for the correct tenant', async () => {
    const state: State = {
      academySubscriptions: [{
        id: 'sub-1',
        academy_id: 'academy-1',
        plan_id: 'plan-start',
        status: 'trialing',
        billing_cycle: 'monthly',
        current_period_starts_at: null,
        current_period_ends_at: null,
        trial_converted: false,
        trial_converted_at: null,
        metadata: {},
      }],
      subscriptionPlans: [],
      academyUpdates: [],
      invoiceUpserts: [],
    };
    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { processWebhookEvent } = await import('@/lib/payments/stripe-webhook');
    await processWebhookEvent({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_123',
          metadata: { academy_id: 'academy-1', plan_id: 'plan-pro', billing_cycle: 'annual' },
          subscription: 'sub_stripe_1',
          customer: 'cus_1',
          payment_status: 'paid',
        },
      },
    } as any);

    expect(state.academySubscriptions[0]).toMatchObject({
      academy_id: 'academy-1',
      plan_id: 'plan-pro',
      stripe_subscription_id: 'sub_stripe_1',
      stripe_customer_id: 'cus_1',
      status: 'active',
      billing_cycle: 'annual',
      trial_converted: true,
    });
    expect(state.academyUpdates[0]).toMatchObject({
      payload: { stripe_customer_id: 'cus_1' },
      filters: { id: 'academy-1' },
    });
  });

  it('marks academy subscription as past_due and records failed commercial invoice', async () => {
    const state: State = {
      academySubscriptions: [{
        id: 'sub-2',
        academy_id: 'academy-2',
        plan_id: 'plan-pro',
        status: 'active',
        billing_cycle: 'monthly',
        stripe_subscription_id: 'sub_stripe_2',
        metadata: {},
      }],
      subscriptionPlans: [],
      academyUpdates: [],
      invoiceUpserts: [],
    };
    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { processWebhookEvent } = await import('@/lib/payments/stripe-webhook');
    await processWebhookEvent({
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_failed_1',
          amount_due: 12900,
          subtotal: 12900,
          tax: 0,
          payment_intent: 'pi_1',
          lines: {
            data: [{ period: { start: 1_710_000_000, end: 1_712_592_000 } }],
          },
          parent: {
            subscription_details: {
              subscription: 'sub_stripe_2',
            },
          },
        },
      },
    } as any);

    expect(state.academySubscriptions[0].status).toBe('past_due');
    expect(state.invoiceUpserts[0]).toMatchObject({
      academy_id: 'academy-2',
      stripe_invoice_id: 'in_failed_1',
      total_amount: 12900,
      status: 'failed',
    });
  });

  it('syncs Stripe plan changes into academy_subscriptions instead of mutating locally before webhook', async () => {
    const state: State = {
      academySubscriptions: [{
        id: 'sub-3',
        academy_id: 'academy-3',
        plan_id: 'plan-start',
        status: 'active',
        billing_cycle: 'monthly',
        stripe_subscription_id: 'sub_stripe_3',
        metadata: {},
      }],
      subscriptionPlans: [],
      academyUpdates: [],
      invoiceUpserts: [],
    };
    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { processWebhookEvent } = await import('@/lib/payments/stripe-webhook');
    await processWebhookEvent({
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_stripe_3',
          status: 'active',
          customer: 'cus_3',
          cancel_at_period_end: false,
          metadata: { plan_id: 'plan-business', billing_cycle: 'annual' },
          current_period_start: 1_710_000_000,
          current_period_end: 1_713_153_600,
          items: {
            data: [{ price: { id: 'price_business_annual', recurring: { interval: 'year' } } }],
          },
        },
      },
    } as any);

    expect(state.academySubscriptions[0]).toMatchObject({
      plan_id: 'plan-business',
      billing_cycle: 'annual',
      status: 'active',
      stripe_customer_id: 'cus_3',
    });
  });

  it('marks deleted Stripe subscriptions as canceled in academy_subscriptions', async () => {
    const state: State = {
      academySubscriptions: [{
        id: 'sub-4',
        academy_id: 'academy-4',
        plan_id: 'plan-pro',
        status: 'active',
        billing_cycle: 'monthly',
        stripe_subscription_id: 'sub_stripe_4',
        metadata: {},
      }],
      subscriptionPlans: [],
      academyUpdates: [],
      invoiceUpserts: [],
    };
    getSupabaseAdminClientMock.mockReturnValue(createAdminClient(state));

    const { processWebhookEvent } = await import('@/lib/payments/stripe-webhook');
    await processWebhookEvent({
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_stripe_4',
          current_period_end: 1_713_153_600,
          cancellation_details: { reason: 'payment_failed' },
        },
      },
    } as any);

    expect(state.academySubscriptions[0].status).toBe('canceled');
    expect(state.academySubscriptions[0].auto_renew).toBe(false);
    expect(state.academySubscriptions[0].metadata.cancellation_reason).toBe('payment_failed');
  });

  it('requires tenant-authenticated Stripe checkout when converting a trial', async () => {
    withBillingManagerAccessMock.mockResolvedValue({
      membership: { id: 'mem-1', academy_id: 'academy-9', role: 'owner' },
    });
    getSubscriptionMock.mockResolvedValue({
      id: 'sub-9',
      academy_id: 'academy-9',
      status: 'trialing',
      plan: { id: 'plan-pro', name: 'Pro', display_name: 'Pro' },
    });
    resolveStripePriceIdMock.mockReturnValue('price_pro_monthly');
    createCheckoutSessionMock.mockResolvedValue('https://checkout.stripe.com/test-session');

    const { POST } = await import('@/app/api/trial/convert/route');
    const response = await POST(new Request('http://localhost/api/trial/convert', {
      method: 'POST',
      body: JSON.stringify({ academy_id: 'academy-9', billing_cycle: 'monthly' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(resolveStripePriceIdMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'plan-pro' }),
      'monthly',
    );
    expect(createCheckoutSessionMock).toHaveBeenCalledWith(expect.objectContaining({
      academyId: 'academy-9',
      planId: 'plan-pro',
      billingCycle: 'monthly',
      priceId: 'price_pro_monthly',
    }));
    expect(body.checkoutUrl).toBe('https://checkout.stripe.com/test-session');
  });

  it('blocks plan features when subscription is not commercially active', async () => {
    getSupabaseAdminClientMock.mockReturnValue({
      from(table: string) {
        if (table === 'academy_subscriptions') {
          const query: any = {
            select: () => query,
            eq: () => query,
            single: async () => ({
              data: {
                id: 'sub-10',
                academy_id: 'academy-10',
                status: 'past_due',
                trial_ends_at: null,
                current_period_ends_at: new Date(Date.now() + 86_400_000).toISOString(),
                plan: {
                  features: {
                    white_label: true,
                    store_enabled: false,
                    advanced_reports: false,
                    priority_support: false,
                  },
                },
              },
            }),
          };
          return query;
        }

        if (table === 'subscription_addons') {
          const query: any = {
            select: () => query,
            eq: () => query,
            then(resolve: (value: any) => any, reject?: (reason: unknown) => any) {
              return Promise.resolve({ data: [{ addon_type: 'white_label', is_active: true }], error: null }).then(resolve, reject);
            },
          };
          return query;
        }

        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null }),
            }),
          }),
        };
      },
    });

    const { usageService } = await vi.importActual<typeof import('@/lib/subscription/services-v3')>('@/lib/subscription/services-v3');
    await expect(usageService.checkFeature('academy-10', 'white_label')).resolves.toBe(false);
  });
});
