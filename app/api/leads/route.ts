import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  // Leads are stored in notifications or a dedicated leads table
  // Return empty for now - table can be added via migration
  return apiOk({ leads: [], total: 0, stats: { total: 0, converted: 0, pending: 0 } });
});

export const POST = createHandler(async (req: NextRequest, { supabase, membership }) => {
  const body = await req.json();

  // Validate required fields
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    return NextResponse.json({ error: 'name is required (min 2 chars)', code: 'VALIDATION' }, { status: 400 });
  }
  if (body.email && (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))) {
    return NextResponse.json({ error: 'email must be valid', code: 'VALIDATION' }, { status: 400 });
  }
  if (body.phone && (typeof body.phone !== 'string' || body.phone.trim().length < 8)) {
    return NextResponse.json({ error: 'phone must be at least 8 characters', code: 'VALIDATION' }, { status: 400 });
  }

  const { data, error } = await supabase.from('notifications').insert({
    profile_id: membership!.id,
    academy_id: membership!.academy_id,
    title: `Lead: ${body.name.trim()}`,
    body: body.phone || body.email || '',
    type: 'lead',
    data: body,
  }).select().single();
  if (error) throw error;
  return apiOk(data);
});
