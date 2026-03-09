import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS - use with caution
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leads - List all leads with filters
export async function GET(request: Request) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super admin
    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .single();

    if (membership?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const city = searchParams.get('city');
    const modality = searchParams.get('modality');
    const minScore = searchParams.get('minScore');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (modality) {
      query = query.contains('modalities', [modality]);
    }
    if (minScore) {
      query = query.gte('score', parseInt(minScore));
    }
    if (search) {
      query = query.or(`academy_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`);
    }

    const { data: leads, error, count } = await query;

    if (error) {
      console.error('[Leads API] Error fetching leads:', error);
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }

    return NextResponse.json({ leads, count, limit, offset });
  } catch (error) {
    console.error('[Leads API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/leads - Create new lead
export async function POST(request: Request) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    const required = ['academy_name', 'responsible_name', 'email', 'city', 'state'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Insert lead
    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .insert({
        academy_name: body.academy_name,
        responsible_name: body.responsible_name,
        email: body.email,
        phone: body.phone,
        city: body.city,
        state: body.state,
        address: body.address,
        modalities: body.modalities || [],
        current_students: body.current_students || 0,
        monthly_revenue: body.monthly_revenue || 0,
        source: body.source || 'manual',
        assigned_to: user.id,
        notes: body.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('[Leads API] Error creating lead:', error);
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    // Create welcome interaction
    await supabaseAdmin
      .from('lead_interactions')
      .insert({
        lead_id: lead.id,
        type: 'note',
        content: 'Lead criado manualmente no sistema',
        sent_by: user.id,
      });

    return NextResponse.json({ lead }, { status: 201 });
  } catch (error) {
    console.error('[Leads API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
