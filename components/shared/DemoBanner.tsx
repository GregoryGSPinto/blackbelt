// ============================================================
// DemoBanner — Subtle demo mode indicator
// ============================================================
// Shows a small, discrete banner when app is running in mock
// mode. Important for Store reviewers to understand context.
//
// Behavior:
//   - Shows "Modo Demonstração" in a small top banner
//   - Only shows when NEXT_PUBLIC_USE_MOCK=true
//   - Dismissible (localStorage persists dismissal for session)
//   - Non-intrusive: 24px height, semi-transparent
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';

const DISMISS_KEY = 'blackbelt-demo-banner-dismissed';

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show in mock mode
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (isMock && !dismissed) {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setVisible(false);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9997] flex items-center justify-center gap-2 py-1 px-4"
      style={{
        background: 'linear-gradient(90deg, rgba(124,58,237,0.85), rgba(79,70,229,0.85))',
        backdropFilter: 'blur(8px)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: '0.05em',
      }}
      role="status"
    >
      <Eye size={11} style={{ opacity: 0.7 }} />
      <span>MODO DEMONSTRAÇÃO</span>
      <span style={{ opacity: 0.4, margin: '0 4px' }}>•</span>
      <span style={{ opacity: 0.6, fontWeight: 400 }}>Dados fictícios para avaliação</span>
      <button
        onClick={dismiss}
        className="ml-2 p-0.5 rounded hover:bg-white/10 transition-colors"
        aria-label="Fechar banner de demonstração"
      >
        <X size={11} style={{ opacity: 0.5 }} />
      </button>
    </div>
  );
}
