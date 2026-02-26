import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  // Lesson plans stored in notifications/domain_events or dedicated table
  return apiOk({ planos: [], tecnicas: [], templates: [] });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  return apiOk({ id: `plan_${Date.now()}`, ...body, created: true });
});
