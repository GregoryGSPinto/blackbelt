'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { transitions } from '@/styles/transitions';
import { ErrorAlert } from './ErrorAlert';
import { signInWithGoogle, signInWithApple } from '@/lib/auth/oauth';
import { useState } from 'react';
import { logger } from '@/lib/logger';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepEmailProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onSubmit: (e: React.FormEvent) => void;
}

// SVG Icons
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

export function StepEmail({ dados, setDados, onSubmit, error, setError }: StepEmailProps) {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { isDark } = useTheme();
  const colors = getDesignTokens(isDark);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsOAuthLoading(true);
      setError?.('');
      await signInWithGoogle();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha no login com Google';
      setError?.(message);
      setIsOAuthLoading(false);
      logger.error('[Cadastro]', 'Google sign-in error:', err);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsOAuthLoading(true);
      setError?.('');
      await signInWithApple();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha no login com Apple';
      setError?.(message);
      setIsOAuthLoading(false);
      logger.error('[Cadastro]', 'Apple sign-in error:', err);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Unified bordered container: card + divider + SSO */}
      <div
        style={{
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: 12,
          background: colors.cardBg,
          backdropFilter: 'blur(12px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
          transition: `${transitions.theme}, border-color 0.25s ease`,
        }}
      >
        {/* Card content */}
        <div style={{ padding: '2rem 1.5rem 1.5rem' }}>
          {/* Title */}
          <h2
            style={{
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: 600,
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
              textAlign: 'center',
              transition: transitions.theme,
            }}
          >
            {t('register.createButton').toUpperCase()}
          </h2>

          {/* Error */}
          <ErrorAlert message={error} />

          {/* Email input */}
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              value={dados.email}
              onChange={e => setDados({ ...dados, email: e.target.value })}
              placeholder="seu@email.com"
              autoFocus
              autoComplete="email"
              required
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '0.75rem 0',
                fontSize: '1rem',
                color: colors.text,
                outline: 'none',
                borderBottom: `1px solid ${colors.inputBorder}`,
                transition: 'border-color 0.3s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderBottomColor = colors.inputFocus;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderBottomColor = colors.inputBorder;
              }}
            />
          </div>

          {/* Continue button */}
          <button
            type="submit"
            style={{
              width: '100%',
              height: 48,
              marginTop: '1.5rem',
              background: 'transparent',
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: 8,
              color: colors.text,
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = colors.cardBorder;
            }}
          >
            {tCommon('actions.continue')}
          </button>

          {/* Link para login */}
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: colors.textMuted, marginBottom: '0.5rem' }}>
              {t('register.hasAccount')}
            </p>
            <Link
              href="/login"
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: colors.text,
                textDecoration: 'none',
                transition: 'opacity 0.25s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              {t('register.login')} →
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: colors.cardBorder, transition: transitions.theme }} />

        {/* SSO buttons at bottom */}
        <div style={{ display: 'flex' }}>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isOAuthLoading}
            aria-label={t('login.loginWithGoogle')}
            style={{
              flex: 1,
              height: 52,
              border: 'none',
              borderRight: `1px solid ${colors.cardBorder}`,
              borderRadius: 0,
              background: 'transparent',
              cursor: isOAuthLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOAuthLoading ? 0.6 : 1,
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (!isOAuthLoading) {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isOAuthLoading ? (
              <div style={{ width: 20, height: 20, border: `2px solid ${colors.inputBorder}`, borderTopColor: colors.text, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <GoogleIcon />
            )}
          </button>
          <button
            type="button"
            onClick={handleAppleSignIn}
            disabled={isOAuthLoading}
            aria-label={t('login.loginWithApple')}
            style={{
              flex: 1,
              height: 52,
              border: 'none',
              borderRadius: 0,
              background: 'transparent',
              cursor: isOAuthLoading ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isOAuthLoading ? 0.6 : 1,
              transition: 'background-color 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (!isOAuthLoading) {
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {isOAuthLoading ? (
              <div style={{ width: 20, height: 20, border: `2px solid ${colors.inputBorder}`, borderTopColor: colors.text, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            ) : (
              <AppleIcon color={colors.text} />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
