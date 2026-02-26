// ============================================================
// SlowConnectionBanner — Shows when on slow/offline connection
// ============================================================
'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function SlowConnectionBanner() {
  const { isOnline, isSlow, effectiveType } = useNetworkStatus();

  if (isOnline && !isSlow) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-medium"
      style={{
        background: isOnline
          ? 'linear-gradient(90deg, rgba(251,191,36,0.9), rgba(245,158,11,0.9))'
          : 'linear-gradient(90deg, rgba(239,68,68,0.9), rgba(220,38,38,0.9))',
        color: isOnline ? '#1A1206' : '#FFFFFF',
        backdropFilter: 'blur(12px)',
      }}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi size={12} />
          <span>Conexão lenta ({effectiveType}). Carregamento pode demorar.</span>
        </>
      ) : (
        <>
          <WifiOff size={12} />
          <span>Sem conexão. Alguns recursos podem não funcionar.</span>
        </>
      )}
    </div>
  );
}
