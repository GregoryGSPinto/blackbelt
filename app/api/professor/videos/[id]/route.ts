import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';
import { mapContentRowToManagedVideo } from '@/lib/academy/operations';

export const dynamic = 'force-dynamic';

function extractId(req: NextRequest): string | null {
  const segments = new URL(req.url).pathname.split('/');
  return segments[segments.length - 1] || null;
}

function assertProfessorAccess(role?: string | null) {
  if (!role || !['owner', 'admin', 'professor'].includes(role)) {
    throw apiError('Sem permissão para gerenciar vídeos.', 'FORBIDDEN', 403);
  }
}

export const PUT = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertProfessorAccess(membership?.role);

  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  const body = await req.json();

  let query = supabase
    .from('content')
    .update({
      title: body.title ? String(body.title).trim() : undefined,
      description: typeof body.description === 'string' ? body.description.trim() : undefined,
      tags: Array.isArray(body.tags) ? body.tags : undefined,
      martial_art: body.category ? String(body.category) : undefined,
      belt_level: body.level ? String(body.level) : undefined,
      updated_at: new Date().toISOString(),
      metadata: {
        turmasAssociadas: Array.isArray(body.turmasAssociadas) ? body.turmasAssociadas : [],
      },
    })
    .eq('id', id)
    .eq('academy_id', membership!.academy_id);

  if (membership!.role === 'professor') {
    query = query.eq('created_by', user.id);
  }

  const { data, error } = await query
    .select('id, academy_id, title, description, url, thumbnail_url, tags, martial_art, belt_level, visibility, duration_secs, created_by, created_at, updated_at, metadata')
    .single();

  if (error) throw error;

  return apiOk(mapContentRowToManagedVideo(data));
});

export const DELETE = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertProfessorAccess(membership?.role);

  const id = extractId(req);
  if (!id) return apiError('ID é obrigatório', 'MISSING_ID', 400);

  let query = supabase
    .from('content')
    .delete()
    .eq('id', id)
    .eq('academy_id', membership!.academy_id);

  if (membership!.role === 'professor') {
    query = query.eq('created_by', user.id);
  }

  const { error } = await query;
  if (error) throw error;

  return apiOk({ ok: true });
});
