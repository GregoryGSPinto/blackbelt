// ============================================================
// useNetworkStatus — Detect slow/offline connections
// ============================================================
// Returns: { isOnline, isSlow, effectiveType, downlink }
//
// Uses Navigator.connection API (Network Information API)
// Falls back gracefully on unsupported browsers.
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  isSlow: boolean;
  effectiveType: string; // '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
  downlink: number;      // Mbps estimate
}

interface NetworkConnection extends EventTarget {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

function getConnection(): NetworkConnection | null {
  if (typeof navigator === 'undefined') return null;
  const nav = navigator as typeof navigator & { connection?: NetworkConnection; mozConnection?: NetworkConnection; webkitConnection?: NetworkConnection };
  return nav.connection || nav.mozConnection || nav.webkitConnection || null;
}

export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlow: false,
    effectiveType: 'unknown',
    downlink: 10,
  });

  const update = useCallback(() => {
    const conn = getConnection();
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const effectiveType = conn?.effectiveType || 'unknown';
    const downlink = conn?.downlink || 10;
    const isSlow = !isOnline || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g' || downlink < 1;

    setStatus({ isOnline, isSlow, effectiveType, downlink });
  }, []);

  useEffect(() => {
    update();

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    const conn = getConnection();
    if (conn) {
      conn.addEventListener('change', update);
    }

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      conn?.removeEventListener('change', update);
    };
  }, [update]);

  return status;
}
