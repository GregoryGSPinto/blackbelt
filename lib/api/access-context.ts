import { apiForbidden, withAuth, type AuthContext } from '@/lib/api/route-helpers';

const BILLING_MANAGER_ROLES = ['owner', 'admin'] as const;

type BillingManagerRole = (typeof BILLING_MANAGER_ROLES)[number];
type MembershipContext = NonNullable<AuthContext['membership']>;

export async function withBillingManagerAccess(
  req?: Request,
  allowedRoles: readonly BillingManagerRole[] = BILLING_MANAGER_ROLES,
): Promise<AuthContext & { membership: MembershipContext }> {
  const auth = await withAuth(req);
  const membership = auth.membership;

  if (!membership || !allowedRoles.includes(membership.role as BillingManagerRole)) {
    throw apiForbidden('Acesso restrito a administradores da academia');
  }

  return {
    ...auth,
    membership,
  };
}

export async function withSuperAdminAccess(
  req?: Request,
): Promise<AuthContext & { membership: MembershipContext }> {
  const auth = await withAuth(req, { requireMembership: false });

  const { data: membership, error } = await auth.supabase
    .from('memberships')
    .select('id, academy_id, role')
    .eq('profile_id', auth.user.id)
    .eq('status', 'active')
    .eq('role', 'super_admin')
    .maybeSingle();

  if (error || !membership) {
    throw apiForbidden('Acesso restrito a super-admins');
  }

  return {
    ...auth,
    membership,
  };
}
