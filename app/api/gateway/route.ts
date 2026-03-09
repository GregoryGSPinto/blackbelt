import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk({ webhooks: [] });
});

export const POST = createHandler(async (req: NextRequest) => {
  void req;
  return apiError('Gateway endpoint not implemented', 'NOT_IMPLEMENTED', 501);
});
