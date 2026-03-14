import type { Video as ManagedVideo } from '@/lib/__mocks__/content.mock';

const SLUG_SAFE = /[^a-z0-9-]/g;

export type AcademyRole = 'student' | 'professor' | 'admin' | 'owner';
export type OnboardingApprovalMode = 'automatic' | 'manual';
export type OnboardingRequestStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export function slugifyAcademyName(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(SLUG_SAFE, '');

  return normalized || 'academia';
}

export function makeOnboardingSlug(academyName: string, seed?: string): string {
  const base = slugifyAcademyName(academyName);
  if (!seed) return `${base}-cadastro`;
  return `${base}-${seed.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6)}`;
}

export function mapMembershipRoleToTipo(role: string): 'ALUNO' | 'INSTRUTOR' | 'GESTOR' | 'ADMINISTRADOR' {
  if (role === 'professor') return 'INSTRUTOR';
  if (role === 'owner') return 'ADMINISTRADOR';
  if (role === 'admin') return 'GESTOR';
  return 'ALUNO';
}

export function mapMembershipStatusToOperational(
  status: string,
): 'ATIVO' | 'INATIVO' | 'BLOQUEADO' {
  if (status === 'inactive') return 'INATIVO';
  if (status === 'blocked') return 'BLOQUEADO';
  return 'ATIVO';
}

export function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match?.[1] ?? null;
}

export function secondsToDuration(seconds: number | null | undefined): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function mapContentRowToManagedVideo(row: any): ManagedVideo {
  const youtubeId = extractYoutubeId(row.url || '') || 'dQw4w9WgXcQ';
  return {
    id: row.id,
    unidadeId: row.academy_id,
    title: row.title || 'Vídeo sem título',
    description: row.description || '',
    duration: secondsToDuration(row.duration_secs),
    category: row.martial_art || 'Biblioteca',
    level: mapVisibilityToLevel(row.visibility),
    youtubeId,
    thumbnail: row.thumbnail_url || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    views: 0,
    instructor: row.profiles?.full_name || row.created_by || 'Equipe BlackBelt',
    criadoPor: row.created_by || undefined,
    turmasAssociadas: Array.isArray(row.metadata?.turmasAssociadas) ? row.metadata.turmasAssociadas : [],
    tags: Array.isArray(row.tags) ? row.tags : [],
    criadoEm: row.created_at || undefined,
  };
}

function mapVisibilityToLevel(visibility: string | null | undefined): ManagedVideo['level'] {
  if (visibility === 'academy') return 'Intermediário';
  if (visibility === 'private') return 'Avançado';
  return 'Iniciante';
}
