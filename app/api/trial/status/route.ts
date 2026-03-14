// ============================================================
// GET /api/trial/status - Get trial status
// ============================================================

import { NextResponse } from 'next/server';
import { trialService } from '@/lib/subscription/services-v3';
import { withBillingManagerAccess } from '@/lib/api/access-context';
import { apiServerError } from '@/lib/api/route-helpers';

export async function GET(request: Request) {
  try {
    const { membership } = await withBillingManagerAccess(request);
    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academy_id');

    if (!academyId) {
      return NextResponse.json(
        { error: 'Missing academy_id parameter' },
        { status: 400 }
      );
    }

    if (academyId !== membership.academy_id) {
      return NextResponse.json(
        { error: 'Academy mismatch for authenticated membership' },
        { status: 403 }
      );
    }

    const status = await trialService.getTrialStatus(academyId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof Response) {
      return error as NextResponse;
    }
    return apiServerError(error);
  }
}
