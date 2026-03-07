'use client';

import { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getRedirectForProfile } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { transitions } from '@/styles/transitions';
import { logger } from '@/lib/logger';
import { Users, DollarSign, TrendingUp, Mail, Phone, Clock, HelpCircle, ChevronDown as ChevronDownLucide } from 'lucide-react';
import { AnimatedCounter } from '@/components/transitions/AnimatedCounter';

import { useTranslations } from 'next-intl';

// ─── Types ──────────────────────────────────────────────────
type LoginStep = 'INITIAL' | 'EMAIL' | 'PASSWORD' | 'LOADING' | 'ERROR';

// ─── Demo users ─────────────────────────────────────────────
const DEMO_USERS = [
  { label: 'Super Admin', email: 'superadmin@blackbelt.com', senha: 'blackbelt123', icon: '👑', gradient: 'from-yellow-600 to-yellow-800' },
  { label: 'Admin',       email: 'admin@blackbelt.com',      senha: 'blackbelt123', icon: '🛠️', gradient: 'from-orange-600 to-orange-800' },
  { label: 'Professor',   email: 'professor@blackbelt.com',  senha: 'blackbelt123', icon: '👨‍🏫', gradient: 'from-indigo-600 to-indigo-800' },
  { label: 'Adulto',      email: 'adulto@blackbelt.com',     senha: 'blackbelt123', icon: '👤', gradient: 'from-blue-600 to-blue-800' },
  { label: 'Teen',        email: 'miguel@blackbelt.com',     senha: 'blackbelt123', icon: '🧑', gradient: 'from-purple-600 to-purple-800' },
  { label: 'Kids',        email: 'kid@blackbelt.com',        senha: 'blackbelt123', icon: '👶', gradient: 'from-pink-600 to-pink-800' },
  { label: 'Responsável', email: 'paiteen@blackbelt.com',    senha: 'blackbelt123', icon: '👨‍👩‍👧', gradient: 'from-green-600 to-green-800' },
  { label: 'Support',     email: 'support@blackbelt.com',    senha: 'blackbelt123', icon: '🎧', gradient: 'from-teal-600 to-teal-800' },
  { label: 'Unit Owner',  email: 'owner@blackbelt.com',      senha: 'blackbelt123', icon: '🏢', gradient: 'from-slate-600 to-slate-800' },
] as const;

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

function ChevronDownIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
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

// ─── Landing page data ──────────────────────────────────────
const MODALITIES = [
  { emoji: '🥋', name: 'Jiu-Jitsu' },
  { emoji: '🥊', name: 'Muay Thai' },
  { emoji: '🥊', name: 'Boxe' },
  { emoji: '🥋', name: 'Judô' },
  { emoji: '🥋', name: 'Karatê' },
  { emoji: '🤼', name: 'Wrestling' },
  { emoji: '👊', name: 'MMA' },
  { emoji: '🤸', name: 'Capoeira' },
  { emoji: '🦶', name: 'Taekwondo' },
  { emoji: '🥋', name: 'Aikidô' },
  { emoji: '🔪', name: 'Krav Magá' },
  { emoji: '🥋', name: 'Kung Fu' },
];

const FAQ_ITEMS = [
  {
    question: 'Como cadastrar minha academia?',
    answer: 'Basta clicar em "Comece Grátis", preencher os dados da sua academia e em poucos minutos você já estará utilizando a plataforma. Oferecemos suporte completo durante todo o processo de onboarding.',
  },
  {
    question: 'Posso testar grátis?',
    answer: 'Sim! Oferecemos 14 dias de teste grátis em todos os planos, sem necessidade de cartão de crédito. Você pode explorar todas as funcionalidades antes de decidir.',
  },
  {
    question: 'Quais formas de pagamento?',
    answer: 'Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex), boleto bancário, PIX e transferência bancária. Planos anuais possuem desconto especial.',
  },
];

// ─── Main export ────────────────────────────────────────────
export default function PremiumLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

