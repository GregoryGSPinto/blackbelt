import { NextRequest } from 'next/server';
import { createHandler, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

function extractId(req: NextRequest): string | null {
  const segments = new URL(req.url).pathname.split('/');
  // /api/professor/videos/[id] → last segment is the id
  return segments[segments.length - 1] || null;
}

export const PUT = createHandler(async (req: NextRequest) => {
  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  return apiError('Video update not implemented', 'NOT_IMPLEMENTED', 501);
});

export const DELETE = createHandler(async (req: NextRequest) => {
  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  return apiError('Video deletion not implemented', 'NOT_IMPLEMENTED', 501);
});
