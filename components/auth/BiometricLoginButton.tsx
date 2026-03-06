'use client';

import { useState } from 'react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface BiometricLoginButtonProps {
  onBiometricLogin: (email: string, refreshToken: string) => Promise<void>;
  isDark?: boolean;
}

function FingerprintIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
      <path d="M5 19.5C5.5 18 6 15 6 12c0-3.5 2.5-6 6-6 3.5 0 6 2.5 6 6 0 1-.5 3-1 4.5" />
      <path d="M8.5 16c.3-1.3.5-3 .5-4 0-2 1.5-3.5 3-3.5s3 1.5 3 3.5c0 .5-.1 1-.3 1.5" />
      <path d="M12 12v4" />
      <path d="M19 15c-.3 1.5-1 3.5-2 5" />
    </svg>
  );
}

export function BiometricLoginButton({ onBiometricLogin, isDark = false }: BiometricLoginButtonProps) {
  const { available, biometricType, enabled, loading, loginWithBiometric } = useBiometricAuth();
  const [authenticating, setAuthenticating] = useState(false);

  if (loading || !available || !enabled) return null;

  const handleBiometricLogin = async () => {
    if (authenticating) return;
    setAuthenticating(true);

    try {
      const result = await loginWithBiometric();
      if (result) {
        await onBiometricLogin(result.email, result.refreshToken);
      }
    } finally {
      setAuthenticating(false);
    }
  };

  const textColor = isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)';
  const borderColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';

  return (
    <button
      type="button"
      onClick={handleBiometricLogin}
      disabled={authenticating}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        background: 'transparent',
        border: `1px solid ${borderColor}`,
        borderRadius: 0,
        color: textColor,
        fontSize: '0.8125rem',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase' as const,
        cursor: authenticating ? 'wait' : 'pointer',
        opacity: authenticating ? 0.6 : 1,
        transition: 'all 0.2s ease',
      }}
      aria-label={`Login com ${biometricType}`}
    >
      <FingerprintIcon color={textColor} />
      {authenticating ? 'Verificando...' : `Login com ${biometricType}`}
    </button>
  );
}
