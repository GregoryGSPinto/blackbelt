import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  // Leads are stored in notifications or a dedicated leads table
  // Return empty for now - table can be added via migration
  return apiOk({ leads: [], total: 0, stats: { total: 0, converted: 0, pending: 0 } });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();
  // Store lead as notification for now
  const { data, error } = await supabase.from('notifications').insert({
    profile_id: membership!.id,
    academy_id: membership!.academy_id,
    title: `Lead: ${body.name || 'Novo'}`,
    body: body.phone || body.email || '',
    type: 'lead',
    data: body,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
