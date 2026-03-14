import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';
import { makeOnboardingSlug } from '@/lib/academy/operations';

export const dynamic = 'force-dynamic';

function assertAdminRole(role?: string | null) {
  if (!role || !['owner', 'admin'].includes(role)) {
    throw apiError('Sem permissão para gerenciar onboarding da academia.', 'FORBIDDEN', 403);
  }
}

async function ensureLinkForAcademy(supabase: any, academy: any, createdBy: string, suffix?: string) {
  const { data: existing } = await supabase
    .from('academy_onboarding_links')
    .select('*')
    .eq('academy_id', academy.id)
    .maybeSingle();

  if (existing) return existing;

  const slug = makeOnboardingSlug(academy.name, suffix || academy.id);
  const { data, error } = await supabase
    .from('academy_onboarding_links')
    .insert({
      academy_id: academy.id,
      slug,
      created_by: createdBy,
      title: `Cadastro ${academy.name}`,
      welcome_message: `Entre para ${academy.name} pelo link oficial da academia.`,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

function buildPublicUrl(req: NextRequest, slug: string) {
  const origin = new URL(req.url).origin;
  return `${origin}/matricula/${slug}`;
}

export const GET = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertAdminRole(membership?.role);

  const { data: academy, error: academyError } = await supabase
    .from('academies')
    .select('id, name, slug, phone, address')
    .eq('id', membership!.academy_id)
    .single();

  if (academyError) throw academyError;

  const link = await ensureLinkForAcademy(supabase, academy, user.id, academy.id);

  const { data: requests, error: requestError } = await supabase
    .from('academy_onboarding_requests')
    .select('id, full_name, email, phone, desired_role, status, source, requested_at, reviewed_at')
    .eq('academy_id', membership!.academy_id)
    .order('requested_at', { ascending: false })
    .limit(12);

  if (requestError) throw requestError;

  const rows: any[] = requests || [];
  const stats = {
    pendingStudents: rows.filter((item: any) => item.status === 'pending' && item.desired_role === 'student').length,
    pendingProfessors: rows.filter((item: any) => item.status === 'pending' && item.desired_role === 'professor').length,
    approvedThisWeek: rows.filter((item: any) => ['approved', 'auto_approved'].includes(item.status)).length,
  };

  return apiOk({
    academy,
    link: {
      id: link.id,
      slug: link.slug,
      isActive: link.is_active,
      approvalMode: link.approval_mode,
      title: link.title,
      welcomeMessage: link.welcome_message,
      publicUrl: buildPublicUrl(req, link.slug),
      qrValue: buildPublicUrl(req, link.slug),
      lastRegeneratedAt: link.last_regenerated_at,
    },
    requests: rows.map((item: any) => ({
      id: item.id,
      fullName: item.full_name,
      email: item.email,
      phone: item.phone,
      desiredRole: item.desired_role,
      status: item.status,
      source: item.source,
      requestedAt: item.requested_at,
      reviewedAt: item.reviewed_at,
    })),
    stats,
  });
});

export const PUT = createHandler(async (req: NextRequest, { supabase, membership, user }) => {
  assertAdminRole(membership?.role);

  const body = await req.json();

  const { data: academy, error: academyError } = await supabase
    .from('academies')
    .select('id, name')
    .eq('id', membership!.academy_id)
    .single();

  if (academyError) throw academyError;

  const current = await ensureLinkForAcademy(supabase, academy, user.id, academy.id);
  const nextSlug = body.regenerate
    ? makeOnboardingSlug(academy.name, `${Date.now().toString(36)}${academy.id.slice(0, 2)}`)
    : current.slug;

  const { data, error } = await supabase
    .from('academy_onboarding_links')
    .update({
      slug: nextSlug,
      is_active: typeof body.isActive === 'boolean' ? body.isActive : current.is_active,
      approval_mode: body.approvalMode || current.approval_mode,
      title: typeof body.title === 'string' ? body.title : current.title,
      welcome_message: typeof body.welcomeMessage === 'string' ? body.welcomeMessage : current.welcome_message,
      last_regenerated_at: body.regenerate ? new Date().toISOString() : current.last_regenerated_at,
      updated_at: new Date().toISOString(),
    })
    .eq('id', current.id)
    .select('*')
    .single();

  if (error) throw error;

  return apiOk({
    id: data.id,
    slug: data.slug,
    isActive: data.is_active,
    approvalMode: data.approval_mode,
    title: data.title,
    welcomeMessage: data.welcome_message,
    publicUrl: buildPublicUrl(req, data.slug),
    qrValue: buildPublicUrl(req, data.slug),
    lastRegeneratedAt: data.last_regenerated_at,
  });
});
