/**
 * Biometric Authentication Helper
 *
 * Provides Face ID / Touch ID / Fingerprint authentication on native platforms.
 * Falls back gracefully on web (not supported).
 *
 * Uses Capacitor Preferences for secure token storage on native,
 * with a web fallback to sessionStorage.
 */

import { Capacitor } from '@capacitor/core';

export interface BiometricResult {
  success: boolean;
  error?: string;
}

/** Check if biometric auth is available on this device */
export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    const { NativeBiometric } = await importBiometric();
    const result = await NativeBiometric.isAvailable();
    return result.isAvailable;
  } catch {
    return false;
  }
}

/** Get the biometric type available (Face ID, Touch ID, Fingerprint, etc.) */
export async function getBiometricType(): Promise<string> {
  if (!Capacitor.isNativePlatform()) return 'none';

  try {
    const { NativeBiometric } = await importBiometric();
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return 'none';

    // BiometryType enum: 1=TOUCH_ID, 2=FACE_ID, 3=FINGERPRINT, 4=FACE_AUTHENTICATION, 5=IRIS
    switch (result.biometryType) {
      case 1: return 'Touch ID';
      case 2: return 'Face ID';
      case 3: return 'Fingerprint';
      case 4: return 'Face Authentication';
      default: return 'Biometric';
    }
  } catch {
    return 'none';
  }
}

/** Prompt user for biometric verification */
export async function verifyBiometric(reason?: string): Promise<BiometricResult> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'Biometric not available on web' };
  }

  try {
    const { NativeBiometric } = await importBiometric();
    await NativeBiometric.verifyIdentity({
      reason: reason || 'Autentique-se para continuar',
      title: 'BlackBelt',
      subtitle: 'Autenticacao biometrica',
      description: reason || 'Use sua biometria para entrar',
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Biometric verification failed',
    };
  }
}

/** Store credentials securely using biometric protection */
export async function storeCredentials(
  server: string,
  username: string,
  password: string
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // Web fallback: sessionStorage (not persistent)
    try {
      sessionStorage.setItem(`bbos_bio_${server}`, JSON.stringify({ username, password }));
      return true;
    } catch {
      return false;
    }
  }

  try {
    const { NativeBiometric } = await importBiometric();
    await NativeBiometric.setCredentials({
      server,
      username,
      password,
    });
    return true;
  } catch {
    return false;
  }
}

/** Retrieve stored credentials (requires biometric verification first) */
export async function getCredentials(server: string): Promise<{ username: string; password: string } | null> {
  if (!Capacitor.isNativePlatform()) {
    try {
      const stored = sessionStorage.getItem(`bbos_bio_${server}`);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  }

  try {
    const { NativeBiometric } = await importBiometric();
    const credentials = await NativeBiometric.getCredentials({ server });
    return { username: credentials.username, password: credentials.password };
  } catch {
    return null;
  }
}

/** Delete stored credentials */
export async function deleteCredentials(server: string): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    try {
      sessionStorage.removeItem(`bbos_bio_${server}`);
    } catch {
      // ignore
    }
    return;
  }

  try {
    const { NativeBiometric } = await importBiometric();
    await NativeBiometric.deleteCredentials({ server });
  } catch {
    // Credentials might not exist
  }
}

// ── Internal ──

async function importBiometric() {
  // capacitor-native-biometric provides Keychain (iOS) / Keystore (Android) storage
  const mod = await import('capacitor-native-biometric');
  return mod;
}
