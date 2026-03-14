import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withAuth, apiOk, apiServerError } from '@/lib/api/route-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { maskEmail } from '@/lib/security/sensitive-data';

const publicRequestSchema = z.object({
  email: z.email().max(320),
  reason: z.string().trim().max(500).optional(),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    try {
      const { supabase, user } = await withAuth(req);
      const { reason } = body;

      const { data, error } = await supabase
        .from('data_deletion_requests')
        .insert({
          profile_id: user.id,
          status: 'pending',
          reason: reason || null,
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'data_deletion_request',
        resource_type: 'profile',
        resource_id: user.id,
        new_value: {
          channel: 'authenticated',
          reason_provided: Boolean(reason?.trim()),
        },
      });

      return apiOk({
        requestId: data.id,
        status: 'pending',
        message: 'Solicitação de exclusão registrada. Seus dados serão removidos em até 15 dias úteis.',
      });
    } catch (authError) {
      if (!(authError instanceof Response)) {
        throw authError;
      }
    }

    const { email, reason } = publicRequestSchema.parse(body);
    const admin = getSupabaseAdminClient();
    const { data: usersResult, error: usersError } = await admin.auth.admin.listUsers();

    if (usersError) throw usersError;

    const matchedUser = usersResult.users.find((user: { email?: string | null }) =>
      user.email?.toLowerCase() === email.toLowerCase(),
    );

    if (!matchedUser?.id) {
      return apiOk({
        accepted: true,
        status: 'received',
        message: 'Se o e-mail existir, a solicitação será analisada pela equipe de privacidade.',
      }, 202);
    }

    const { data: existingRequest } = await admin
      .from('data_deletion_requests')
      .select('id, status')
      .eq('profile_id', matchedUser.id)
      .in('status', ['pending', 'approved'])
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!existingRequest) {
      const { error: insertError } = await admin
        .from('data_deletion_requests')
        .insert({
          profile_id: matchedUser.id,
          status: 'pending',
          reason: reason || 'Public deletion request',
        });

      if (insertError) throw insertError;
    }

    await admin.from('audit_log').insert({
      user_id: matchedUser.id,
      action: 'data_deletion_request_public',
      resource_type: 'profile',
      resource_id: matchedUser.id,
      new_value: {
        channel: 'public_page',
        email_masked: maskEmail(email),
        reason_provided: Boolean(reason?.trim()),
        existingRequest: Boolean(existingRequest),
      },
    });

    return apiOk({
      accepted: true,
      status: 'received',
      message: 'Solicitação recebida para revisão de privacidade.',
    }, 202);
  } catch (err) {
    if (err instanceof Response) return err;
    return apiServerError(err);
  }
}
