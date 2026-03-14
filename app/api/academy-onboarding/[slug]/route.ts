import { NextRequest } from 'next/server';
import { apiError, apiOk, apiServerError } from '@/lib/api/route-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

function formatLinkPayload(req: NextRequest, row: any) {
  const publicUrl = `${new URL(req.url).origin}/matricula/${row.slug}`;
  return {
    id: row.id,
    slug: row.slug,
    isActive: row.is_active,
    approvalMode: row.approval_mode,
    title: row.title,
    welcomeMessage: row.welcome_message,
    publicUrl,
    qrValue: publicUrl,
    lastRegeneratedAt: row.last_regenerated_at,
  };
}

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const admin = getSupabaseAdminClient();

    const { data, error } = await admin
      .from('academy_onboarding_links')
      .select('id, slug, is_active, approval_mode, title, welcome_message, last_regenerated_at, academies!inner(id, name, slug, address)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw error;
    if (!data || !data.is_active) {
      return apiError('Este link de cadastro não está disponível no momento.', 'NOT_FOUND', 404);
    }

    return apiOk({
      academy: {
        id: (data as any).academies.id,
        name: (data as any).academies.name,
        slug: (data as any).academies.slug,
        address: (data as any).academies.address,
      },
      link: formatLinkPayload(req, data),
    });
  } catch (err) {
    return apiServerError(err);
  }
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const body = await req.json();

    if (!body.fullName || !body.email || !body.password) {
      return apiError('Nome, e-mail e senha são obrigatórios.', 'VALIDATION', 400);
    }

    const admin = getSupabaseAdminClient();

    const { data: linkRow, error: linkError } = await admin
      .from('academy_onboarding_links')
      .select('id, academy_id, slug, is_active, approval_mode')
      .eq('slug', slug)
      .maybeSingle();

    if (linkError) throw linkError;
    if (!linkRow || !linkRow.is_active) {
      return apiError('Este link de cadastro não está disponível.', 'NOT_FOUND', 404);
    }

    let profileId: string | null = null;
    const email = String(body.email).toLowerCase().trim();
    const { data: existingInvite, error: existingInviteError } = await admin
      .from('academy_onboarding_requests')
      .select('id, desired_role, status')
      .eq('academy_id', linkRow.academy_id)
      .eq('email', email)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingInviteError) throw existingInviteError;
    const desiredRole = existingInvite?.desired_role === 'professor' ? 'professor' : 'student';

    const createUserResult = await admin.auth.admin.createUser({
      email,
      password: String(body.password),
      email_confirm: true,
      user_metadata: {
        full_name: String(body.fullName).trim(),
      },
    });

    if (createUserResult.error) {
      return apiError(
        createUserResult.error.message || 'Não foi possível criar a conta com esse e-mail.',
        'AUTH_CREATE_FAILED',
        400,
      );
    }

    profileId = createUserResult.data.user?.id ?? null;

    if (profileId) {
      const { error: profileError } = await admin.from('profiles').upsert({
        id: profileId,
        full_name: String(body.fullName).trim(),
        phone: body.phone ? String(body.phone).trim() : null,
      });
      if (profileError) throw profileError;
    }

    let approvedMembershipId: string | null = null;
    const requestStatus = linkRow.approval_mode === 'automatic' ? 'auto_approved' : 'pending';

    if (profileId && linkRow.approval_mode === 'automatic') {
      const { data: membershipRow, error: membershipError } = await admin
        .from('memberships')
        .insert({
          academy_id: linkRow.academy_id,
          profile_id: profileId,
          role: desiredRole,
          status: 'active',
        })
        .select('id')
        .single();

      if (membershipError) throw membershipError;
      approvedMembershipId = membershipRow.id;
    }

    const requestPayload = {
      academy_id: linkRow.academy_id,
      link_id: linkRow.id,
      profile_id: profileId,
      approved_membership_id: approvedMembershipId,
      email,
      full_name: String(body.fullName).trim(),
      phone: body.phone ? String(body.phone).trim() : null,
      desired_role: desiredRole,
      status: requestStatus,
      source: body.source === 'qr' ? 'qr' : 'public_link',
      updated_at: new Date().toISOString(),
    };

    const requestError = existingInvite?.id
      ? (await admin
        .from('academy_onboarding_requests')
        .update(requestPayload)
        .eq('id', existingInvite.id)).error
      : (await admin
        .from('academy_onboarding_requests')
        .insert(requestPayload)).error;

    if (requestError) throw requestError;

    return apiOk({
      status: requestStatus,
      nextStep: requestStatus === 'auto_approved' ? 'login' : 'wait_approval',
      message:
        requestStatus === 'auto_approved'
          ? 'Cadastro concluído. Faça login para entrar na sua academia.'
          : 'Cadastro enviado. A academia vai revisar seus dados antes de liberar o acesso.',
    });
  } catch (err) {
    return apiServerError(err);
  }
}
