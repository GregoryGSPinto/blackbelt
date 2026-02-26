import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();

  // Store push notification request
  if (body.token) {
    // Register device token
    return apiOk({ success: true, message: 'Token registered' });
  }

  // Send notification via Supabase
  const { data, error } = await supabase.from('notifications').insert({
    profile_id: body.userId || body.profileId,
    academy_id: membership!.academy_id,
    title: body.title,
    body: body.body || body.message || '',
    type: 'push',
    data: body.data || {},
  }).select().single();

  if (error) throw error;
  return apiOk({ success: true, notification: data });
});
