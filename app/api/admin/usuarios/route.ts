import { NextRequest } from 'next/server';
import { createHandler, apiError, apiOk } from '@/lib/api/supabase-helpers';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { mapMembershipRoleToTipo, mapMembershipStatusToOperational } from '@/lib/academy/operations';

export const dynamic = 'force-dynamic';

function normalizeTipoFilter(input: string | null): string | null {
  if (!input || input === 'TODOS') return null;
  if (input === 'ALUNO') return 'student';
  if (input === 'INSTRUTOR') return 'professor';
  if (input === 'GESTOR') return 'admin';
  if (input === 'ADMINISTRADOR') return 'owner';
  return null;
}

function normalizeStatusFilter(input: string | null): string | null {
  if (!input || input === 'TODOS') return null;
  if (input === 'ATIVO') return 'active';
  if (input === 'INATIVO') return 'inactive';
  if (input === 'BLOQUEADO') return 'blocked';
  return null;
}

function mapMemberRow(row: any, emailByProfileId: Record<string, string>) {
  return {
    id: row.id,
    unidadeId: row.academy_id,
    nome: row.profiles?.full_name || 'Usuário sem nome',
    email: emailByProfileId[row.profile_id] || '',
    telefone: row.profiles?.phone || '',
    tipo: mapMembershipRoleToTipo(row.role),
    perfis: [mapMembershipRoleToTipo(row.role)],
    perfilAtivo: mapMembershipRoleToTipo(row.role),
    status: mapMembershipStatusToOperational(row.status),
    categoria: row.role === 'student' ? 'ADULTO' : undefined,
    graduacao: row.belt_rank || undefined,
    dataCadastro: row.joined_at || row.created_at,
    avatar: row.profiles?.avatar_url || undefined,
    observacoes: row.notes || undefined,
  };
}

async function listAuthEmailsByProfileId(
  admin: ReturnType<typeof getSupabaseAdminClient>,
  profileIds: string[],
): Promise<Record<string, string>> {
  const emailByProfileId: Record<string, string> = {};
  const remainingIds = new Set(profileIds);
  let page = 1;
  const perPage = 1000;

  while (remainingIds.size > 0) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users || [];
    if (users.length === 0) break;

    for (const authUser of users) {
      if (remainingIds.has(authUser.id)) {
        emailByProfileId[authUser.id] = authUser.email || '';
        remainingIds.delete(authUser.id);
      }
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return emailByProfileId;
}

export const GET = createHandler(async (req: NextRequest, { supabase, membership }) => {
  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return apiError('Sem permissão para gerenciar usuários.', 'FORBIDDEN', 403);
  }

  const url = new URL(req.url);
  const roleFilter = normalizeTipoFilter(url.searchParams.get('tipo'));
  const statusFilter = normalizeStatusFilter(url.searchParams.get('status'));
  const search = url.searchParams.get('search')?.trim().toLowerCase() || '';

  let query = supabase
    .from('memberships')
    .select('id, academy_id, profile_id, role, status, belt_rank, notes, joined_at, created_at, profiles!inner(full_name, phone, avatar_url)')
    .eq('academy_id', membership.academy_id)
    .order('created_at', { ascending: false });

  if (roleFilter) query = query.eq('role', roleFilter);
  if (statusFilter) query = query.eq('status', statusFilter);

  const { data, error } = await query;
  if (error) throw error;

  const admin = getSupabaseAdminClient();
  const profileIds: string[] = Array.from(
    new Set(
      (data || [])
        .map((row: any) => row.profile_id)
        .filter((value: unknown): value is string => typeof value === 'string' && value.length > 0)
    )
  );
  const emailByProfileId = profileIds.length > 0
    ? await listAuthEmailsByProfileId(admin, profileIds)
    : {};

  const normalized = (data || [])
    .map((row: any) => mapMemberRow(row, emailByProfileId))
    .filter((row: any) => {
      if (!search) return true;
      return (
        row.nome.toLowerCase().includes(search) ||
        row.email.toLowerCase().includes(search) ||
        row.telefone.toLowerCase().includes(search)
      );
    });

  return apiOk(normalized);
});
