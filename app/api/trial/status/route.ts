// ============================================================
// GET /api/trial/status - Get trial status
// ============================================================

import { NextResponse } from 'next/server';
import { trialService } from '@/lib/subscription/services-v3';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const academyId = searchParams.get('academy_id');

    if (!academyId) {
      return NextResponse.json(
        { error: 'Missing academy_id parameter' },
        { status: 400 }
      );
    }

    const status = await trialService.getTrialStatus(academyId);
    return NextResponse.json(status);
  } catch (error) {
    console.error('[Trial Status API]', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
