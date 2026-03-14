import { categorizeLeadScore } from '@/lib/leads/scoring';
import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { requireSuperAdmin } from '@/lib/leads/server';
import { createLeadSchema, interactionSchema } from '@/lib/leads/validation';

function parseListFilters(request: Request) {
  const { searchParams } = new URL(request.url);
  return {
    status: searchParams.get('status'),
    city: searchParams.get('city'),
    modality: searchParams.get('modality'),
    source: searchParams.get('source'),
    assignedTo: searchParams.get('assignedTo'),
    search: searchParams.get('search'),
    scoreCategory: searchParams.get('scoreCategory'),
    limit: Math.min(100, Math.max(1, Number(searchParams.get('limit') || 25))),
    offset: Math.max(0, Number(searchParams.get('offset') || 0)),
  };
}

export async function GET(request: Request) {
  try {
    const { supabase } = await requireSuperAdmin();
    const filters = parseListFilters(request);

    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .order('score', { ascending: false })
      .order('created_at', { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.status && filters.status !== 'ALL') query = query.eq('status', filters.status);
    if (filters.city) query = query.ilike('city', `%${filters.city}%`);
    if (filters.modality) query = query.contains('modalities', [filters.modality]);
    if (filters.source) query = query.eq('lead_source', filters.source);
    if (filters.assignedTo) query = query.eq('assigned_to', filters.assignedTo);
    if (filters.search) {
      query = query.or([
        `academy_name.ilike.%${filters.search}%`,
        `responsible_name.ilike.%${filters.search}%`,
        `email.ilike.%${filters.search}%`,
        `city.ilike.%${filters.search}%`,
      ].join(','));
    }

    const { data: leads, error, count } = await query;
    if (error) {
      return leadApiError('Internal server error', 500);
    }

    const normalizedLeads = (leads ?? []).filter(Boolean);
    const filteredByCategory = filters.scoreCategory
      ? normalizedLeads.filter((lead: any) => categorizeLeadScore(lead.score ?? 0) === filters.scoreCategory)
      : normalizedLeads;

    const summary = filteredByCategory.reduce((acc: any, lead: any) => {
      const category = categorizeLeadScore(lead.score ?? 0).toLowerCase();
      acc[category] += 1;
      if (lead.status === 'WON') acc.won += 1;
      acc.revenuePotential += Number(lead.proposed_price ?? lead.suggested_price ?? 0);
      return acc;
    }, { hot: 0, warm: 0, cold: 0, won: 0, revenuePotential: 0 });

    return leadApiSuccess({
      leads: filteredByCategory,
      count: filters.scoreCategory ? filteredByCategory.length : (count ?? filteredByCategory.length),
      limit: filters.limit,
      offset: filters.offset,
      summary,
    });
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const rawBody = await request.json();
    const parsed = createLeadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return leadApiError('Validation failed', 400, parsed.error.flatten());
    }

    const body = parsed.data;
    const insertPayload = {
      ...body,
      website: body.website || null,
      assigned_to: body.assigned_to ?? user.id,
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(insertPayload)
      .select('*')
      .single();

    if (error) {
      return leadApiError('Internal server error', 500);
    }

    const initialInteraction = interactionSchema.parse({
      lead_id: lead.id,
      type: 'note',
      content: 'Lead criado no sistema de captação.',
    });

    await supabase.from('lead_interactions').insert({
      ...initialInteraction,
      sent_by: user.id,
      created_by: user.id,
    });

    return leadApiSuccess({ lead }, 201);
  } catch (error) {
    return mapLeadError(error);
  }
}
