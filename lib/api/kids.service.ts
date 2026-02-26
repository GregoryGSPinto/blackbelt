/**
 * Kids & Teens Service — Perfis, desafios, conquistas, mascotes
 *
 * MOCK:  useMock() === true → dados de __mocks__/kids.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-012): Implementar endpoints kids
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

import type {
  KidProfile, TeenProfile, ParentProfile,
  KidsMascot, KidsChallenge, KidsMedal, KidsCheckin,
} from '@/lib/__mocks__/kids.mock';

export type {
  KidProfile, TeenProfile, ParentProfile,
  KidsMascot, KidsChallenge, KidsMedal, KidsCheckin,
};

async function getMock() {
  return import('@/lib/__mocks__/kids.mock');
}

export async function getKidsProfiles(parentId?: string): Promise<KidProfile[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (parentId) return m.getKidsByParent(parentId);
    return [...m.KIDS_PROFILES];
  }
  const url = parentId ? `/kids/profiles?parentId=${parentId}` : '/kids/profiles';
  const { data } = await apiClient.get<KidProfile[]>(url);
  return data;
}

export async function getTeenProfiles(parentId?: string): Promise<TeenProfile[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (parentId) return m.getTeensByParent(parentId);
    return [...m.TEEN_PROFILES];
  }
  const url = parentId ? `/kids/teens?parentId=${parentId}` : '/kids/teens';
  const { data } = await apiClient.get<TeenProfile[]>(url);
  return data;
}

export async function getParentProfiles(): Promise<ParentProfile[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.PARENT_PROFILES]; }
  const { data } = await apiClient.get<ParentProfile[]>('/kids/parents');
  return data;
}

export async function getChallenges(): Promise<KidsChallenge[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.KIDS_CHALLENGES]; }
  const { data } = await apiClient.get<KidsChallenge[]>('/kids/challenges');
  return data;
}

export async function getMedals(): Promise<KidsMedal[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.KIDS_MEDALS]; }
  const { data } = await apiClient.get<KidsMedal[]>('/kids/medals');
  return data;
}

export async function getMascots(): Promise<KidsMascot[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return [...m.MASCOTES]; }
  const { data } = await apiClient.get<KidsMascot[]>('/kids/mascots');
  return data;
}

export async function getKidsCheckins(kidId?: string): Promise<KidsCheckin[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (kidId) return m.KIDS_CHECKINS.filter(c => c.kidId === kidId);
    return [...m.KIDS_CHECKINS];
  }
  const url = kidId ? `/kids/checkins?kidId=${kidId}` : '/kids/checkins';
  const { data } = await apiClient.get<KidsCheckin[]>(url);
  return data;
}

/** Retorna o perfil kid do usuário autenticado pelo userId */
export async function getKidProfileByUserId(userId: string): Promise<KidProfile | null> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getKidByUserId(userId) ?? null;
  }
  // TODO(BE-012): GET /kids/profile/me (backend resolve pelo token JWT)
  const { data } = await apiClient.get<KidProfile>(`/kids/profile?userId=${userId}`);
  return data;
}

// ── Synchronous helpers (re-export from mock for dev convenience) ──

// TODO(BE-010): Migrar helpers síncronos para endpoints async quando backend estiver pronto
export {
  getKidsByParent, getTeensByParent,
  getKidsParent, getTeensParent,
  getMascotByName, getRandomTip,
  getKidByUserId,
  MASCOTES, TEEN_PROFILES, PARENT_PROFILES, KIDS_PROFILES,
  TORA_TIPS,
} from '@/lib/__mocks__/kids.mock';