// ─── FAQ Accordion Item ─────────────────────────────────────
function FaqItem({ question, answer, isDark, colors }: {
  question: string;
  answer: string;
  isDark: boolean;
  colors: ReturnType<typeof getDesignTokens>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        border: `1px solid ${isDark ? '#222' : '#e0e0e0'}`,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: colors.text,
          fontSize: '0.95rem',
          fontWeight: 500,
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        {question}
        <ChevronDownLucide
          size={18}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
            opacity: 0.5,
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? 200 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
        }}
      >
        <p style={{
          padding: '0 1.25rem 1rem',
          fontSize: '0.875rem',
          color: colors.textMuted,
          lineHeight: 1.6,
          margin: 0,
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

// ─── Login Content ──────────────────────────────────────────
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');

  // ─── State machine ────────────────────────────────────────
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sobreRef = useRef<HTMLDivElement>(null);

  // Slide direction for transitions
  const [slideDir, setSlideDir] = useState<'left' | 'right' | 'none'>('none');
  const [cardVisible, setCardVisible] = useState(true);

  // ─── Theme-aware colors (from shared design tokens) ──────
  const colors = getDesignTokens(isDark);

  // Shared card style
  const sectionCard: React.CSSProperties = {
    border: `1px solid ${isDark ? '#222' : '#e0e0e0'}`,
    borderRadius: 16,
    background: colors.cardBg,
    backdropFilter: 'blur(12px) saturate(1.2)',
    WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
    padding: '2rem',
    transition: transitions.theme,
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

  // ─── Close dropdown on click outside ──────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showDropdown]);

  // ─── Go to email step ────────────────────────────────────
  const goToEmail = useCallback(() => {
    setStep('EMAIL');
    setError('');
  }, []);

  // ─── Email validation ─────────────────────────────────────
  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  // ─── Select demo user ─────────────────────────────────────
  const selectDemoUser = useCallback((demoUser: typeof DEMO_USERS[number]) => {
    setEmail(demoUser.email);
    setPassword(demoUser.senha);
    setError('');
    setShowDropdown(false);
    setCardVisible(false);
    setSlideDir('left');
    setTimeout(() => {
      setStep('PASSWORD');
      setSlideDir('right');
      setTimeout(() => setCardVisible(true), 20);
    }, 350);
  }, []);

  // ─── Step transitions ─────────────────────────────────────
  const goToPassword = useCallback(async () => {
    if (!email.trim() || !validateEmail(email)) {
      setEmailInvalid(true);
      setError(t('login.emailNotFound'));
      setTimeout(() => setEmailInvalid(false), 600);
      return;
    }

    setEmailInvalid(false);
    setError('');

    try {
      const res = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!data.exists) {
        setEmailInvalid(true);
        setError(t('login.emailNotFound'));
        setTimeout(() => setEmailInvalid(false), 600);
        return;
      }
    } catch {
      // If API unavailable, allow through (fallback)
    }

    setCardVisible(false);
    setSlideDir('left');
    setTimeout(() => {
      setStep('PASSWORD');
      setSlideDir('right');
      setTimeout(() => setCardVisible(true), 20);
    }, 350);
  }, [email, t]);

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
    if (!password) { setError(t('login.passwordPlaceholder')); return; }
    setError('');
    setStep('LOADING');

    try {
      const tipo = await login(email, password);
      if (tipo) {
        logger.info('[Login]', 'Login OK ->', getRedirectForProfile(tipo));
        router.replace(getRedirectForProfile(tipo));
      } else {
        setError(t('login.invalidCredentials'));
        setStep('ERROR');
      }
    } catch (err) {
      logger.error('[Login]', 'Login error:', err);
      setError(tCommon('errors.generic'));
      setStep('ERROR');
    }
  }, [email, password, login, router, t, tCommon]);

  // ─── Form submit handlers ────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await goToPassword();
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

  const scrollToSobre = () => {
    sobreRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ─── Defer render until mounted ───────────────────────────
  if (!mounted) return null;

  const isLoginFlow = step !== 'INITIAL';

  // ─── Render ───────────────────────────────────────────────
  return (
    <div style={{ position: 'relative', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* ─── Background Layer ─────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }} aria-hidden="true">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: isDark ? '#0a0a0a' : '#f5f5f5',
            transition: 'background-color 0.5s ease',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: colors.overlay,
            transition: transitions.theme,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)',
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════
          HERO — First viewport: Login button + bouncing arrow
          ═══════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
        }}
      >
        {/* ─── STEP: INITIAL ─────────────────────────────── */}
        {step === 'INITIAL' && (
          <>
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
                  fontWeight: 600,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  borderRadius: 12,
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

            {/* Bouncing arrow at bottom */}
            <button
              onClick={scrollToSobre}
              style={{
                position: 'absolute',
                bottom: '2rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                animation: 'bounceArrow 2s ease-in-out infinite',
              }}
            >
              <span style={{
                fontSize: '0.75rem',
                color: colors.textMuted,
                letterSpacing: '0.1em',
              }}>
                Saiba mais
              </span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </>
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
                  aria-label={tCommon('actions.goBack')}
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
                    borderRadius: 12,
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
                  <div style={{ padding: '2rem 2rem 1.5rem' }}>
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
                      {t('login.title').toUpperCase()}
                    </h2>

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

                    {/* Email input with dropdown arrow */}
                    <div style={{ position: 'relative' }} ref={dropdownRef}>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); setEmailInvalid(false); }}
                        placeholder="Email address"
                        autoFocus
                        autoComplete="email"
                        required
                        aria-label="Email"
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `1px solid ${emailInvalid ? colors.error : colors.inputBorder}`,
                          padding: '0.75rem 2.5rem 0.75rem 0',
                          fontSize: '1rem',
                          color: emailInvalid ? colors.error : colors.text,
                          outline: 'none',
                          transition: 'all 0.3s ease',
                        }}
                        onFocus={(e) => {
                          if (!emailInvalid) e.currentTarget.style.borderBottomColor = colors.inputFocus;
                        }}
                        onBlur={(e) => {
                          if (!emailInvalid) e.currentTarget.style.borderBottomColor = colors.inputBorder;
                        }}
                      />
                      {/* Dropdown arrow */}
                      <button
                        type="button"
                        onClick={() => setShowDropdown(!showDropdown)}
                        aria-label="Select demo user"
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '50%',
                          transform: `translateY(-50%) rotate(${showDropdown ? '180deg' : '0deg'})`,
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        <ChevronDownIcon color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
                      </button>

                      {/* Dropdown menu */}
                      {showDropdown && (
                        <div
                          onTouchMove={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: 4,
                            background: isDark ? '#1a1a2e' : '#ffffff',
                            border: `1px solid ${colors.cardBorder}`,
                            borderRadius: 8,
                            zIndex: 9999,
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                          }}
                        >
                          {DEMO_USERS.map((u) => (
                            <button
                              key={u.email}
                              type="button"
                              onClick={() => selectDemoUser(u)}
                              style={{
                                width: '100%',
                                padding: '0.625rem 1rem',
                                border: 'none',
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                background: 'transparent',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textAlign: 'left',
                                transition: 'background 0.15s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <span className="text-lg">{u.icon}</span>
                              <div>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.text, display: 'block' }}>
                                  {u.label}
                                </span>
                                <span style={{ fontSize: '0.72rem', color: colors.textMuted }}>
                                  {u.email}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {emailInvalid && (
                      <p
                        style={{
                          color: colors.error,
                          fontSize: '0.75rem',
                          marginTop: '0.4rem',
                          marginBottom: 0,
                          opacity: 0.85,
                          animation: 'shake 0.4s cubic-bezier(.36,.07,.19,.97)',
                        }}
                      >
                        {t('login.emailNotFound')}
                      </p>
                    )}

                    {/* Remember me + Criar conta + Forgot email */}
                    {/* Mobile: LINE 1 Lembrar-me centered | LINE 2 Criar conta LEFT + Esqueci email RIGHT */}
                    <div className="flex flex-col items-center gap-2 md:hidden" style={{ marginTop: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: colors.textMuted, cursor: 'pointer', transition: transitions.theme }}>
                        <input type="checkbox" className="w-3 h-3 md:w-4 md:h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
                        Lembrar-me
                      </label>
                      <div className="flex items-center justify-between w-full">
                        <Link
                          href="/cadastro"
                          style={{
                            fontSize: '0.875rem',
                            color: colors.text,
                            opacity: 0.5,
                            textDecoration: 'none',
                            transition: transitions.theme,
                          }}
                        >
                          {t('login.createAccount')}
                        </Link>
                        <Link
                          href="/esqueci-email"
                          style={{
                            fontSize: '0.875rem',
                            color: colors.linkColor,
                            textDecoration: 'none',
                            transition: transitions.theme,
                          }}
                        >
                          {t('login.forgotEmail')}
                        </Link>
                      </div>
                    </div>
                    {/* Desktop: original layout with Criar conta centered */}
                    <div className="hidden md:flex md:flex-col md:items-center md:gap-3" style={{ marginTop: '1.5rem' }}>
                      <div className="flex items-center justify-between w-full">
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.textMuted, cursor: 'pointer', transition: transitions.theme }}>
                          <input type="checkbox" className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
                          Remember me
                        </label>
                        <Link
                          href="/esqueci-email"
                          style={{
                            fontSize: '0.875rem',
                            color: colors.linkColor,
                            textDecoration: 'none',
                            transition: transitions.theme,
                          }}
                        >
                          {t('login.forgotEmail')}
                        </Link>
                      </div>
                      <Link
                        href="/cadastro"
                        style={{
                          fontSize: '0.875rem',
                          color: colors.text,
                          opacity: 0.5,
                          textDecoration: 'none',
                          transition: transitions.theme,
                        }}
                      >
                        {t('login.createAccount')}
                      </Link>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: colors.cardBorder, transition: transitions.theme }} />

                  {/* SSO buttons at bottom */}
                  <div style={{ display: 'flex' }}>
                    <button
                      type="button"
                      aria-label={t('login.loginWithGoogle')}
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
                      aria-label={t('login.loginWithApple')}
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
              <div
                style={{
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: colors.cardBg,
                  backdropFilter: 'blur(12px) saturate(1.2)',
                  WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                  transition: transitions.theme,
                }}
              >
                {/* Conteudo superior */}
                <div style={{ padding: '2.5rem 2rem 1.5rem', position: 'relative' }}>
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={tCommon('actions.goBack')}
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
                      opacity: 0.6,
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
                        transition: transitions.fadeIn,
                      }}
                    >
                      {error}
                    </p>
                  )}

                  {/* Password input */}
                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
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
                      {t('login.password')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder={t('login.passwordPlaceholder')}
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
                        aria-label={showPassword ? tCommon('actions.hidePassword') : tCommon('actions.showPassword')}
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
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Link
                      href="/esqueci-senha"
                      style={{
                        fontSize: '0.8rem',
                        color: colors.linkColor,
                        textDecoration: 'none',
                        transition: transitions.theme,
                      }}
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </div>
                </div>

                {/* Linha divisoria */}
                <div style={{ height: 1, background: colors.cardBorder }} />

                {/* Botao ENTRAR na base do card */}
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: 52,
                    border: 'none',
                    background: 'transparent',
                    color: colors.text,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {t('login.loginButton').toUpperCase()}
                </button>
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
                  borderRadius: 12,
                  overflow: 'hidden',
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
                  {tCommon('actions.entering')}
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
              <div
                style={{
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: colors.cardBg,
                  backdropFilter: 'blur(12px) saturate(1.2)',
                  WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
                  transition: transitions.theme,
                }}
              >
                <div style={{ padding: '2.5rem 2rem 1.5rem', position: 'relative' }}>
                  <button
                    type="button"
                    onClick={goBackToEmail}
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    aria-label={tCommon('actions.goBack')}
                  >
                    <BackArrowIcon color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)'} />
                  </button>

                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: colors.textMuted,
                      marginBottom: '1.5rem',
                      textAlign: 'center',
                      opacity: 0.6,
                      transition: transitions.theme,
                    }}
                  >
                    {email}
                  </p>

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

                  <div style={{ marginBottom: '1rem', position: 'relative' }}>
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
                      {t('login.password')}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password-retry"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(''); }}
                        placeholder={t('login.passwordPlaceholder')}
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
                        aria-label={showPassword ? tCommon('actions.hidePassword') : tCommon('actions.showPassword')}
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

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Link
                      href="/esqueci-senha"
                      style={{
                        fontSize: '0.8rem',
                        color: colors.linkColor,
                        textDecoration: 'none',
                        transition: transitions.theme,
                      }}
                    >
                      {t('login.forgotPassword')}
                    </Link>
                  </div>
                </div>

                <div style={{ height: 1, background: colors.cardBorder }} />

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    height: 52,
                    border: 'none',
                    background: 'transparent',
                    color: colors.text,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {t('login.loginButton').toUpperCase()}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Footer (login flow only) ─────────────────── */}
        {isLoginFlow && <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: colors.textMuted,
            marginTop: '2rem',
            opacity: 0.6,
            transition: transitions.theme,
          }}
        >
          {t('login.termsAgreement')}
        </p>}
      </div>

      {/* ═══════════════════════════════════════════════════════
          LANDING SECTIONS — Only visible on INITIAL step
          ═══════════════════════════════════════════════════════ */}
      {!isLoginFlow && (
        <div style={{ position: 'relative', zIndex: 10 }}>

          {/* ─── SEÇÃO 1 — SOBRE ──────────────────────────── */}
          <section
            ref={sobreRef}
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
              fontWeight: 600,
              textAlign: 'center',
              maxWidth: 600,
              marginBottom: '3rem',
              lineHeight: 1.4,
              transition: transitions.theme,
            }}>
              A plataforma completa para gestão de academias de artes marciais
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 900, width: '100%' }}>
              {[
                { Icon: Users, title: 'Gestão de Alunos', desc: 'Cadastro completo, controle de frequência, graduações e acompanhamento individual de cada aluno da sua academia.' },
                { Icon: DollarSign, title: 'Controle Financeiro', desc: 'Mensalidades, cobranças automatizadas, relatórios financeiros e gestão completa do fluxo de caixa.' },
                { Icon: TrendingUp, title: 'Acompanhamento de Evolução', desc: 'Métricas de progresso, histórico de graduações, análise de desempenho e insights com inteligência artificial.' },
              ].map((item) => (
                <div key={item.title} style={sectionCard}>
                  <item.Icon size={32} style={{ color: colors.text, marginBottom: '1rem' }} />
                  <h3 style={{ color: colors.text, fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: colors.textMuted, fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 2 — PLANOS ─────────────────────────── */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '3rem',
              transition: transitions.theme,
            }}>
              Planos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1000, width: '100%' }}>
              {[
                {
                  name: 'Starter',
                  price: 'R$ 197',
                  period: '/mês',
                  features: ['Até 50 alunos', '2 professores', '3 modalidades', 'Relatórios básicos'],
                  popular: false,
                },
                {
                  name: 'Professional',
                  price: 'R$ 497',
                  period: '/mês',
                  features: ['Até 200 alunos', '10 professores', 'Modalidades ilimitadas', 'AI Insights', 'Relatórios avançados'],
                  popular: true,
                },
                {
                  name: 'Enterprise',
                  price: 'R$ 997',
                  period: '/mês',
                  features: ['Alunos ilimitados', 'Professores ilimitados', 'White-label', 'API completa', 'Suporte prioritário'],
                  popular: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  style={{
                    ...sectionCard,
                    border: plan.popular
                      ? `2px solid ${isDark ? '#fff' : '#111'}`
                      : sectionCard.border,
                    position: 'relative',
                  }}
                >
                  {plan.popular && (
                    <span style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: isDark ? '#fff' : '#111',
                      color: isDark ? '#111' : '#fff',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '0.25rem 1rem',
                      borderRadius: 20,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}>
                      Mais Popular
                    </span>
                  )}
                  <h3 style={{ color: colors.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <span style={{ color: colors.text, fontSize: '2rem', fontWeight: 600 }}>{plan.price}</span>
                    <span style={{ color: colors.textMuted, fontSize: '0.875rem' }}>{plan.period}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ color: colors.textMuted, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: colors.text }}>&#10003;</span> {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${isDark ? '#444' : '#ccc'}`,
                      borderRadius: 10,
                      background: plan.popular ? (isDark ? '#fff' : '#111') : 'transparent',
                      color: plan.popular ? (isDark ? '#111' : '#fff') : colors.text,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.05em',
                    }}
                  >
                    Comece Grátis
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 3 — MODALIDADES ────────────────────── */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '3rem',
              transition: transitions.theme,
            }}>
              Modalidades Suportadas
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4" style={{ maxWidth: 700, width: '100%' }}>
              {MODALITIES.map((m) => (
                <div
                  key={m.name}
                  style={{
                    border: `1px solid ${isDark ? '#222' : '#e0e0e0'}`,
                    borderRadius: 16,
                    background: colors.cardBg,
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    transition: transitions.theme,
                  }}
                >
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>{m.emoji}</span>
                  <span style={{ color: colors.text, fontSize: '0.8rem', fontWeight: 500 }}>{m.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 4 — NÚMEROS ────────────────────────── */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '3rem',
              transition: transitions.theme,
            }}>
              Números da Plataforma
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6" style={{ maxWidth: 900, width: '100%' }}>
              {[
                { value: 500, prefix: '+', label: 'Academias' },
                { value: 50000, prefix: '+', label: 'Alunos' },
                { value: 1000000, prefix: '+', label: 'Check-ins' },
                { value: 10000, prefix: '+', label: 'Graduações' },
              ].map((stat) => (
                <div key={stat.label} style={{ ...sectionCard, textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 600, color: colors.text, marginBottom: '0.5rem' }}>
                    <AnimatedCounter
                      value={stat.value}
                      prefix={stat.prefix}
                      duration={2}
                    />
                  </div>
                  <span style={{ color: colors.textMuted, fontSize: '0.875rem' }}>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 5 — DEPOIMENTOS ────────────────────── */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '3rem',
              transition: transitions.theme,
            }}>
              O que dizem nossos clientes
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: 1000, width: '100%' }}>
              {[
                {
                  name: 'Prof. Carlos Silva',
                  academy: 'Academia Força BJJ',
                  text: 'O BlackBelt transformou completamente a gestão da minha academia. Antes eu perdia horas com planilhas, hoje tudo é automatizado. A funcionalidade de acompanhamento de evolução dos alunos é incrível.',
                },
                {
                  name: 'Mestre Ana Rodrigues',
                  academy: 'Centro de Artes Marciais Bushido',
                  text: 'Desde que adotamos o BlackBelt, a retenção de alunos aumentou 40%. Os pais adoram acompanhar o progresso dos filhos pelo app. O controle financeiro nos deu uma visão que nunca tivemos.',
                },
                {
                  name: 'Sensei Ricardo Tanaka',
                  academy: 'Tanaka Dojo',
                  text: 'A plataforma é intuitiva e completa. O suporte é excepcional — sempre respondem rápido e implementam nossas sugestões. Recomendo para qualquer academia que queira crescer profissionalmente.',
                },
              ].map((t) => (
                <div key={t.name} style={sectionCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: isDark ? '#333' : '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0,
                    }}>
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>{t.name}</p>
                      <p style={{ color: colors.textMuted, fontSize: '0.75rem', margin: 0 }}>{t.academy}</p>
                    </div>
                  </div>
                  <p style={{ color: colors.textMuted, fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                    &ldquo;{t.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 6 — SUPORTE ────────────────────────── */}
          <section
            style={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 1.5rem',
            }}
          >
            <h2 style={{
              color: colors.text,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 600,
              textAlign: 'center',
              marginBottom: '3rem',
              transition: transitions.theme,
            }}>
              Suporte e Contato
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" style={{ maxWidth: 900, width: '100%', marginBottom: '2.5rem' }}>
              {[
                { Icon: Mail, label: 'Email', value: 'suporte@blackbelt.app' },
                { Icon: Phone, label: 'WhatsApp', value: '+55 31 99999-9999' },
                { Icon: Clock, label: 'Horário', value: 'Seg-Sex 8h-18h' },
                { Icon: HelpCircle, label: 'Central de Ajuda', value: 'help.blackbelt.app' },
              ].map((c) => (
                <div key={c.label} style={{ ...sectionCard, textAlign: 'center' }}>
                  <c.Icon size={24} style={{ color: colors.text, marginBottom: '0.75rem' }} />
                  <p style={{ color: colors.text, fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{c.label}</p>
                  <p style={{ color: colors.textMuted, fontSize: '0.8rem', margin: 0 }}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div style={{ maxWidth: 600, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ color: colors.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Perguntas Frequentes
              </h3>
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.question} question={item.question} answer={item.answer} isDark={isDark} colors={colors} />
              ))}
            </div>
          </section>

          {/* ─── SEÇÃO 7 — FOOTER ─────────────────────────── */}
          <footer
            style={{
              padding: '3rem 1.5rem',
              textAlign: 'center',
              borderTop: `1px solid ${isDark ? '#222' : '#e0e0e0'}`,
            }}
          >
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '1.5rem',
              marginBottom: '1.5rem',
            }}>
              {['Termos de Uso', 'Política de Privacidade', 'LGPD', 'Instagram', 'Facebook'].map((link) => (
                <a
                  key={link}
                  href="#"
                  style={{
                    color: colors.textMuted,
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    transition: 'opacity 0.2s ease',
                  }}
                >
                  {link}
                </a>
              ))}
            </div>
            <p style={{ color: colors.textMuted, fontSize: '0.8rem', margin: '0 0 0.5rem', opacity: 0.7 }}>
              Feito com ❤️ no Brasil
            </p>
            <p style={{ color: colors.textMuted, fontSize: '0.75rem', margin: 0, opacity: 0.5 }}>
              © 2026 BlackBelt — Todos os direitos reservados
            </p>
          </footer>
        </div>
      )}

      {/* ─── Responsive + animation styles ──────────────── */}
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
        /* Shake animation */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        /* Bounce arrow animation */
        @keyframes bounceArrow {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(-12px); }
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
