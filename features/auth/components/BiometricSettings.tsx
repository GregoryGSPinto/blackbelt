'use client';

import { useState } from 'react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

interface BiometricSettingsProps {
  userEmail: string;
  refreshToken: string;
}

export function BiometricSettings({ userEmail, refreshToken }: BiometricSettingsProps) {
  const { available, biometricType, enabled, loading, enableBiometric, disableBiometric } = useBiometricAuth();
  const [toggling, setToggling] = useState(false);

  if (loading || !available) return null;

  const handleToggle = async () => {
    if (toggling) return;
    setToggling(true);
    try {
      if (enabled) {
        await disableBiometric();
      } else {
        await enableBiometric(userEmail, refreshToken);
      }
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem',
        borderBottom: '1px solid rgba(128,128,128,0.2)',
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
          Login com {biometricType}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>
          {enabled
            ? `${biometricType} ativado para login rapido`
            : `Ativar login com ${biometricType}`}
        </div>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        disabled={toggling}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          border: 'none',
          background: enabled ? '#22c55e' : 'rgba(128,128,128,0.3)',
          position: 'relative',
          cursor: toggling ? 'wait' : 'pointer',
          transition: 'background 0.2s ease',
        }}
        aria-label={enabled ? 'Desativar biometria' : 'Ativar biometria'}
        role="switch"
        aria-checked={enabled}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: enabled ? 23 : 3,
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </div>
  );
}
