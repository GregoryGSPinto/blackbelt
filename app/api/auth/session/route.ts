import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@/lib/api/contracts';
import { getSupabaseServerClientSafe } from '@/lib/supabase/server';
import { hasRequiredSupabaseEnv } from '@/src/config/env';
import type { AuthSessionData, AuthSessionResponse } from '@/features/auth/session-contract';
import { resolveMembershipSelection } from '@/lib/api/route-helpers';

const COOKIE_NAME = 'blackbelt_session';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

export const dynamic = 'force-dynamic';

function mapSupabaseRoleToTipoPerfil(role: string): User['tipo'] {
  const map: Record<string, User['tipo']> = {
    student: 'ALUNO_ADULTO',
    professor: 'INSTRUTOR',
    admin: 'ADMINISTRADOR',
    owner: 'UNIT_OWNER',
    parent: 'RESPONSAVEL',
    super_admin: 'SUPER_ADMIN',
  };

  return map[role] || 'ALUNO_ADULTO';
}

function buildUserFromSupabase(
  authUser: { id: string; email?: string | null },
  profile: { full_name?: string | null; avatar_url?: string | null } | null,
  membership: { role: string; academy_id: string; belt_rank?: string | null } | null,
): User {
  const tipo = membership ? mapSupabaseRoleToTipoPerfil(membership.role) : 'ALUNO_ADULTO';

  return {
    id: authUser.id,
    nome: profile?.full_name || authUser.email || '',
    email: authUser.email || '',
    tipo,
    avatar: profile?.avatar_url || undefined,
    unidadeId: membership?.academy_id,
    graduacao: membership?.belt_rank || undefined,
    permissoes: [],
  };
}

function isSessionData(value: unknown): value is AuthSessionData {
  if (!value || typeof value !== 'object') return false;

  const session = value as Partial<AuthSessionData>;
  return Boolean(
    session.user &&
    typeof session.user === 'object' &&
    typeof session.user.id === 'string' &&
    typeof session.user.email === 'string' &&
    Array.isArray(session.profiles),
  );
}

async function readMockSession(): Promise<AuthSessionResponse> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;

  if (!raw) {
    return { session: null };
  }

  try {
    const parsed = JSON.parse(raw);
    return { session: isSessionData(parsed) ? parsed : null };
  } catch {
    return { session: null };
  }
}

export async function GET(request: Request) {
  if (!hasRequiredSupabaseEnv()) {
    return NextResponse.json(await readMockSession(), { status: 200 });
  }

  try {
    const supabase = await getSupabaseServerClientSafe();
    if (!supabase) {
      return NextResponse.json(
        {
          session: null,
          error: 'Authentication unavailable',
          code: 'AUTH_UNAVAILABLE',
        } satisfies AuthSessionResponse,
        { status: 503 },
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ session: null } satisfies AuthSessionResponse, { status: 200 });
    }

    const [{ data: profile }, { data: memberships }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle(),
      supabase
        .from('memberships')
        .select('id, academy_id, role, status, belt_rank')
        .eq('profile_id', user.id)
        .eq('status', 'active'),
    ]);

    const { membership: primaryMembership, ambiguousCrossTenant } = resolveMembershipSelection(memberships || [], request);
    const fallbackUser = buildUserFromSupabase(user, profile, primaryMembership);
    const session: AuthSessionData = {
      mode: 'supabase',
      user: fallbackUser,
      profiles: memberships && memberships.length > 0
        ? memberships.map((item: any) => buildUserFromSupabase(user, profile, item))
        : [fallbackUser],
      loginEmail: user.email ?? '',
    };

    if (ambiguousCrossTenant) {
      session.user = buildUserFromSupabase(user, profile, null);
    }

    return NextResponse.json({ session } satisfies AuthSessionResponse, { status: 200 });
  } catch {
    return NextResponse.json({ session: null } satisfies AuthSessionResponse, { status: 200 });
  }
}

export async function POST(request: Request) {
  if (hasRequiredSupabaseEnv()) {
    return NextResponse.json(
      {
        session: null,
        error: 'Session cookies are managed by Supabase server auth. Client-provided session payloads are not accepted.',
        code: 'METHOD_NOT_ALLOWED',
      } satisfies AuthSessionResponse,
      { status: 405 },
    );
  }

  try {
    const body = await request.json();
    const session = body?.session;

    if (!isSessionData(session)) {
      return NextResponse.json(
        { session: null, error: 'Invalid session payload', code: 'VALIDATION_ERROR' } satisfies AuthSessionResponse,
        { status: 400 },
      );
    }

    const response = NextResponse.json({ session } satisfies AuthSessionResponse, { status: 200 });
    response.cookies.set(COOKIE_NAME, JSON.stringify(session), COOKIE_OPTIONS);
    response.cookies.delete('blackbelt_refresh');
    return response;
  } catch {
    return NextResponse.json(
      { session: null, error: 'Invalid session payload', code: 'VALIDATION_ERROR' } satisfies AuthSessionResponse,
      { status: 400 },
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await getSupabaseServerClientSafe();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch {
    // Best effort; local mock cookies are still cleared below.
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
  response.cookies.set('blackbelt_refresh', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
