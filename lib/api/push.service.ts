/**
 * Push Notifications — Service
 *
 * Envio de notificações push via Firebase Cloud Messaging (FCM).
 * Em mock, exibe no console. Em produção, chama FCM via backend.
 *
 * TODO(BE-034): Implementar Firebase Admin SDK no backend
 * TODO(BE-035): Registrar service worker (public/sw.js) para receber push
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import { logger } from '@/lib/logger';

// ── Types ─────────────────────────────────────────────────

export interface PushNotification {
  titulo: string;
  corpo: string;
  icone?: string;
  dados?: Record<string, string>;
  destinatarios: string[]; // userIds
  topico?: string; // para broadcast (ex: 'all', 'turma_001')
}

export interface PushResult {
  enviados: number;
  falhas: number;
  messageId?: string;
}

export interface TokenRegistro {
  userId: string;
  fcmToken: string;
  platform: 'web' | 'android' | 'ios';
  registradoEm: string;
}

// ── Service Functions ─────────────────────────────────────

export async function enviarPush(notif: PushNotification): Promise<PushResult> {
  if (useMock()) {
    await mockDelay(300);
    logger.debug('[Push Mock]', notif.titulo, '→', notif.destinatarios.length, 'destinatários');
    return { enviados: notif.destinatarios.length, falhas: 0, messageId: `push_${Date.now().toString(36)}` };
  }
  const { data } = await apiClient.post<PushResult>('/push/enviar', notif); return data;
}

export async function enviarParaTopico(topico: string, titulo: string, corpo: string): Promise<PushResult> {
  if (useMock()) {
    await mockDelay(300);
    logger.debug('[Push Mock] Tópico:', topico, '→', titulo);
    return { enviados: 1, falhas: 0 };
  }
  const { data } = await apiClient.post<PushResult>('/push/topico', { topico, titulo, corpo }); return data;
}

export async function registrarToken(userId: string, fcmToken: string, platform: 'web' | 'android' | 'ios' = 'web'): Promise<void> {
  if (useMock()) {
    await mockDelay(100);
    logger.debug('[Push Mock] Token registrado:', userId, platform);
    return;
  }
  await apiClient.post('/push/tokens', { userId, fcmToken, platform });
}

export async function desregistrarToken(userId: string): Promise<void> {
  if (useMock()) { await mockDelay(100); return; }
  await apiClient.delete(`/push/tokens/${userId}`);
}

/**
 * Solicita permissão de notificação no navegador.
 * Retorna o token FCM se concedida, ou null se negada.
 *
 * TODO(BE-035): Implementar com Firebase SDK real
 */
export async function solicitarPermissao(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  // Em produção, aqui chamaríamos firebase.messaging().getToken()
  // Por enquanto, retorna token fake
  return `fcm_mock_${Date.now().toString(36)}`;
}
