import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { canTransitionLeadStage } from '@/lib/leads/pipeline';
import { LEAD_PIPELINE_STATUSES } from '@/lib/leads/types';
import { requireSuperAdmin } from '@/lib/leads/server';

export async function GET() {
  try {
    const { supabase } = await requireSuperAdmin();
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('score', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      return leadApiError(error.message, 500);
    }

    const columns = LEAD_PIPELINE_STATUSES.map((status) => ({
      status,
      leads: (leads ?? []).filter((lead: any) => lead.status === status),
    }));

    return leadApiSuccess({ columns });
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const body = await request.json();
    const { leadId, toStatus, reason } = body ?? {};

    if (!leadId || !toStatus) {
      return leadApiError('leadId and toStatus are required', 400);
    }

    const { data: currentLead, error: currentError } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (currentError || !currentLead) {
      return leadApiError('Lead not found', 404);
    }
    if (!LEAD_PIPELINE_STATUSES.includes(toStatus)) {
      return leadApiError('Invalid pipeline status', 400);
    }
    if (!canTransitionLeadStage(currentLead.status, toStatus)) {
      return leadApiError(`Invalid pipeline transition: ${currentLead.status} -> ${toStatus}`, 409);
    }
    if (toStatus === 'LOST' && !reason) {
      return leadApiError('reason is required when moving to LOST', 400);
    }

    const updatePayload: Record<string, unknown> = {
      status: toStatus,
      last_status_changed_at: new Date().toISOString(),
    };
    if (toStatus === 'WON') updatePayload.converted_at = new Date().toISOString();
    if (toStatus === 'LOST') updatePayload.loss_reason = reason ?? 'NO_RESPONSE';

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updatePayload)
      .eq('id', leadId)
      .select('*')
      .single();

    if (error) {
      return leadApiError(error.message, 500);
    }

    await Promise.all([
      supabase.from('lead_interactions').insert({
        lead_id: leadId,
        type: 'status_change',
        content: `Pipeline movido de ${currentLead.status} para ${toStatus}`,
        sent_by: user.id,
        created_by: user.id,
        metadata: { from: currentLead.status, to: toStatus, reason: reason ?? null },
      }),
    ]);

    return leadApiSuccess({ lead });
  } catch (error) {
    return mapLeadError(error);
  }
}
