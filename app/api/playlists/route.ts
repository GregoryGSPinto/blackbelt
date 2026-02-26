import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest) => {
  return apiOk([]);
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `pl_${Date.now()}`, ...body, created: true });
});
