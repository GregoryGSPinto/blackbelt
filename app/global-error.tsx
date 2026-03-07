// ============================================================
// app/global-error.tsx — Root layout error boundary
// ============================================================
// This is the LAST RESORT. Catches errors in root layout.
// Must include its own <html> and <body> tags since the root
// layout is what failed.
// ============================================================
'use client';

import { useEffect } from 'react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('[GlobalError] Critical error in root layout:', error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0908',
          color: '#FFFFFF',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '400px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '16px',
            margin: '24px',
          }}
        >
          {/* Minimal icon (no Lucide dependency) */}
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 24px',
              borderRadius: '16px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>

          <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            Erro Crítico
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px' }}>
            Ocorreu um erro grave. Por favor, tente recarregar a página.
          </p>

          {error.digest && (
            <div
              style={{
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                Código: {error.digest}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={reset}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Recarregar
            </button>

            <button
              onClick={() => (window.location.href = '/')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              🏠 Página Inicial
            </button>
          </div>

          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', marginTop: '24px' }}>
            BlackBelt · Se o erro persistir, entre em contato com o suporte.
          </p>
        </div>
      </body>
    </html>
  );
}
