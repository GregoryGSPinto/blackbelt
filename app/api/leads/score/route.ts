import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { calculateLeadScore } from '@/lib/leads/scoring';
import { requireSuperAdmin } from '@/lib/leads/server';
import { scorePreviewSchema } from '@/lib/leads/validation';

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const rawBody = await request.json();
    const parsed = scorePreviewSchema.safeParse(rawBody);
    if (!parsed.success) {
      return leadApiError('Validation failed', 400, parsed.error.flatten());
    }

    const body = parsed.data;
    const result = calculateLeadScore(body);

    return leadApiSuccess(result);
  } catch (error) {
    return mapLeadError(error);
  }
}
