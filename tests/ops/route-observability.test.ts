import { describe, expect, it } from 'vitest';

import { createRouteLogContext } from '@/lib/monitoring/route-observability';

describe('route observability helper', () => {
  it('builds route context with critical identifiers and sanitized failure reason', () => {
    const context = createRouteLogContext(
      new Request('https://blackbelt.app/api/trial/start'),
      {
        event_type: 'trial_start_failed',
        academy_id: 'academy-1',
        membership_id: 'membership-1',
        profile_id: 'profile-1',
        reason: new Error('token secret owner@blackbelt.app (11) 99999-9999'),
      },
    );

    expect(context).toMatchObject({
      route: '/api/trial/start',
      event_type: 'trial_start_failed',
      academy_id: 'academy-1',
      membership_id: 'membership-1',
      profile_id: 'profile-1',
    });
    expect(String(context.failure_reason)).not.toContain('owner@blackbelt.app');
    expect(String(context.failure_reason)).not.toContain('99999-9999');
  });
});
