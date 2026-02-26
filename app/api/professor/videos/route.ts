import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const GET = createHandler(async (_req: NextRequest) => {
  // Videos are stored externally (YouTube). Return empty list.
  return apiOk([]);
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `vid_${Date.now()}`, ...body, created: true });
});
