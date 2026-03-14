import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';
import { extractYoutubeId, mapContentRowToManagedVideo } from '@/lib/academy/operations';

export const dynamic = 'force-dynamic';

function assertProfessorAccess(role?: string | null) {
  if (!role || !['owner', 'admin', 'professor'].includes(role)) {
    throw apiError('Sem permissão para gerenciar vídeos.', 'FORBIDDEN', 403);
  }
}

export const GET = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertProfessorAccess(membership?.role);

  const url = new URL(req.url);
  const search = url.searchParams.get('search')?.trim().toLowerCase();

  let query = supabase
    .from('content')
    .select('id, academy_id, title, description, url, thumbnail_url, tags, martial_art, belt_level, visibility, duration_secs, created_by, created_at, updated_at, metadata')
    .eq('academy_id', membership!.academy_id)
    .eq('type', 'video')
    .order('created_at', { ascending: false });

  if (membership!.role === 'professor') {
    query = query.eq('created_by', user.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  const normalized = (data || [])
    .filter((row: any) => extractYoutubeId(row.url || ''))
    .map((row: any) => mapContentRowToManagedVideo(row))
    .filter((row: any) => {
      if (!search) return true;
      return (
        row.title.toLowerCase().includes(search) ||
        row.description.toLowerCase().includes(search) ||
        row.category.toLowerCase().includes(search) ||
        row.tags?.some((tag: string) => tag.toLowerCase().includes(search))
      );
    });

  return apiOk(normalized);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertProfessorAccess(membership?.role);

  const body = await req.json();
  const youtubeUrl = body.youtubeUrl || body.url;
  const youtubeId = extractYoutubeId(String(youtubeUrl || ''));

  if (!body.title || !youtubeId) {
    return apiError('Título e URL válida do YouTube são obrigatórios.', 'VALIDATION', 400);
  }

  const { data, error } = await supabase
    .from('content')
    .insert({
      academy_id: membership!.academy_id,
      title: String(body.title).trim(),
      description: body.description ? String(body.description).trim() : null,
      type: 'video',
      url: String(youtubeUrl),
      thumbnail_url: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
      tags: Array.isArray(body.tags) ? body.tags : [],
      martial_art: body.category ? String(body.category) : 'Biblioteca',
      belt_level: body.level ? String(body.level) : 'Iniciante',
      visibility: body.visibility === 'public' ? 'public' : 'academy',
      created_by: user.id,
      metadata: {
        turmasAssociadas: Array.isArray(body.turmasAssociadas) ? body.turmasAssociadas : [],
        source: 'youtube',
        contentType: 'aula',
      },
    })
    .select('id, academy_id, title, description, url, thumbnail_url, tags, martial_art, belt_level, visibility, duration_secs, created_by, created_at, updated_at, metadata')
    .single();

  if (error) throw error;

  return apiOk(mapContentRowToManagedVideo(data), 201);
});
