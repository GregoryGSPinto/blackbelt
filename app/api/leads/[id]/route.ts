import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseServerClient } from '@/lib/supabase/server';

// SECURITY: service role key bypasses RLS - use with caution
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/leads/[id] - Get lead details with interactions
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Fetch interactions
    const { data: interactions, error: interactionsError } = await supabaseAdmin
      .from('lead_interactions')
      .select('*')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    if (interactionsError) {
      console.error('[Leads API] Error fetching interactions:', interactionsError);
    }

    return NextResponse.json({ lead, interactions: interactions || [] });
  } catch (error) {
    console.error('[Leads API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/leads/[id] - Update lead
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if lead exists
    const { data: existingLead } = await supabaseAdmin
      .from('leads')
      .select('status')
      .eq('id', id)
      .single();

    if (!existingLead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Build update object
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.score !== undefined) updateData.score = body.score;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.custom_price !== undefined) updateData.custom_price = body.custom_price;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.modalities) updateData.modalities = body.modalities;
    if (body.current_students !== undefined) updateData.current_students = body.current_students;
    if (body.monthly_revenue !== undefined) updateData.monthly_revenue = body.monthly_revenue;
    if (body.rejection_reason) updateData.rejection_reason = body.rejection_reason;

    // If converting to academy, set converted_at
    if (body.status === 'converted' && existingLead.status !== 'converted') {
      updateData.converted_at = new Date().toISOString();
    }

    const { data: lead, error } = await supabaseAdmin
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Leads API] Error updating lead:', error);
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }

    // Create interaction for status change
    if (body.status && body.status !== existingLead.status) {
      await supabaseAdmin
        .from('lead_interactions')
        .insert({
          lead_id: id,
          type: 'status_change',
          content: `Status alterado de "${existingLead.status}" para "${body.status}"`,
          sent_by: user.id,
        });
    }

    // Create interaction for note
    if (body.new_note) {
      await supabaseAdmin
        .from('lead_interactions')
        .insert({
          lead_id: id,
          type: 'note',
          content: body.new_note,
          sent_by: user.id,
        });
    }

    return NextResponse.json({ lead });
  } catch (error) {
    console.error('[Leads API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] - Delete lead (soft delete by setting status)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify super admin access
    const authSupabase = await getSupabaseServerClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete by setting status to rejected
    const { error } = await supabaseAdmin
      .from('leads')
      .update({ status: 'rejected', rejection_reason: 'Excluído pelo administrador' })
      .eq('id', id);

    if (error) {
      console.error('[Leads API] Error deleting lead:', error);
      return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Leads API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
