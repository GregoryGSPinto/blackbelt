// ============================================================
// POST /api/trial/start - Start a new trial
// ============================================================

import { NextResponse } from 'next/server';
import { trialService } from '@/lib/subscription/services-v3';
import { withAuth, apiServerError } from '@/lib/api/route-helpers';
import { logRouteEvent } from '@/lib/monitoring/route-observability';

export async function POST(request: Request) {
  try {
    const { user } = await withAuth(request, { requireMembership: false });
    const body = await request.json();
    const { plan_id, academy_data, source, referrer_academy_id } = body;

    // Validate required fields
    if (!plan_id || !academy_data?.name || !academy_data?.email || !academy_data?.cnpj) {
      logRouteEvent('warn', 'business', 'Trial start request missing required fields', request, {
        event_type: 'trial_start_validation_failed',
        profile_id: user.id,
      });
      return NextResponse.json(
        { error: 'Missing required fields: plan_id, academy_data (name, email, cnpj)' },
        { status: 400 }
      );
    }

    // Check if CNPJ already had trial
    const hasHadTrial = await trialService.hasHadTrial(academy_data.cnpj);
    if (hasHadTrial) {
      logRouteEvent('warn', 'business', 'Trial start rejected because CNPJ has already consumed a trial', request, {
        event_type: 'trial_start_duplicate_cnpj',
        profile_id: user.id,
      });
      return NextResponse.json(
        { error: 'CNPJ already used for trial', code: 'TRIAL_ALREADY_USED' },
        { status: 400 }
      );
    }

    // Start trial
    const result = await trialService.startTrial({
      plan_id,
      academy_data,
      owner_profile_id: user.id,
      owner_name: user.email?.split('@')[0] || academy_data.name,
      source,
      referrer_academy_id,
    });

    logRouteEvent('info', 'business', 'Trial started successfully', request, {
      event_type: 'trial_started',
      profile_id: user.id,
      academy_id: result.academy_id,
      plan_id: plan_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    logRouteEvent('error', 'error', 'Trial start failed unexpectedly', request, {
      event_type: 'trial_start_failed',
      reason: error,
    });
    return apiServerError(error);
  }
}
