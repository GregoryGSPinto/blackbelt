import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { requireSuperAdmin } from '@/lib/leads/server';
import { taskSchema } from '@/lib/leads/validation';

export async function GET(request: Request) {
  try {
    const { supabase } = await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');

    let query = supabase
      .from('lead_tasks')
      .select('*')
      .order('due_at', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (leadId) query = query.eq('lead_id', leadId);
    const { data, error } = await query;
    if (error) return leadApiError('Internal server error', 500);

    return leadApiSuccess({ tasks: data ?? [] });
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const rawBody = await request.json();
    const parsed = taskSchema.safeParse(rawBody);
    if (!parsed.success) {
      return leadApiError('Validation failed', 400, parsed.error.flatten());
    }

    const body = parsed.data;
    if (body.task_id) {
      const { data: existingTask, error: existingTaskError } = await supabase
        .from('lead_tasks')
        .select('id')
        .eq('id', body.task_id)
        .eq('lead_id', body.lead_id)
        .single();
      if (existingTaskError || !existingTask) {
        return leadApiError('Task not found for this lead', 404);
      }
    }

    const payload = {
      lead_id: body.lead_id,
      title: body.title,
      description: body.description ?? null,
      due_at: body.due_at ?? null,
      status: body.status,
      assigned_to: body.assigned_to ?? user.id,
      created_by: user.id,
    };

    const operation = body.task_id
      ? supabase.from('lead_tasks').update(payload).eq('id', body.task_id)
      : supabase.from('lead_tasks').insert(payload);

    const { data, error } = await operation.select('*').single();
    if (error) return leadApiError('Internal server error', 500);

    await supabase.from('lead_interactions').insert({
      lead_id: body.lead_id,
      type: 'note',
      content: body.task_id ? `Tarefa atualizada: ${body.title}` : `Nova tarefa criada: ${body.title}`,
      sent_by: user.id,
      created_by: user.id,
      metadata: { taskId: data.id, dueAt: body.due_at ?? null },
    });

    return leadApiSuccess({ task: data }, body.task_id ? 200 : 201);
  } catch (error) {
    return mapLeadError(error);
  }
}
