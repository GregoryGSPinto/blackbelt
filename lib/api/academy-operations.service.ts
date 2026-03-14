import { apiClient } from './client';

export interface AcademyOnboardingLink {
  id: string;
  slug: string;
  isActive: boolean;
  approvalMode: 'automatic' | 'manual';
  title: string | null;
  welcomeMessage: string | null;
  publicUrl: string;
  qrValue: string;
  lastRegeneratedAt: string;
}

export interface AcademyOnboardingRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  desiredRole: 'student' | 'professor';
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  source: 'public_link' | 'qr' | 'manual_admin' | 'staff_invite';
  requestedAt: string;
  reviewedAt: string | null;
}

export interface AcademyOnboardingOverview {
  academy: {
    id: string;
    name: string;
    slug: string | null;
    phone: string | null;
    address: string | null;
  };
  link: AcademyOnboardingLink;
  requests: AcademyOnboardingRequest[];
  stats: {
    pendingStudents: number;
    pendingProfessors: number;
    approvedThisWeek: number;
  };
}

export interface TeamMember {
  id: string;
  profileId: string;
  fullName: string;
  phone: string | null;
  role: 'professor' | 'admin' | 'owner';
  status: string;
  joinedAt: string | null;
}

export interface TeamInvite {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  desiredRole: 'professor';
  status: 'pending' | 'approved' | 'rejected' | 'auto_approved';
  requestedAt: string;
}

export interface TeamOverview {
  academy: {
    id: string;
    name: string;
  };
  members: TeamMember[];
  invites: TeamInvite[];
}

export async function getAcademyOnboardingOverview(): Promise<AcademyOnboardingOverview> {
  const { data } = await apiClient.get<AcademyOnboardingOverview>('/admin/academy-onboarding');
  return data;
}

export async function updateAcademyOnboardingLink(payload: {
  isActive?: boolean;
  approvalMode?: 'automatic' | 'manual';
  welcomeMessage?: string;
  title?: string;
  regenerate?: boolean;
}): Promise<AcademyOnboardingLink> {
  const { data } = await apiClient.put<AcademyOnboardingLink>('/admin/academy-onboarding', payload);
  return data;
}

export async function moderateOnboardingRequest(payload: {
  requestId: string;
  action: 'approve' | 'reject';
  notes?: string;
}): Promise<{ ok: true }> {
  const { data } = await apiClient.post<{ ok: true }>('/admin/academy-onboarding/requests', payload);
  return data;
}

export async function getTeamOverview(): Promise<TeamOverview> {
  const { data } = await apiClient.get<TeamOverview>('/admin/equipe');
  return data;
}

export async function inviteProfessor(payload: {
  fullName: string;
  email: string;
  phone?: string;
}): Promise<TeamInvite> {
  const { data } = await apiClient.post<TeamInvite>('/admin/equipe', payload);
  return data;
}

export async function updateTeamMemberStatus(payload: {
  membershipId: string;
  status: 'active' | 'inactive';
}): Promise<TeamMember> {
  const { data } = await apiClient.put<TeamMember>('/admin/equipe', payload);
  return data;
}

export async function getPublicAcademyEnrollment(slug: string) {
  const response = await fetch(`/api/academy-onboarding/${slug}`, { cache: 'no-store' });
  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || 'Não foi possível carregar a academia.');
  }
  return json.data as {
    academy: { id: string; name: string; slug: string | null; address: string | null };
    link: AcademyOnboardingLink;
  };
}

export async function submitPublicAcademyEnrollment(
  slug: string,
  payload: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    source?: 'public_link' | 'qr';
  },
) {
  const response = await fetch(`/api/academy-onboarding/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error?.message || 'Não foi possível concluir o cadastro.');
  }

  return json.data as {
    status: 'pending' | 'auto_approved';
    message: string;
    nextStep: 'wait_approval' | 'login';
  };
}
