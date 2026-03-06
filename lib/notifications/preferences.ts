/**
 * Notification Preferences — User notification settings
 *
 * Users can configure:
 * - Push notifications on/off
 * - Email notifications on/off
 * - Quiet hours (no push during these times)
 * - Disabled notification types
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================
// TYPES
// ============================================================

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  disabled_types: string[];
  updated_at: string;
}

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULT_PREFERENCES: Omit<NotificationPreferences, 'user_id' | 'updated_at'> = {
  push_enabled: true,
  email_enabled: true,
  quiet_hours_start: null,
  quiet_hours_end: null,
  disabled_types: [],
};

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
// PUBLIC API
// ============================================================

/**
 * Get notification preferences for a user.
 * Returns defaults if no preferences are stored.
 */
export async function getUserPreferences(userId: string): Promise<NotificationPreferences> {
  const client = getClient();
  if (!client) {
    return {
      user_id: userId,
      ...DEFAULT_PREFERENCES,
      updated_at: new Date().toISOString(),
    };
  }

  const { data } = await client
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) {
    return {
      user_id: userId,
      ...DEFAULT_PREFERENCES,
      updated_at: new Date().toISOString(),
    };
  }

  return data as NotificationPreferences;
}

/**
 * Update notification preferences for a user.
 * Creates the record if it doesn't exist.
 */
export async function updatePreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreferences, 'user_id' | 'updated_at'>>,
): Promise<NotificationPreferences | null> {
  const client = getClient();
  if (!client) return null;

  const { data, error } = await client
    .from('notification_preferences')
    .upsert(
      {
        user_id: userId,
        ...updates,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  if (error) {
    console.error('[Preferences] Failed to update:', error.message);
    return null;
  }

  return data as NotificationPreferences;
}

/**
 * Disable a specific notification type for a user.
 */
export async function disableNotificationType(userId: string, type: string): Promise<void> {
  const prefs = await getUserPreferences(userId);
  if (!prefs.disabled_types.includes(type)) {
    await updatePreferences(userId, {
      disabled_types: [...prefs.disabled_types, type],
    });
  }
}

/**
 * Enable a specific notification type for a user.
 */
export async function enableNotificationType(userId: string, type: string): Promise<void> {
  const prefs = await getUserPreferences(userId);
  await updatePreferences(userId, {
    disabled_types: prefs.disabled_types.filter(t => t !== type),
  });
}
