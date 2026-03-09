/**
 * Push Notification Service
 *
 * Manages push tokens and sends notifications via:
 * - FCM (Firebase Cloud Messaging) for Android
 * - APNs (Apple Push Notification service) for iOS
 * - Web Push API for browsers
 *
 * In mock mode, logs notifications to console.
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export type PushPlatform = 'ios' | 'android' | 'web';

export interface PushToken {
  userId: string;
  token: string;
  platform: PushPlatform;
  deviceName?: string;
}

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

// ============================================================
// CLIENT
// ============================================================

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ============================================================
// TOKEN MANAGEMENT
// ============================================================

/**
 * Register a push notification token for a user.
 * Upserts: if token already exists, updates device info.
 */
export async function registerToken(pushToken: PushToken): Promise<boolean> {
  const client = getClient();
  if (!client) {
    console.warn('[PushService] No Supabase client — skipping token registration');
    return false;
  }

  const { error } = await client
    .from('push_tokens')
    .upsert(
      {
        user_id: pushToken.userId,
        token: pushToken.token,
        platform: pushToken.platform,
        device_name: pushToken.deviceName,
        active: true,
      },
      { onConflict: 'user_id,token' }
    );

  if (error) {
    console.error('[PushService] Failed to register token:', error.message);
    return false;
  }

  return true;
}

/**
 * Remove a push token (e.g., on logout or token invalidation).
 */
export async function removeToken(userId: string, token: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  await client
    .from('push_tokens')
    .update({ active: false })
    .eq('user_id', userId)
    .eq('token', token);
}

/**
 * Get all active tokens for a user.
 */
async function getUserTokens(userId: string): Promise<Array<{ token: string; platform: PushPlatform }>> {
  const client = getClient();
  if (!client) return [];

  const { data } = await client
    .from('push_tokens')
    .select('token, platform')
    .eq('user_id', userId)
    .eq('active', true);

  return (data || []) as Array<{ token: string; platform: PushPlatform }>;
}

/**
 * Get all active tokens for users in an academy.
 */
async function getAcademyTokens(academyId: string): Promise<Array<{ user_id: string; token: string; platform: PushPlatform }>> {
  const client = getClient();
  if (!client) return [];

  const { data } = await client
    .from('push_tokens')
    .select(`
      token,
      platform,
      user_id,
      profiles!inner(academy_id)
    `)
    .eq('profiles.academy_id', academyId)
    .eq('active', true);

  return (data || []) as Array<{ user_id: string; token: string; platform: PushPlatform }>;
}

// ============================================================
// SEND NOTIFICATIONS
// ============================================================

/**
 * Send a push notification to a specific user (all their devices).
 */
export async function sendToUser(userId: string, payload: PushPayload): Promise<number> {
  const tokens = await getUserTokens(userId);
  if (tokens.length === 0) return 0;

  let sent = 0;
  for (const { token, platform } of tokens) {
    const success = await sendPush(token, platform, payload);
    if (success) sent++;
  }

  return sent;
}

/**
 * Send a push notification to all users in an academy.
 */
export async function sendToAcademy(academyId: string, payload: PushPayload): Promise<number> {
  const tokens = await getAcademyTokens(academyId);
  if (tokens.length === 0) return 0;

  let sent = 0;
  for (const { token, platform } of tokens) {
    const success = await sendPush(token, platform, payload);
    if (success) sent++;
  }

  return sent;
}

/**
 * Internal: send a push notification to a single device.
 * In production, this would call FCM/APNs.
 * Currently logs the notification (no FCM/APNs keys configured yet).
 */
async function sendPush(token: string, platform: PushPlatform, payload: PushPayload): Promise<boolean> {
  // TODO: Integrate with FCM (Android/Web) and APNs (iOS) when keys are configured
  // For now, log the notification attempt
  if (process.env.NODE_ENV === 'development') {
    logger.info('[PushService]', `Would send to ${platform} token ${token.slice(0, 8)}...`, {
      title: payload.title,
      body: payload.body,
    });
  }

  // Store notification in Supabase notifications table for in-app display
  const client = getClient();
  if (client) {
    await client.from('notifications').insert({
      title: payload.title,
      message: payload.body,
      type: payload.data?.type || 'AVISO_ACADEMIA',
      read: false,
      metadata: payload.data,
    });
  }

  return true;
}
import { logger } from '@/lib/logger';
