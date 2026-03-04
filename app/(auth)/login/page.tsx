'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getRedirectForProfile } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { transitions } from '@/styles/transitions';
import { logger } from '@/lib/logger';

// ─── Types ──────────────────────────────────────────────────
type LoginStep = 'INITIAL' | 'EMAIL' | 'PASSWORD' | 'LOADING' | 'ERROR';

// ─── SVG Icons (inline, no library) ─────────────────────────
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

function EyeIcon({ open, color }: { open: boolean; color: string }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function SpinnerIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

function BackArrowIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

// ─── Main export ────────────────────────────────────────────
export default function PremiumLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

// ─── Login Content ──────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();

  // ─── State machine ────────────────────────────────────────
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Slide direction for transitions
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'none'>('none');
  const [cardVisible, setCardVisible] = useState(true);

  // Landing sections state
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});
  const [newsletterEmail, setNewsletterEmail] = useState('');

  // ─── Theme-aware colors ───────────────────────────────────
  const colors = {
    text: isDark ? '#ffffff' : '#111111',
    textMuted: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    cardBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)',
    cardBg: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.12)',
    inputBorder: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.35)',
    inputFocus: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)',
    placeholder: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)',
    overlay: isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.08)',
    blur: isDark ? '4px' : '8px',
    error: isDark ? '#ff6b6b' : '#dc2626',
    ssoBorder: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)',
    ssoText: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)',
    linkColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
  };

  // ─── Entry animation ─────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // ─── Redirect if already authenticated ────────────────────
  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectForProfile(user.tipo));
    }
  }, [authLoading, user, router]);

  // ─── Detect recent signup ─────────────────────────────────
  useEffect(() => {
    if (searchParams.get('cadastro') === 'sucesso') {
      setStep('EMAIL');
    }
  }, [searchParams]);

  // ─── Email validation ─────────────────────────────────────
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // ─── Step transitions ─────────────────────────────────────
  const goToEmail = useCallback(() => {
    setStep('EMAIL');
    setError('');
  }, []);

  const goToPassword = useCallback(() => {
    if (!email.trim()) { setError('Email inválido'); return; }
    if (!validateEmail(email)) { setError('Email inválido'); return; }
    setError('');
    setCardVisible(false);
    setSlideDir('left');
    setTimeout(() => {
      setStep('PASSWORD');
      setSlideDir('right');
      setTimeout(() => setCardVisible(true), 20);
    }, 350);
  }, [email]);

  const goBackToEmail = useCallback(() => {
    setError('');
    setPassword('');
    setCardVisible(false);
    setSlideDir('right');
    setTimeout(() => {
      setStep('EMAIL');
      setSlideDir('left');
      setTimeout(() => setCardVisible(true), 20);
    }, 350);
  }, []);

  // ─── Submit login ─────────────────────────────────────────
  const handleLogin = useCallback(async () => {
    if (!password) { setError('Digite sua senha'); return; }
    setError('');
    setStep('LOADING');

    try {
      const tipo = await login(email, password);
      if (tipo) {
        logger.info('[Login]', 'Login OK →', getRedirectForProfile(tipo));
        router.replace(getRedirectForProfile(tipo));
      } else {
        setError('Email ou senha incorretos');
        setStep('ERROR');
      }
    } catch (err) {
      logger.error('[Login]', 'Login error:', err);
      setError('Ocorreu um erro. Tente novamente.');
      setStep('ERROR');
    }
  }, [email, password, login, router]);

  // ─── Form submit handlers ────────────────────────────────
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    goToPassword();
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  // ─── Card slide style ─────────────────────────────────────
  const cardStyle = (): React.CSSProperties => {
    if (slideDir === 'none') {
      return {
        opacity: cardVisible ? 1 : 0,
        transform: cardVisible ? 'translateY(0)' : 'translateY(30px)',
        transition: transitions.slideUp,
      };
    }
    const offX = slideDir === 'left' ? '-40px' : '40px';
    return {
      opacity: cardVisible ? 1 : 0,
      transform: cardVisible ? 'translateX(0)' : `translateX(${offX})`,
      transition: transitions.slideLeft,
    };
  };

  // ─── Defer render until mounted (avoids SSR/client theme mismatch) ──
  if (!mounted) return null;

  // ─── Render ───────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* ─── Background Layer ─────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden="true">
        {/* Dark bg image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/login-dark.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isDark ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
        {/* Light bg image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/login-light.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isDark ? 0 : 1,
            transition: 'opacity 0.6s ease',
          }}
        />
        {/* Blur overlay */}
        <div
          style={{
            position: 'absolute',
            inset: '-5%',
            backdropFilter: `blur(${colors.blur})`,
            WebkitBackdropFilter: `blur(${colors.blur})`,
            transform: 'scale(1.05)',
            transition: transitions.theme,
          }}
        />
        {/* Color overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.overlay,
            transition: transitions.theme,
          }}
        />
        {/* Radial vignette */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* ─── Content ──────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
        {/* ─── STEP: INITIAL ─────────────────────────────── */}
        {step === 'INITIAL' && (
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
              transition: transitions.slideUp,
              textAlign: 'center',
            }}
          >
            <button
              onClick={goToEmail}
              style={{
                width: 200,
                height: 52,
                background: 'transparent',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}`,
                color: colors.text,
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                borderRadius: 0,
                cursor: 'pointer',
                transition: transitions.theme,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Login
            </button>
          </div>
        )}

        {/* ─── STEP: EMAIL ───────────────────────────────── */}
        {step === 'EMAIL' && (
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              ...cardStyle(),
            }}
            className="login-card-responsive"
          >
            <form onSubmit={handleEmailSubmit}>
              <div style={{ position: 'relative' }}>

                {/* Back arrow to INITIAL */}
                <button
                  type="button"
                  onClick={() => { setStep('INITIAL'); setError(''); }}
                  aria-label="Voltar"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    zIndex: 2,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <BackArrowIcon color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
                </button>

                {/* Unified bordered container: card + divider + SSO */}
                <div
                  style={{
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.cardBg,
                    backdropFilter: 'blur(12px) saturate(1.2)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                    transition: `${transitions.theme}, border-color 0.25s ease`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.30)';
                  }}
                >
                  {/* Card content */}
                  <div style={{ padding: '2.5rem 2rem 1.5rem' }}>
                    {/* Title */}
                    <h1
                      style={{
                        color: colors.text,
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        letterSpacing: '0.25em',
                        textTransform: 'uppercase',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        transition: transitions.theme,
                      }}
                    >
                      LOGIN
                    </h1>

                    {/* Error */}
                    {error && (
                      <p
                        role="alert"
                        style={{
                          color: colors.error,
                          fontSize: '0.8rem',
                          marginBottom: '1rem',
                          textAlign: 'center',
                          transition: transitions.fadeIn,
                        }}
                      >
                        {error}
                      </p>
                    )}

                    {/* Email input — underline only */}
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder="Email address"
                      autoFocus
                      autoComplete="email"
                      required
                      aria-label="Email"
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid ${colors.inputBorder}`,
                        padding: '0.75rem 0',
                        fontSize: '1rem',
                        color: colors.text,
                        outline: 'none',
                        transition: transitions.theme,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderBottomColor = colors.inputFocus;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderBottomColor = colors.inputBorder;
                      }}
                    />

                    {/* Remember me + Forgot email */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: colors.textMuted, cursor: 'pointer', transition: transitions.theme }}>
                        <input type="checkbox" style={{ accentColor: isDark ? '#fff' : '#111' }} />
                        Remember me
                      </label>
                      <Link
                        href="/esqueci-email"
                        style={{
                          fontSize: '0.8rem',
                          color: colors.linkColor,
                          textDecoration: 'none',
                          transition: transitions.theme,
                        }}
                      >
                        Esqueci meu email
                      </Link>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: colors.cardBorder, transition: transitions.theme }} />

                  {/* SSO buttons at bottom */}
                  <div style={{ display: 'flex' }}>
                    <button
                      type="button"
                      aria-label="Entrar com Google"
                      style={{
                        flex: 1,
                        height: 52,
                        border: 'none',
                        borderRight: `1px solid ${colors.cardBorder}`,
                        borderRadius: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: transitions.theme,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <GoogleIcon />
                    </button>
                    <button
                      type="button"
                      aria-label="Entrar com Apple"
                      style={{
                        flex: 1,
                        height: 52,
                        border: 'none',
                        borderRadius: 0,
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: transitions.theme,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <AppleIcon color={colors.text} />
                    </button>
                  </div>
                </div>{/* end unified border */}

                {/* Hidden submit for Enter key */}
                <button type="submit" style={{ display: 'none' }} aria-hidden="true" tabIndex={-1} />

                {/* Create account link */}
                <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
                  <Link
                    href="/cadastro"
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      color: colors.text,
                      opacity: 0.5,
                      textDecoration: 'none',
                      transition: transitions.theme,
                    }}
                  >
                    Criar conta
                  </Link>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* ─── STEP: PASSWORD ────────────────────────────── */}
        {step === 'PASSWORD' && (
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              ...cardStyle(),
            }}
            className="login-card-responsive"
          >
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ position: 'relative' }}>
                {/* Card */}
                <div
                  style={{
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.cardBg,
                    backdropFilter: 'blur(12px) saturate(1.2)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                    padding: '2.5rem 2rem 3rem',
                    transition: transitions.theme,
                  }}
                >
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: colors.textMuted,
                      fontSize: '0.8rem',
                      transition: transitions.theme,
                    }}
                    aria-label="Voltar para email"
                  >
                    <BackArrowIcon color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
                  </button>

                  {/* Email display */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: colors.textMuted,
                      marginBottom: '2rem',
                      textAlign: 'center',
                      transition: transitions.theme,
                    }}
                  >
                    {email}
                  </p>

                  {/* Error */}
                  {(error && (step === 'PASSWORD' || step === 'ERROR')) && (
                    <p
                      role="alert"
                      style={{
                        color: colors.error,
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                        textAlign: 'center',
                        transition: transitions.fadeIn,
                      }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Password input */}
                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <label
                      htmlFor="password"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: colors.textMuted,
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        transition: transitions.theme,
                      }}
                    >
                      Senha
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Digite sua senha"
                        autoFocus
                        autoComplete="current-password"
                        required
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${colors.inputBorder}`,
                          padding: '0.75rem 2.5rem 0.75rem 0',
                          fontSize: '1rem',
                          color: colors.text,
                          outline: 'none',
                          transition: transitions.theme,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderBottomColor = colors.inputFocus;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderBottomColor = colors.inputBorder;
                        }}
                      />
                      {/* Eye toggle */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <EyeIcon open={showPassword} color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)'} />
                      </button>
                    </div>
                  </div>

                  {/* Forgot password link */}
                  <div style={{ textAlign: 'center' }}>
                    <Link
                      href="/esqueci-senha"
                      style={{
                        fontSize: '0.8rem',
                        color: colors.linkColor,
                        textDecoration: 'none',
                        transition: transitions.theme,
                      }}
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>

                {/* Overlapping button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      width: '60%',
                      height: 52,
                      background: '#111',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transform: 'translateY(-50%)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#000';
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 2px))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#111';
                      e.currentTarget.style.transform = 'translateY(-50%)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 4px))';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 2px))';
                    }}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ─── STEP: LOADING ─────────────────────────────── */}
        {step === 'LOADING' && (
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              opacity: 1,
              transform: 'scale(1.03)',
              transition: 'all 0.4s ease',
            }}
            className="login-card-responsive"
          >
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  border: `1px solid ${colors.cardBorder}`,
                  background: colors.cardBg,
                  backdropFilter: 'blur(12px) saturate(1.2)',
                  WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  transition: transitions.theme,
                }}
              >
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <SpinnerIcon color={colors.text} />
                </div>
                <p
                  style={{
                    color: colors.textMuted,
                    fontSize: '0.875rem',
                    transition: transitions.theme,
                  }}
                >
                  Entrando...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP: ERROR (returns to password card) ────── */}
        {step === 'ERROR' && (
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              opacity: 1,
              transition: transitions.fadeIn,
            }}
            className="login-card-responsive"
          >
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    border: `1px solid ${colors.cardBorder}`,
                    background: colors.cardBg,
                    backdropFilter: 'blur(12px) saturate(1.2)',
                    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                    padding: '2.5rem 2rem 3rem',
                    transition: transitions.theme,
                  }}
                >
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: colors.textMuted,
                      fontSize: '0.8rem',
                      transition: transitions.theme,
                    }}
                    aria-label="Voltar para email"
                  >
                    <BackArrowIcon color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
                  </button>

                  {/* Email display */}
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: colors.textMuted,
                      marginBottom: '1.5rem',
                      textAlign: 'center',
                      transition: transitions.theme,
                    }}
                  >
                    {email}
                  </p>

                  {/* Error */}
                  {error && (
                    <p
                      role="alert"
                      style={{
                        color: colors.error,
                        fontSize: '0.8rem',
                        marginBottom: '1rem',
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Password input */}
                  <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
                    <label
                      htmlFor="password-retry"
                      style={{
                        display: 'block',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: colors.textMuted,
                        marginBottom: '0.5rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        transition: transitions.theme,
                      }}
                    >
                      Senha
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password-retry"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder="Digite sua senha"
                        autoFocus
                        autoComplete="current-password"
                        required
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${colors.inputBorder}`,
                          padding: '0.75rem 2.5rem 0.75rem 0',
                          fontSize: '1rem',
                          color: colors.text,
                          outline: 'none',
                          transition: transitions.theme,
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderBottomColor = colors.inputFocus;
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderBottomColor = colors.inputBorder;
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <EyeIcon open={showPassword} color={isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.38)'} />
                      </button>
                    </div>
                  </div>

                  {/* Forgot password */}
                  <div style={{ textAlign: 'center' }}>
                    <Link
                      href="/esqueci-senha"
                      style={{
                        fontSize: '0.8rem',
                        color: colors.linkColor,
                        textDecoration: 'none',
                        transition: transitions.theme,
                      }}
                    >
                      Esqueci minha senha
                    </Link>
                  </div>
                </div>

                {/* Overlapping button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    style={{
                      width: '60%',
                      height: 52,
                      background: '#111',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transform: 'translateY(-50%)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#000';
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 2px))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#111';
                      e.currentTarget.style.transform = 'translateY(-50%)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 4px))';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(calc(-50% + 2px))';
                    }}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ─── Footer ─────────────────────────────────────── */}
        {step !== 'INITIAL' && (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.75rem',
              color: colors.textMuted,
              marginTop: '2rem',
              opacity: 0.6,
              transition: transitions.theme,
            }}
          >
            Ao entrar, voce concorda com nossos Termos de Uso
          </p>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
           MARKETING SECTIONS (below the hero)
         ════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 20 }}>

        {/* ─── SECTION 1: Top 10 da Semana ────────────────── */}
        <section
          style={{
            background: isDark ? '#111' : '#eee',
            padding: '4rem 2rem',
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', transition: transitions.theme }}>
              Top 10 da Semana
            </h2>
            <div
              className="top10-scroll"
              style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                paddingBottom: '1rem',
              }}
            >
              {[
                { title: 'Guarda Fechada', subtitle: 'Fundamentos · Faixa Branca' },
                { title: 'Raspagem de Gancho', subtitle: 'Raspagens · Faixa Azul' },
                { title: 'Passagem de Guarda', subtitle: 'Passagens · Faixa Roxa' },
                { title: 'Triângulo do Fechado', subtitle: 'Finalizações · Faixa Azul' },
                { title: 'Kimura da Meia', subtitle: 'Finalizações · Faixa Branca' },
                { title: 'Berimbolo', subtitle: 'Avançado · Faixa Marrom' },
                { title: 'Arm Lock Clássico', subtitle: 'Fundamentos · Faixa Branca' },
                { title: 'Estrangulamento Cruzado', subtitle: 'Finalizações · Faixa Azul' },
                { title: 'Joelho no Belly', subtitle: 'Pressão · Faixa Roxa' },
                { title: 'Lapel Guard', subtitle: 'Moderno · Faixa Marrom' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                    gap: '0.25rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '6rem',
                      fontWeight: 900,
                      lineHeight: 1,
                      color: 'transparent',
                      WebkitTextStroke: `2px ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                      fontStyle: 'italic',
                      userSelect: 'none',
                      minWidth: '4rem',
                      textAlign: 'center',
                    }}
                  >
                    {i + 1}
                  </span>
                  <div
                    style={{
                      width: 160,
                      height: 100,
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      padding: '0.75rem',
                      transition: transitions.theme,
                    }}
                  >
                    <p style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 600, margin: 0, transition: transitions.theme }}>{item.title}</p>
                    <p style={{ color: colors.textMuted, fontSize: '0.65rem', margin: 0, transition: transitions.theme }}>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 2: Adicionados Recentemente ────────── */}
        <section
          style={{
            background: isDark ? '#0a0a0a' : '#f5f5f5',
            padding: '4rem 2rem',
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', transition: transitions.theme }}>
              Adicionados Recentemente
            </h2>
            <div className="recentes-grid">
              {[
                { title: 'De La Riva Sweep', subtitle: 'Raspagens' },
                { title: 'North-South Choke', subtitle: 'Finalizações' },
                { title: 'Worm Guard Intro', subtitle: 'Guarda Moderna' },
                { title: 'Single Leg X', subtitle: 'Leg Locks' },
                { title: 'Anaconda Choke', subtitle: 'Finalizações' },
                { title: 'Half Guard Recovery', subtitle: 'Defesa' },
                { title: 'Spider Guard Basics', subtitle: 'Fundamentos' },
                { title: 'Loop Choke Setup', subtitle: 'Finalizações' },
                { title: 'Rubber Guard Flow', subtitle: 'Avançado' },
                { title: 'Coyote Guard', subtitle: 'Guarda Moderna' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="recente-card"
                  style={{
                    position: 'relative',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = isDark ? '0 8px 30px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Badge NOVO */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: '#e50914',
                      color: '#fff',
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    NOVO
                  </div>
                  {/* Thumbnail placeholder */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: isDark
                        ? 'linear-gradient(135deg, #1a1a2e, #16213e)'
                        : 'linear-gradient(135deg, #ddd, #ccc)',
                      transition: transitions.theme,
                    }}
                  />
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 600, margin: 0, transition: transitions.theme }}>{item.title}</p>
                    <p style={{ color: colors.textMuted, fontSize: '0.7rem', margin: '0.25rem 0 0', transition: transitions.theme }}>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: Features ────────────────────────── */}
        <section
          style={{
            background: isDark ? '#111' : '#eee',
            padding: '4rem 2rem',
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', transition: transitions.theme }}>
              Por que BlackBelt?
            </h2>
            <div className="features-grid">
              {[
                { icon: '\uD83D\uDCF1', title: 'Qualquer dispositivo', desc: 'Mobile, tablet ou desktop' },
                { icon: '\uD83E\uDD4B', title: 'Todos os n\u00edveis', desc: 'Do iniciante ao n\u00edvel m\u00e1ximo' },
                { icon: '\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67', title: 'Modo fam\u00edlia', desc: 'Perfis Kids, Teen e Adulto' },
                { icon: '\uD83C\uDFC6', title: 'Campe\u00f5es', desc: 'Conte\u00fado validado por campe\u00f5es' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: 'center',
                    padding: '2rem 1.5rem',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    transition: transitions.theme,
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                  <h3 style={{ color: colors.text, fontSize: '1rem', fontWeight: 700, margin: '0 0 0.5rem', transition: transitions.theme }}>{item.title}</h3>
                  <p style={{ color: colors.textMuted, fontSize: '0.85rem', margin: 0, transition: transitions.theme }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 4: FAQ ─────────────────────────────── */}
        <section
          style={{
            background: isDark ? '#0a0a0a' : '#f5f5f5',
            padding: '4rem 2rem',
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', textAlign: 'center', transition: transitions.theme }}>
              Perguntas Frequentes
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { q: 'Posso cancelar quando quiser?', a: 'Sim. Sem multa, sem burocracia. Cancele a qualquer momento pelo app ou site e continue usando até o fim do período pago.' },
                { q: 'Funciona em todos os dispositivos?', a: 'Sim. BlackBelt funciona no celular, tablet, notebook e smart TV. Basta acessar pelo navegador ou instalar nosso app.' },
                { q: 'É adequado para iniciantes?', a: 'Totalmente. Temos trilhas específicas do zero absoluto até faixa preta, com progressão guiada e avaliações adaptativas.' },
                { q: 'Tem conteúdo infantil?', a: 'Sim. O modo Kids oferece conteúdo adequado para crianças, com interface lúdica, gamificação e controle parental.' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    transition: transitions.theme,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFaqOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1.25rem 1.5rem',
                      background: 'none',
                      border: 'none',
                      color: colors.text,
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: transitions.theme,
                    }}
                  >
                    <span>{item.q}</span>
                    <span
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 300,
                        lineHeight: 1,
                        transform: faqOpen[i] ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                        flexShrink: 0,
                        marginLeft: '1rem',
                      }}
                    >
                      +
                    </span>
                  </button>
                  <div
                    style={{
                      maxHeight: faqOpen[i] ? 200 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.3s ease',
                    }}
                  >
                    <p
                      style={{
                        color: colors.textMuted,
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        padding: '0 1.5rem 1.25rem',
                        margin: 0,
                        transition: transitions.theme,
                      }}
                    >
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: CTA Newsletter ──────────────────── */}
        <section
          style={{
            background: isDark ? '#111' : '#eee',
            padding: '4rem 2rem',
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{ color: colors.text, fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', transition: transitions.theme }}>
              Pronto para evoluir?
            </h2>
            <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '2rem', transition: transitions.theme }}>
              Cadastre seu email para receber novidades
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', maxWidth: 440, margin: '0 auto' }} className="newsletter-form">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="seu@email.com"
                aria-label="Email para newsletter"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                  padding: '0.875rem 1rem',
                  fontSize: '0.875rem',
                  color: colors.text,
                  outline: 'none',
                  transition: transitions.theme,
                }}
              />
              <button
                type="button"
                style={{
                  background: '#e50914',
                  color: '#fff',
                  border: 'none',
                  padding: '0.875rem 1.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#c40812'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#e50914'; }}
              >
                Enviar
              </button>
            </div>
            <p style={{ color: colors.textMuted, fontSize: '0.75rem', marginTop: '1rem', opacity: 0.6, transition: transitions.theme }}>
              Respeitamos sua privacidade. Sem spam.
            </p>
          </div>
        </section>

        {/* ─── SECTION 6: Footer ──────────────────────────── */}
        <footer
          style={{
            background: isDark ? '#0a0a0a' : '#f5f5f5',
            padding: '4rem 2rem 2rem',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            transition: transitions.theme,
          }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div className="footer-grid">
              {/* Legal */}
              <div>
                <h4 style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', transition: transitions.theme }}>Legal</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Termos de Uso', 'Política de Privacidade', 'Política de Cookies'].map((t) => (
                    <li key={t}><span style={{ color: colors.textMuted, fontSize: '0.8rem', cursor: 'pointer', transition: transitions.theme }}>{t}</span></li>
                  ))}
                </ul>
              </div>
              {/* Privacidade */}
              <div>
                <h4 style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', transition: transitions.theme }}>Privacidade</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Preferências de Cookies', 'Informações Corporativas', 'LGPD'].map((t) => (
                    <li key={t}><span style={{ color: colors.textMuted, fontSize: '0.8rem', cursor: 'pointer', transition: transitions.theme }}>{t}</span></li>
                  ))}
                </ul>
              </div>
              {/* Suporte */}
              <div>
                <h4 style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', transition: transitions.theme }}>Suporte</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Central de Ajuda', 'Fale Conosco', 'Status do Serviço'].map((t) => (
                    <li key={t}><span style={{ color: colors.textMuted, fontSize: '0.8rem', cursor: 'pointer', transition: transitions.theme }}>{t}</span></li>
                  ))}
                </ul>
              </div>
              {/* Empresa */}
              <div>
                <h4 style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', transition: transitions.theme }}>Empresa</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {['Sobre Nós', 'Carreiras', 'Parceiros'].map((t) => (
                    <li key={t}><span style={{ color: colors.textMuted, fontSize: '0.8rem', cursor: 'pointer', transition: transitions.theme }}>{t}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Social + Copyright */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: colors.textMuted, fontSize: '0.8rem', marginRight: '0.5rem', transition: transitions.theme }}>Siga-nos</span>
                {/* Instagram */}
                <a href="#" aria-label="Instagram" style={{ color: colors.textMuted, transition: transitions.theme }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a href="#" aria-label="YouTube" style={{ color: colors.textMuted, transition: transitions.theme }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="#" aria-label="Facebook" style={{ color: colors.textMuted, transition: transitions.theme }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
              </div>
              <p style={{ color: colors.textMuted, fontSize: '0.75rem', opacity: 0.5, margin: 0, transition: transitions.theme }}>
                &copy; 2026 BlackBelt. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </footer>

      </div>{/* end marketing sections */}

      {/* ─── Responsive styles ────────────────────────────── */}
      <style jsx global>{`
        .login-card-responsive {
          width: 92%;
          max-width: 480px;
        }
        @media (min-width: 768px) {
          .login-card-responsive {
            width: 70%;
          }
        }
        @media (min-width: 1024px) {
          .login-card-responsive {
            width: 58%;
            max-width: 480px;
          }
        }
        input::placeholder {
          color: inherit;
          opacity: 0.4;
        }
        /* Top 10 scrollbar */
        .top10-scroll::-webkit-scrollbar {
          height: 4px;
        }
        .top10-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .top10-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.15);
          border-radius: 2px;
        }
        /* Recentes grid */
        .recentes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .recentes-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .recentes-grid {
            grid-template-columns: repeat(5, 1fr);
          }
        }
        /* Features grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        /* Footer grid */
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        /* Newsletter form */
        @media (max-width: 480px) {
          .newsletter-form {
            flex-direction: column;
          }
        }
        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
            animation-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
