'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth, getRedirectForProfile } from '@/features/auth/context/AuthContext';
import { logger } from '@/lib/logger';
import { signInWithApple, signInWithGoogle } from '@/lib/auth/oauth';
import type { LoginStep } from './LoginStateMachine';
import { isDemoUserEmail, SHOW_DEMO_USERS } from './demoUsers';

const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function useLoginController(shouldReduceMotion: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const [step, setStep] = useState<LoginStep>('INITIAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const sobreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectForProfile(user.tipo));
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (searchParams.get('cadastro') === 'sucesso') {
      setStep('EMAIL');
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [showDropdown]);

  const goToEmail = useCallback(() => {
    setStep('EMAIL');
    setError('');
  }, []);

  const goToPassword = useCallback(async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !validateEmail(normalizedEmail)) {
      setEmailInvalid(true);
      setError(t('login.emailNotFound'));
      setTimeout(() => setEmailInvalid(false), shouldReduceMotion ? 100 : 500);
      return;
    }

    if (SHOW_DEMO_USERS && isDemoUserEmail(normalizedEmail)) {
      setEmail(normalizedEmail);
      setEmailInvalid(false);
      setError('');
      setStep('PASSWORD');
      return;
    }

    setEmailInvalid(false);
    setError('');

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();

      if (!data.exists) {
        setEmailInvalid(true);
        setError(t('login.emailNotFound'));
        setTimeout(() => setEmailInvalid(false), shouldReduceMotion ? 100 : 600);
        return;
      }
    } catch {}

    setStep('PASSWORD');
  }, [email, setEmail, shouldReduceMotion, t]);

  const goBackToEmail = useCallback(() => {
    setError('');
    setPassword('');
    setStep('EMAIL');
  }, []);

  const handleLogin = useCallback(async () => {
    if (!password) {
      setError(t('login.passwordPlaceholder'));
      return;
    }

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
    } catch (loginError) {
      logger.error('[Login]', 'Login error:', loginError);
      setError(tCommon('errors.generic'));
      setStep('ERROR');
    }
  }, [email, login, password, router, t, tCommon]);

  const handleEmailSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    await goToPassword();
  }, [goToPassword]);

  const handlePasswordSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    void handleLogin();
  }, [handleLogin]);

  const scrollToSobre = useCallback(() => {
    sobreRef.current?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  }, [shouldReduceMotion]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsOAuthLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (oauthError) {
      const message = oauthError instanceof Error ? oauthError.message : 'Falha no login com Google';
      setError(message);
      setIsOAuthLoading(false);
      logger.error('[Login]', 'Google sign-in error:', oauthError);
    }
  }, []);

  const handleAppleSignIn = useCallback(async () => {
    try {
      setIsOAuthLoading(true);
      setError('');
      await signInWithApple();
    } catch (oauthError) {
      const message = oauthError instanceof Error ? oauthError.message : 'Falha no login com Apple';
      setError(message);
      setIsOAuthLoading(false);
      logger.error('[Login]', 'Apple sign-in error:', oauthError);
    }
  }, []);

  return {
    dropdownRef,
    email,
    emailInvalid,
    error,
    goBackToEmail,
    goToEmail,
    handleAppleSignIn,
    handleEmailSubmit,
    handleGoogleSignIn,
    handleLogin,
    handlePasswordSubmit,
    isOAuthLoading,
    mounted,
    password,
    scrollToSobre,
    setEmail,
    setEmailInvalid,
    setError,
    setPassword,
    setShowDropdown,
    setShowPassword,
    setStep,
    showDropdown,
    showPassword,
    sobreRef,
    step,
  };
}
