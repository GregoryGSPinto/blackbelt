import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const profId = url.searchParams.get('profId');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  // TODO(BE-120): Query real database with filters
  // For now, return empty list (videos stored externally)
  let results: unknown[] = [];

  // When real DB is connected, filter by:
  // - profId: filter by professor
  // - status: filter by published/draft/processing
  // - search: full-text search on title/description
  void profId;
  void status;
  void search;

  return apiOk(results);
});

export const POST = createHandler(async (req: NextRequest) => {
  const body = await req.json();
  return apiOk({ id: `vid_${Date.now()}`, ...body, created: true });
});
