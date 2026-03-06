// ============================================================
// useBiometricAuth — Biometric login hook
// ============================================================
// Provides Face ID / Touch ID login capability.
// Stores refresh token in Keychain (iOS) / Keystore (Android).
// Configurable per user (can be disabled).
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  isBiometricAvailable,
  getBiometricType,
  verifyBiometric,
  storeCredentials,
  getCredentials,
  deleteCredentials,
} from '@/lib/capacitor/biometric';

const BIOMETRIC_SERVER = 'blackbelt.app';
const BIOMETRIC_ENABLED_KEY = 'bbos_biometric_enabled';

interface UseBiometricAuthReturn {
  /** Whether biometric hardware is available */
  available: boolean;
  /** Human-readable biometric type (Face ID, Touch ID, Fingerprint) */
  biometricType: string;
  /** Whether the user has enabled biometric login */
  enabled: boolean;
  /** Whether biometric check is loading */
  loading: boolean;
  /** Enable biometric login and store credentials */
  enableBiometric: (email: string, refreshToken: string) => Promise<boolean>;
  /** Disable biometric login and remove stored credentials */
  disableBiometric: () => Promise<void>;
  /** Attempt biometric login — returns stored credentials if verified */
  loginWithBiometric: () => Promise<{ email: string; refreshToken: string } | null>;
}

export function useBiometricAuth(): UseBiometricAuthReturn {
  const [available, setAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('none');
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check availability on mount
  useEffect(() => {
    async function check() {
      try {
        const [isAvailable, type] = await Promise.all([
          isBiometricAvailable(),
          getBiometricType(),
        ]);
        setAvailable(isAvailable);
        setBiometricType(type);

        // Check if user has enabled biometric login
        try {
          const storedEnabled = localStorage.getItem(BIOMETRIC_ENABLED_KEY);
          setEnabled(storedEnabled === 'true' && isAvailable);
        } catch {
          // localStorage unavailable
        }
      } catch {
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    }

    check();
  }, []);

  const enableBiometric = useCallback(async (email: string, refreshToken: string): Promise<boolean> => {
    if (!available) return false;

    // Verify biometric first
    const result = await verifyBiometric('Ative a autenticacao biometrica');
    if (!result.success) return false;

    // Store credentials in Keychain/Keystore
    const stored = await storeCredentials(BIOMETRIC_SERVER, email, refreshToken);
    if (!stored) return false;

    try {
      localStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
    } catch {
      // ignore
    }
    setEnabled(true);
    return true;
  }, [available]);

  const disableBiometric = useCallback(async () => {
    await deleteCredentials(BIOMETRIC_SERVER);
    try {
      localStorage.removeItem(BIOMETRIC_ENABLED_KEY);
    } catch {
      // ignore
    }
    setEnabled(false);
  }, []);

  const loginWithBiometric = useCallback(async (): Promise<{ email: string; refreshToken: string } | null> => {
    if (!available || !enabled) return null;

    // Verify biometric
    const result = await verifyBiometric('Autentique-se para entrar');
    if (!result.success) return null;

    // Retrieve stored credentials
    const credentials = await getCredentials(BIOMETRIC_SERVER);
    if (!credentials) return null;

    return {
      email: credentials.username,
      refreshToken: credentials.password,
    };
  }, [available, enabled]);

  return {
    available,
    biometricType,
    enabled,
    loading,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
  };
}
