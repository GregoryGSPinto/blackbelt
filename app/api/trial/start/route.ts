// ============================================================
// POST /api/trial/start - Start a new trial
// ============================================================

import { NextResponse } from 'next/server';
import { trialService } from '@/lib/subscription/services-v3';
import { withAuth } from '@/lib/api/route-helpers';

export async function POST(request: Request) {
  try {
    const { user } = await withAuth(request, { requireMembership: false });
    const body = await request.json();
    const { plan_id, academy_data, source, referrer_academy_id } = body;

    // Validate required fields
    if (!plan_id || !academy_data?.name || !academy_data?.email || !academy_data?.cnpj) {
      return NextResponse.json(
        { error: 'Missing required fields: plan_id, academy_data (name, email, cnpj)' },
        { status: 400 }
      );
    }

    // Check if CNPJ already had trial
    const hasHadTrial = await trialService.hasHadTrial(academy_data.cnpj);
    if (hasHadTrial) {
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

    return NextResponse.json(result);
  } catch (error) {
    console.error('[Trial Start API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
