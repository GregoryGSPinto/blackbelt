import { NextRequest } from 'next/server';
import { withAuth, apiOk, apiError, apiServerError } from '@/lib/api/route-helpers';

export async function POST(req: NextRequest) {
  try {
    const { supabase, user } = await withAuth(req);
    const body = await req.json();
    const { reason } = body;

    // Create deletion request
    const { data, error } = await supabase
      .from('data_deletion_requests' as any)
      .insert({
        profile_id: user.id,
        status: 'pending',
        reason: reason || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit
    await supabase.from('audit_log' as any).insert({
      user_id: user.id,
      action: 'data_deletion_request',
      resource_type: 'profile',
      resource_id: user.id,
      new_value: { reason: reason || 'Solicitação do usuário' },
    });

    // Note: actual deletion is processed by an admin/background job
    // to comply with LGPD's right to be forgotten while allowing
    // a grace period for accidental requests.

    return apiOk({
      requestId: data.id,
      status: 'pending',
      message: 'Solicitação de exclusão registrada. Seus dados serão removidos em até 15 dias úteis.',
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
