import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user, membership }) => {
  const { data: profile } = await supabase.from('profiles')
    .select('full_name, avatar_url, birth_date').eq('id', user.id).single();

  return apiOk({
    id: membership!.id,
    nome: profile?.full_name || '',
    avatar: profile?.avatar_url || null,
    dataNascimento: profile?.birth_date || null,
    graduacao: null,
    academyId: membership!.academy_id,
    role: membership!.role,
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  });
});
