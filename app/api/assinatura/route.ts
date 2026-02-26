import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user }) => {
  const { data } = await supabase.from('lgpd_consent_log')
    .select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
  return apiOk({ documentos: [], consentimentos: data || [] });
});

export const POST = createHandler(async (req: NextRequest, { supabase, user }) => {
  const body = await req.json();
  const { data, error } = await supabase.from('lgpd_consent_log').insert({
    profile_id: user.id,
    consent_type: body.type || 'terms',
    granted: body.granted ?? true,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
