import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, membership }) => {
  // Events are stored in domain_events or a dedicated events table
  // For now, return from notifications with type 'event'
  const { data } = await supabase.from('notifications')
    .select('*').eq('academy_id', membership!.academy_id).eq('type', 'event')
    .order('created_at', { ascending: false }).limit(50);
  return apiOk(data || []);
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  const { data, error } = await supabase.from('notifications').insert({
    profile_id: body.creatorId || membership!.id,
    academy_id: membership!.academy_id,
    title: body.title,
    body: body.description || '',
    type: 'event',
    data: body,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
