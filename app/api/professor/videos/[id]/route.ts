import { NextRequest } from 'next/server';
import { createHandler, apiOk, apiError } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

function extractId(req: NextRequest): string | null {
  const segments = new URL(req.url).pathname.split('/');
  // /api/professor/videos/[id] → last segment is the id
  return segments[segments.length - 1] || null;
}

export const PUT = createHandler(async (req: NextRequest) => {
  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  const body = await req.json();
  return apiOk({ id, ...body, atualizadoEm: new Date().toISOString() });
});

export const DELETE = createHandler(async (req: NextRequest) => {
  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  // TODO(BE-150): Delete from storage provider + database
  return apiOk({ deleted: true, id });
});
