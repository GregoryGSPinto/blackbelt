import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { canTransitionLeadStage } from '@/lib/leads/pipeline';
import { calculateLeadScore } from '@/lib/leads/scoring';
import { requireSuperAdmin } from '@/lib/leads/server';
import { updateLeadSchema } from '@/lib/leads/validation';

async function fetchLeadBundle(supabase: any, id: string) {
  const [
    leadResult,
    interactionsResult,
    tasksResult,
    proposalsResult,
    statusHistoryResult,
    scoreHistoryResult,
  ] = await Promise.all([
    supabase.from('leads').select('*').eq('id', id).single(),
    supabase.from('lead_interactions').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('lead_tasks').select('*').eq('lead_id', id).order('due_at', { ascending: true, nullsFirst: false }),
    supabase.from('lead_proposals').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
    supabase.from('lead_status_history').select('*').eq('lead_id', id).order('changed_at', { ascending: false }),
    supabase.from('lead_score_history').select('*').eq('lead_id', id).order('changed_at', { ascending: false }),
  ]);

  return {
    lead: leadResult.data,
    leadError: leadResult.error,
    interactions: interactionsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    proposals: proposalsResult.data ?? [],
    statusHistory: statusHistoryResult.data ?? [],
    scoreHistory: scoreHistoryResult.data ?? [],
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await requireSuperAdmin();
    const { id } = await params;
    const result = await fetchLeadBundle(supabase, id);

    if (result.leadError || !result.lead) {
      return leadApiError('Lead not found', 404);
    }

    return leadApiSuccess(result);
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const { id } = await params;
    const rawBody = await request.json();
    const parsed = updateLeadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return leadApiError('Validation failed', 400, parsed.error.flatten());
    }

    const { data: currentLead, error: currentError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (currentError || !currentLead) {
      return leadApiError('Lead not found', 404);
    }

    const body = parsed.data;
    const merged = {
      ...currentLead,
      ...body,
      website: body.website === '' ? null : body.website,
    };

    const score = calculateLeadScore(merged);
    const statusChanged = body.status && body.status !== currentLead.status;

    if (statusChanged && body.status && !canTransitionLeadStage(currentLead.status, body.status)) {
      return leadApiError(`Invalid pipeline transition: ${currentLead.status} -> ${body.status}`, 409);
    }

    const updatePayload: Record<string, unknown> = {
      ...body,
      website: body.website === '' ? null : body.website,
      score: score.score,
    };

    if (statusChanged && body.status === 'WON') {
      updatePayload.converted_at = body.converted_at ?? new Date().toISOString();
      updatePayload.closed_price = body.closed_price ?? body.proposed_price ?? currentLead.proposed_price;
    }
    if (statusChanged && body.status === 'LOST' && !body.loss_reason) {
      return leadApiError('loss_reason is required when moving a lead to LOST', 400);
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return leadApiError(error.message, 500);
    }

    if (statusChanged) {
      await Promise.all([
        supabase.from('lead_interactions').insert({
          lead_id: id,
          type: 'status_change',
          content: `Pipeline movido de ${currentLead.status} para ${body.status}`,
          sent_by: user.id,
          created_by: user.id,
          metadata: { from: currentLead.status, to: body.status, reason: body.loss_reason ?? null },
        }),
      ]);
    }

    if (typeof rawBody.new_note === 'string' && rawBody.new_note.trim()) {
      await supabase.from('lead_interactions').insert({
        lead_id: id,
        type: 'note',
        content: rawBody.new_note.trim(),
        sent_by: user.id,
        created_by: user.id,
      });
    }

    const result = await fetchLeadBundle(supabase, id);
    return leadApiSuccess(result);
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const { id } = await params;

    const { data: lead } = await supabase
      .from('leads')
      .select('status')
      .eq('id', id)
      .single();

    if (!lead) {
      return leadApiError('Lead not found', 404);
    }

    await Promise.all([
      supabase.from('leads').update({
        status: 'LOST',
        loss_reason: 'NOT_INTERESTED',
      }).eq('id', id),
      supabase.from('lead_interactions').insert({
        lead_id: id,
        type: 'status_change',
        content: 'Lead arquivado como perda.',
        sent_by: user.id,
        created_by: user.id,
        metadata: { from: lead.status, to: 'LOST' },
      }),
    ]);

    return leadApiSuccess({ success: true });
  } catch (error) {
    return mapLeadError(error);
  }
}
