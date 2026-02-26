/**
 * Leads Service — Funil de Vendas
 *
 * MOCK:  useMock() === true → __mocks__/leads.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-063): Implementar endpoints leads
 *   GET    /leads
 *   POST   /leads
 *   PATCH  /leads/:id
 *   PATCH  /leads/:id/etapa
 *   GET    /leads/stats
 *   DELETE /leads/:id
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Lead, LeadEtapa, FunnelStats } from '@/lib/api/contracts';

export type { Lead, LeadEtapa, FunnelStats };

async function getMock() {
  return import('@/lib/__mocks__/leads.mock');
}

export async function getLeads(): Promise<Lead[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return [...m.LEADS];
  }
  const { data } = await apiClient.get<Lead[]>('/leads');
  return data;
}

export async function createLead(lead: Omit<Lead, 'id' | 'dataCriacao'>): Promise<Lead> {
  if (useMock()) {
    await mockDelay(300);
    const newLead: Lead = {
      ...lead,
      id: `ld_${Date.now()}`,
      dataCriacao: new Date().toISOString().split('T')[0],
    };
    return newLead;
  }
  const { data } = await apiClient.post<Lead>('/leads', lead);
  return data;
}

export async function updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    const lead = m.LEADS.find((l: Lead) => l.id === id);
    if (!lead) throw new Error('Lead not found');
    return { ...lead, ...updates };
  }
  const { data } = await apiClient.patch<Lead>(`/leads/${id}`, updates);
  return data;
}

export async function moverEtapa(leadId: string, novaEtapa: LeadEtapa): Promise<Lead> {
  if (useMock()) {
    await mockDelay(200);
    const m = await getMock();
    const result = m.moverEtapa(leadId, novaEtapa);
    if (!result) throw new Error('Lead not found');
    return result;
  }
  const { data } = await apiClient.patch<Lead>(`/leads/${leadId}/etapa`, { etapa: novaEtapa });
  return data;
}

export async function getStats(): Promise<FunnelStats> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return m.getStats();
  }
  const { data } = await apiClient.get<FunnelStats>('/leads/stats');
  return data;
}

export async function deleteLead(id: string): Promise<void> {
  if (useMock()) {
    await mockDelay(200);
    return;
  }
  await apiClient.delete(`/leads/${id}`);
}
