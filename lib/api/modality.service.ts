/**
 * Modality Service — client-side FAIL-SAFE
 *
 * Returns mock data if API is not implemented (501) or any error occurs.
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';

export interface AcademyModality {
  id: string;
  academy_id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  belt_system_id: string | null;
  enrollment_mode: 'direct' | 'approval_required';
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MemberModality {
  id: string;
  membership_id: string;
  modality_id: string;
  belt_rank: string;
  stripes: number;
  status: 'active' | 'inactive' | 'pending' | 'graduated' | 'transferred';
  started_at: string;
  academy_modalities?: AcademyModality;
}

export interface ModalityStats extends AcademyModality {
  totalMembers: number;
  totalClasses: number;
  beltDistribution: Record<string, number>;
}

const MOCK_MODALITIES: AcademyModality[] = [
  { id: 'mod-1', academy_id: '', name: 'Jiu-Jitsu Brasileiro', slug: 'jiu-jitsu-brasileiro', description: 'Arte marcial de solo', icon: '🥋', belt_system_id: null, enrollment_mode: 'direct', is_active: true, display_order: 0, created_at: '', updated_at: '' },
  { id: 'mod-2', academy_id: '', name: 'Muay Thai', slug: 'muay-thai', description: 'Boxe tailandês', icon: '🥊', belt_system_id: null, enrollment_mode: 'direct', is_active: true, display_order: 1, created_at: '', updated_at: '' },
  { id: 'mod-3', academy_id: '', name: 'Judô', slug: 'judo', description: 'Arte marcial olímpica', icon: '🏅', belt_system_id: null, enrollment_mode: 'direct', is_active: true, display_order: 2, created_at: '', updated_at: '' },
];

async function withFallback<T>(operation: () => Promise<T>, fallback: T, endpoint: string): Promise<T> {
  if (useMock()) {
    await mockDelay();
    return fallback;
  }
  try {
    return await operation();
  } catch (err) {
    logger.warn(`[ModalityService] ${endpoint} falhou, usando fallback`);
    await mockDelay(200);
    return fallback;
  }
}

export async function getAcademyModalities(): Promise<AcademyModality[]> {
  return withFallback(
    () => apiClient.get<AcademyModality[]>('/admin/modalities').then(r => r.data),
    [...MOCK_MODALITIES],
    '/admin/modalities',
  );
}

export async function createModality(data: { name: string; description?: string; icon?: string; enrollment_mode?: string }): Promise<AcademyModality> {
  return withFallback(
    () => apiClient.post<AcademyModality>('/admin/modalities', data).then(r => r.data),
    { ...MOCK_MODALITIES[0], name: data.name },
    '/admin/modalities POST',
  );
}

export async function updateModality(id: string, data: Partial<AcademyModality>): Promise<AcademyModality> {
  return withFallback(
    () => apiClient.put<AcademyModality>(`/admin/modalities/${id}`, data).then(r => r.data),
    { ...MOCK_MODALITIES[0], ...data } as AcademyModality,
    `/admin/modalities/${id} PUT`,
  );
}

export async function deactivateModality(id: string): Promise<AcademyModality> {
  return withFallback(
    () => apiClient.delete<AcademyModality>(`/admin/modalities/${id}`).then(r => r.data),
    { ...MOCK_MODALITIES[0], is_active: false },
    `/admin/modalities/${id} DELETE`,
  );
}

export async function getModalityMembers(modalityId: string): Promise<any[]> {
  return withFallback(
    () => apiClient.get<any[]>(`/admin/modalities/${modalityId}/members`).then(r => r.data),
    [],
    `/admin/modalities/${modalityId}/members`,
  );
}

export async function getMemberModalities(memberId: string): Promise<MemberModality[]> {
  return withFallback(
    () => apiClient.get<MemberModality[]>(`/admin/members/${memberId}/modalities`).then(r => r.data),
    [],
    `/admin/members/${memberId}/modalities`,
  );
}

export async function enrollMember(memberId: string, modalityId: string): Promise<any> {
  return withFallback(
    () => apiClient.post(`/admin/members/${memberId}/modalities`, { modality_id: modalityId }).then(r => r.data),
    { id: 'temp', status: 'active' },
    `/admin/members/${memberId}/modalities POST`,
  );
}

export async function updateMemberBelt(memberId: string, modalityId: string, belt_rank: string, stripes: number): Promise<any> {
  return withFallback(
    () => apiClient.put(`/admin/members/${memberId}/modalities/${modalityId}/belt`, { belt_rank, stripes }).then(r => r.data),
    { belt_rank, stripes },
    `/admin/members/${memberId}/modalities/${modalityId}/belt PUT`,
  );
}

export async function getMyModalities(): Promise<MemberModality[]> {
  return withFallback(
    () => apiClient.get<MemberModality[]>('/student/modalities').then(r => r.data),
    [],
    '/student/modalities',
  );
}

export async function getAvailableModalities(): Promise<AcademyModality[]> {
  return withFallback(
    () => apiClient.get<AcademyModality[]>('/student/modalities?view=available').then(r => r.data),
    [...MOCK_MODALITIES],
    '/student/modalities?view=available',
  );
}

export async function requestEnrollment(modalityId: string): Promise<any> {
  return withFallback(
    () => apiClient.post('/student/modalities', { modality_id: modalityId }).then(r => r.data),
    { id: 'temp', status: 'pending' },
    '/student/modalities POST',
  );
}

export async function getChildrenModalities(): Promise<any[]> {
  return withFallback(
    () => apiClient.get<any[]>('/parent/children/modalities').then(r => r.data),
    [],
    '/parent/children/modalities',
  );
}
