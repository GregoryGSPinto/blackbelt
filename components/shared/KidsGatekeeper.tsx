'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Shield, Fingerprint, X, Delete, Lock, CheckCircle,
  AlertCircle, Loader2, Mail, KeyRound, ArrowLeft, Eye, EyeOff,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';

interface KidsGatekeeperProps {
  onSuccess: () => void;
  onCancel: () => void;
  isOpen: boolean;
  hideCancelButton?: boolean;
}

// ============================================================
// PIN Storage — localStorage com fallback "1234"
// TODO(FE-023): Migrar para GET/PUT /parent/profile (campo pinParental)
// ============================================================

const PIN_STORAGE_KEY = 'blackbelt-kids-pin';
const PIN_DEFAULT = '1234';
const CREDENTIAL_KEY = 'blackbelt-kids-bio-cred';

// Mock: email do responsável (virá do backend)
const PARENT_EMAIL = 'responsavel@email.com';
// Mock: código de verificação (virá do backend via email)
const MOCK_VERIFY_CODE = '123456';

function getStoredPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || PIN_DEFAULT;
  } catch {
    return PIN_DEFAULT;
  }
}

function savePin(pin: string): void {
  try { localStorage.setItem(PIN_STORAGE_KEY, pin); } catch { /* ok */ }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***@***.com';
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

// ============================================================
// WebAuthn
// ============================================================

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))));
}

function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

async function checkBiometricSupport(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    if (!window.isSecureContext) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

function getSavedCredential(): string | null {
  try { return localStorage.getItem(CREDENTIAL_KEY); } catch { return null; }
}

function saveCredential(id: string): void {
  try { localStorage.setItem(CREDENTIAL_KEY, id); } catch { /* ok */ }
}

function clearCredential(): void {
  try { localStorage.removeItem(CREDENTIAL_KEY); } catch { /* ok */ }
}

async function webauthnRegister(): Promise<{ ok: boolean; credentialId?: string; error?: string }> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const hostname = window.location.hostname;

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'BlackBelt', id: hostname },
        user: { id: userId, name: 'responsavel@blackbelt', displayName: 'Responsavel' },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'discouraged',
        },
        timeout: 120000,
        attestation: 'none',
      },
    });

    if (!credential) return { ok: false, error: 'No credential created.' };
    const cred = credential as PublicKeyCredential;
    const credId = toBase64(cred.rawId);
    saveCredential(credId);
    return { ok: true, credentialId: credId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NotAllowed') || msg.includes('cancelled') || msg.includes('abort')) {
      return { ok: false, error: 'cancel' };
    }
    return { ok: false, error: msg };
  }
}

async function webauthnAuthenticate(credentialIdB64: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const hostname = window.location.hostname;

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: hostname,
        allowCredentials: [{
          id: fromBase64(credentialIdB64),
          type: 'public-key',
          transports: ['internal'],
        }],
        userVerification: 'required',
        timeout: 120000,
      },
    });

    return { ok: !!assertion };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('NotAllowed') || msg.includes('cancelled') || msg.includes('abort')) {
      return { ok: false, error: 'cancel' };
    }
    return { ok: false, error: msg };
  }
}

// ============================================================
// Keypad Keys — shared between PIN entry and PIN creation
// ============================================================

const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// ============================================================
// Component
// ============================================================

type GatekeeperMode = 'pin' | 'biometric' | 'forgot';
type ForgotStep = 'confirm' | 'code' | 'newPin' | 'confirmPin' | 'done';

export function KidsGatekeeper({
  onSuccess, onCancel, isOpen, hideCancelButton = false,
}: KidsGatekeeperProps) {
  const t = useTranslations('kids.gatekeeper');
  const { isDark } = useTheme();
  const [mode, setMode] = useState<GatekeeperMode>('pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [shake, setShake] = useState(false);

  // Biometric
  const [bioSupported, setBioSupported] = useState<boolean | null>(null);
  const [bioStatus, setBioStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [bioMessage, setBioMessage] = useState('');
  const isBioRunning = useRef(false);

  // Forgot PIN
  const [forgotStep, setForgotStep] = useState<ForgotStep>('confirm');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);

  // Check biometric
  useEffect(() => {
    checkBiometricSupport().then(ok => setBioSupported(ok));
  }, []);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
      setMode('pin');
      setBioStatus('idle');
      setBioMessage('');
      isBioRunning.current = false;
      resetForgotState();
    }
  }, [isOpen]);

  // Lock timer
  useEffect(() => {
    if (lockTimer > 0) {
      const t = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(t);
    } else if (lockTimer === 0 && locked) {
      setLocked(false);
      setAttempts(0);
    }
  }, [lockTimer, locked]);

  function resetForgotState() {
    setForgotStep('confirm');
    setVerifyCode('');
    setNewPin('');
    setConfirmNewPin('');
    setForgotError('');
    setForgotLoading(false);
    setShowNewPin(false);
  }

  // ─── Biometric ───
  const triggerBiometric = useCallback(async () => {
    if (isBioRunning.current) return;
    isBioRunning.current = true;
    setBioStatus('verifying');
    setBioMessage(t('placeFinger'));

    const savedCred = getSavedCredential();

    if (savedCred) {
      const result = await webauthnAuthenticate(savedCred);
      if (!isBioRunning.current) return;

      if (result.ok) {
        setBioStatus('success');
        setBioMessage(t('identityVerified'));
        setTimeout(() => onSuccess(), 500);
        return;
      }

      if (result.error === 'cancel') {
        setBioStatus('idle');
        setBioMessage('');
        isBioRunning.current = false;
        return;
      }

      clearCredential();
    }

    setBioMessage(t('registeringBiometric'));
    const regResult = await webauthnRegister();
    if (!isBioRunning.current) return;

    if (regResult.ok) {
      setBioStatus('success');
      setBioMessage(t('biometricRegistered'));
      setTimeout(() => onSuccess(), 500);
      return;
    }

    if (regResult.error === 'cancel') {
      setBioStatus('idle');
      setBioMessage('');
      isBioRunning.current = false;
      return;
    }

    setBioStatus('error');
    setBioMessage(regResult.error || t('biometricError'));
    isBioRunning.current = false;
  }, [onSuccess]);

  useEffect(() => {
    if (mode === 'biometric' && bioSupported && isOpen && bioStatus === 'idle') {
      const t = setTimeout(() => triggerBiometric(), 400);
      return () => clearTimeout(t);
    }
  }, [mode, bioSupported, isOpen, bioStatus, triggerBiometric]);

  // ─── PIN Logic ───
  const handlePinInput = useCallback((digit: string) => {
    if (locked) return;
    setError('');

    setPin(prev => {
      const newPinVal = prev + digit;
      if (newPinVal.length === 4) {
        setTimeout(() => {
          const stored = getStoredPin();
          if (newPinVal === stored) {
            setPin('');
            setAttempts(0);
            onSuccess();
          } else {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            setShake(true);
            setTimeout(() => setShake(false), 600);

            if (newAttempts >= 3) {
              setLocked(true);
              setLockTimer(30);
              setError(t('maxAttempts'));
            } else {
              setError(t('invalidPin'));
            }
            setPin('');
          }
        }, 100);
        return newPinVal;
      }
      return newPinVal;
    });
  }, [locked, attempts, onSuccess]);

  const handleBackspace = useCallback(() => {
    if (locked) return;
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, [locked]);

  // Physical keyboard
  useEffect(() => {
    if (!isOpen || mode !== 'pin') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); handlePinInput(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleBackspace(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, handlePinInput, handleBackspace]);

  // ─── Forgot PIN: New PIN keypad input ───
  const handleNewPinDigit = useCallback((digit: string) => {
    if (forgotStep === 'newPin') {
      setNewPin(prev => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;
        if (next.length === 4) {
          setForgotError('');
          setTimeout(() => setForgotStep('confirmPin'), 200);
        }
        return next;
      });
    } else if (forgotStep === 'confirmPin') {
      setConfirmNewPin(prev => {
        if (prev.length >= 4) return prev;
        const next = prev + digit;
        if (next.length === 4) {
          setTimeout(() => {
            if (next === newPin) {
              savePin(next);
              setForgotStep('done');
              setTimeout(() => onSuccess(), 1200);
            } else {
              setForgotError(t('pinsDontMatch'));
              setConfirmNewPin('');
            }
          }, 200);
        }
        return next;
      });
    }
  }, [forgotStep, newPin, onSuccess]);

  const handleNewPinBackspace = useCallback(() => {
    setForgotError('');
    if (forgotStep === 'newPin') {
      setNewPin(prev => prev.slice(0, -1));
    } else if (forgotStep === 'confirmPin') {
      setConfirmNewPin(prev => prev.slice(0, -1));
    }
  }, [forgotStep]);

  // Physical keyboard for forgot PIN keypad
  useEffect(() => {
    if (!isOpen || mode !== 'forgot') return;
    if (forgotStep !== 'newPin' && forgotStep !== 'confirmPin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); handleNewPinDigit(e.key); }
      else if (e.key === 'Backspace') { e.preventDefault(); handleNewPinBackspace(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mode, forgotStep, handleNewPinDigit, handleNewPinBackspace]);

  // ─── Forgot: Send code ───
  const handleSendCode = async () => {
    setForgotLoading(true);
    setForgotError('');
    // TODO(FE-023): POST /parent/pin-recovery/send-code { email }
    await new Promise(r => setTimeout(r, 1500)); // simula envio
    setForgotLoading(false);
    setForgotStep('code');
  };

  // ─── Forgot: Verify code ───
  const handleVerifyCode = async () => {
    setForgotLoading(true);
    setForgotError('');
    // TODO(FE-023): POST /parent/pin-recovery/verify { code }
    await new Promise(r => setTimeout(r, 1000));
    setForgotLoading(false);

    if (verifyCode === MOCK_VERIFY_CODE) {
      setForgotStep('newPin');
    } else {
      setForgotError(t('invalidCode'));
    }
  };

  if (!isOpen) return null;

  // ─── Theme colors ───
  const colors = {
    backdrop: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.50)',
    modalBg: isDark
      ? 'linear-gradient(to bottom, #0F172A, #1E293B)'
      : 'linear-gradient(to bottom, #FFFFFF, #F1F5F9)',
    modalBorder: isDark ? 'rgba(20,184,166,0.2)' : 'rgba(0,0,0,0.08)',
    heading: isDark ? '#F1F5F9' : '#1E293B',
    subtitle: isDark ? 'rgba(148,163,184,0.8)' : '#64748B',
    hint: isDark ? 'rgba(148,163,184,0.5)' : '#94A3B8',
    tabBg: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    tabActive: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.9)',
    tabActiveText: isDark ? '#F1F5F9' : '#1E293B',
    tabInactiveText: isDark ? 'rgba(148,163,184,0.6)' : '#94A3B8',
    keyBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    keyHover: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
    keyActive: isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)',
    keyText: isDark ? '#F1F5F9' : '#1E293B',
    keyDeleteBg: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    keyDeleteText: isDark ? 'rgba(148,163,184,0.6)' : '#94A3B8',
    dotFilled: isDark ? '#14B8A6' : '#0D9488',
    dotFilledShadow: isDark ? 'rgba(20,184,166,0.5)' : 'rgba(13,148,136,0.4)',
    dotEmpty: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    closeBg: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
    closeText: isDark ? 'rgba(255,255,255,0.6)' : '#64748B',
    shieldGrad: isDark ? 'from-teal-500 to-cyan-600' : 'from-teal-500 to-cyan-600',
    bioCircleBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    bioCircleActive: isDark ? 'rgba(20,184,166,0.2)' : 'rgba(13,148,136,0.1)',
    bioIcon: isDark ? 'rgba(255,255,255,0.5)' : '#94A3B8',
    bioIconActive: isDark ? '#2DD4BF' : '#0D9488',
    teal: isDark ? '#2DD4BF' : '#0D9488',
    tabShadow: isDark ? 'none' : '0 1px 2px rgba(0,0,0,0.05)',
    inputBg: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    inputBorder: isDark ? 'rgba(20,184,166,0.3)' : 'rgba(0,0,0,0.12)',
    inputText: isDark ? '#F1F5F9' : '#1E293B',
    btnPrimaryBg: isDark ? 'rgba(20,184,166,0.2)' : 'rgba(13,148,136,0.1)',
    btnPrimaryText: isDark ? '#2DD4BF' : '#0D9488',
    btnPrimaryBorder: isDark ? 'rgba(20,184,166,0.3)' : 'rgba(13,148,136,0.2)',
  };

  // ─── Header subtitle ───
  const subtitleText =
    mode === 'pin' ? t('tapToVerify')
    : mode === 'forgot' ? (
        forgotStep === 'confirm' ? t('resetPin')
      : forgotStep === 'code' ? t('tryAgain')
      : forgotStep === 'newPin' ? t('confirmNewPin')
      : forgotStep === 'confirmPin' ? t('confirmNewPin')
      : t('pinUpdated')
    )
    : bioSupported === null ? t('tapToVerify')
    : !bioSupported ? t('tapToVerify')
    : bioStatus === 'verifying' ? t('tapToVerify')
    : bioStatus === 'success' ? t('pinUpdated')
    : t('tapToVerify');

  // ─── Shared Keypad Renderer ───
  const renderKeypad = (
    onDigit: (d: string) => void,
    onBack: () => void,
    disabled: boolean,
    currentLength: number,
  ) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-[260px] mx-auto">
      {KEYPAD_KEYS.slice(0, 9).map(digit => (
        <button
          key={`key-${digit}`}
          onClick={() => onDigit(digit)}
          disabled={disabled || currentLength >= 4}
          className={`w-full aspect-square rounded-2xl text-2xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${isDark ? 'hover:bg-white/[0.15] active:bg-white/[0.22]' : 'hover:bg-black/[0.08] active:bg-black/[0.12]'}`}
          style={{ background: colors.keyBg, color: colors.keyText }}
        >
          {digit}
        </button>
      ))}
      <div />
      <button
        onClick={() => onDigit('0')}
        disabled={disabled || currentLength >= 4}
        className={`w-full aspect-square rounded-2xl text-2xl font-medium transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${isDark ? 'hover:bg-white/[0.15] active:bg-white/[0.22]' : 'hover:bg-black/[0.08] active:bg-black/[0.12]'}`}
        style={{ background: colors.keyBg, color: colors.keyText }}
      >
        0
      </button>
      <button
        onClick={onBack}
        disabled={disabled || currentLength === 0}
        className={`w-full aspect-square rounded-2xl flex items-center justify-center transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${isDark ? 'hover:bg-white/[0.15]' : 'hover:bg-black/[0.08]'}`}
        style={{ background: colors.keyDeleteBg, color: colors.keyDeleteText }}
      >
        <Delete size={22} />
      </button>
    </div>
  );

  // ─── PIN Dots Renderer ───
  const renderDots = (filled: number, accent?: string) => (
    <div className="flex justify-center gap-4 mb-6">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="w-4 h-4 rounded-full transition-all duration-200"
          style={{
            background: i < filled ? (accent || colors.dotFilled) : colors.dotEmpty,
            transform: i < filled ? 'scale(1.15)' : 'scale(1)',
            boxShadow: i < filled ? `0 0 12px ${colors.dotFilledShadow}` : 'none',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: colors.backdrop }}
        onClick={hideCancelButton ? undefined : onCancel}
      />

      <div
        className={`relative w-full max-w-[calc(100%-2rem)] sm:max-w-sm mx-4 rounded-3xl shadow-2xl overflow-hidden ${shake ? 'animate-gk-shake' : ''}`}
        style={{ background: colors.modalBg, border: `1px solid ${colors.modalBorder}` }}
      >
        {/* Close / Back */}
        {mode === 'forgot' ? (
          <button
            onClick={() => { setMode('pin'); resetForgotState(); }}
            className="absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 hover:opacity-80"
            style={{ background: colors.closeBg, color: colors.closeText }}
          >
            <ArrowLeft size={16} />
          </button>
        ) : !hideCancelButton && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 hover:opacity-80"
            style={{ background: colors.closeBg, color: colors.closeText }}
          >
            <X size={16} />
          </button>
        )}

        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${
            mode === 'forgot' ? (isDark ? 'from-amber-500 to-orange-600' : 'from-amber-500 to-orange-600') : colors.shieldGrad
          } rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
            {mode === 'forgot' ? <KeyRound size={32} className="text-white" /> : <Shield size={32} className="text-white" />}
          </div>
          <h2 className="text-xl font-semibold" style={{ color: colors.heading }}>
            {mode === 'forgot' ? t('resetPin') : t('parentVerification')}
          </h2>
          <p className="text-sm mt-1" style={{ color: colors.subtitle }}>
            {subtitleText}
          </p>
        </div>

        {/* Tabs — only show for pin/biometric */}
        {mode !== 'forgot' && (
          <div className="flex mx-6 mb-4 rounded-xl p-1" style={{ background: colors.tabBg }}>
            <button
              onClick={() => { setMode('pin'); setBioStatus('idle'); setBioMessage(''); isBioRunning.current = false; }}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === 'pin' ? colors.tabActive : 'transparent',
                color: mode === 'pin' ? colors.tabActiveText : colors.tabInactiveText,
                boxShadow: mode === 'pin' ? colors.tabShadow : 'none',
              }}
            >
              <Lock size={14} className="inline mr-1.5 -mt-0.5" /> PIN
            </button>
            <button
              onClick={() => setMode('biometric')}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === 'biometric' ? colors.tabActive : 'transparent',
                color: mode === 'biometric' ? colors.tabActiveText : colors.tabInactiveText,
                boxShadow: mode === 'biometric' ? colors.tabShadow : 'none',
              }}
            >
              <Fingerprint size={14} className="inline mr-1.5 -mt-0.5" /> {t('biometric')}
            </button>
          </div>
        )}

        {/* ═══ PIN Mode ═══ */}
        {mode === 'pin' && (
          <div className="px-6 pb-8">
            {renderDots(pin.length)}

            {error && <p className="text-center text-red-400 text-sm mb-4 animate-gk-fade-in">{error}</p>}

            {locked && (
              <div className="text-center mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-full">
                  <Lock size={14} className="text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{t('locked')} — {lockTimer}s</span>
                </div>
              </div>
            )}

            {renderKeypad(handlePinInput, handleBackspace, locked, pin.length)}

            {/* Esqueci meu PIN */}
            <div className="text-center mt-5">
              <button
                onClick={() => { setMode('forgot'); resetForgotState(); }}
                className="text-xs font-medium transition-all hover:opacity-80"
                style={{ color: colors.teal }}
              >
                {t('resetPin')}
              </button>
            </div>
          </div>
        )}

        {/* ═══ Biometric Mode ═══ */}
        {mode === 'biometric' && (
          <div className="px-6 pb-8 flex flex-col items-center">
            {bioSupported === null && (
              <div className="text-center py-10">
                <Loader2 size={32} className="animate-spin mx-auto mb-3" style={{ color: colors.hint }} />
                <p className="text-sm" style={{ color: colors.hint }}>{t('checkingSupport')}</p>
              </div>
            )}

            {bioSupported === false && (
              <div className="text-center py-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: colors.bioCircleBg }}>
                  <Fingerprint size={48} style={{ color: colors.hint }} />
                </div>
                <p className="text-sm mb-2" style={{ color: colors.subtitle }}>{t('biometricNotAvailable')}</p>
                <p className="text-xs mb-4" style={{ color: colors.hint }}>{t('biometricCheckBrowser')}</p>
                <button onClick={() => setMode('pin')} className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{ color: colors.teal, background: colors.bioCircleActive }}>
                  PIN
                </button>
              </div>
            )}

            {bioSupported && bioStatus === 'idle' && (
              <div className="text-center py-6">
                <button onClick={triggerBiometric} className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 transition-all hover:scale-105 active:scale-95"
                  style={{ background: colors.bioCircleBg }}>
                  <Fingerprint size={52} style={{ color: colors.bioIcon }} />
                </button>
                <p className="text-sm mb-1" style={{ color: colors.subtitle }}>{t('tapFingerprint')}</p>
                <p className="text-xs" style={{ color: colors.hint }}>{t('biometricOptions')}</p>
              </div>
            )}

            {bioSupported && bioStatus === 'verifying' && (
              <div className="text-center py-8">
                <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5 animate-pulse" style={{ background: colors.bioCircleActive }}>
                  <Fingerprint size={52} style={{ color: colors.bioIconActive }} />
                </div>
                <div className="flex items-center justify-center gap-2" style={{ color: colors.bioIconActive }}>
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm font-medium">{bioMessage || t('waiting')}</span>
                </div>
                <p className="text-xs mt-2" style={{ color: colors.hint }}>{t('placeFinger')}</p>
              </div>
            )}

            {bioSupported && bioStatus === 'success' && (
              <div className="text-center py-8 animate-gk-fade-in">
                <div className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: colors.bioCircleActive }}>
                  <CheckCircle size={52} style={{ color: colors.teal }} />
                </div>
                <p className="text-sm font-medium" style={{ color: colors.teal }}>{bioMessage || t('verifiedSuccess')}</p>
              </div>
            )}

            {bioSupported && bioStatus === 'error' && (
              <div className="text-center py-6">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <AlertCircle size={44} className="text-red-400" />
                </div>
                <p className="text-sm text-red-400 mb-4">{bioMessage}</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => { setBioStatus('idle'); setBioMessage(''); isBioRunning.current = false; }}
                    className="text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                    style={{ background: isDark ? 'rgba(20,184,166,0.15)' : 'rgba(13,148,136,0.1)', color: colors.teal }}>
                    {t('tryAgain')}
                  </button>
                  <button onClick={() => setMode('pin')}
                    className="text-sm font-medium px-5 py-2.5 rounded-xl transition-all hover:opacity-90 active:scale-95"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: colors.subtitle }}>
                    PIN
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Forgot PIN Mode ═══ */}
        {mode === 'forgot' && (
          <div className="px-6 pb-8">

            {/* Step 1: Confirmar envio do código */}
            {forgotStep === 'confirm' && (
              <div className="text-center py-4 animate-gk-fade-in">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: isDark ? 'rgba(251,191,36,0.15)' : 'rgba(251,191,36,0.1)' }}>
                  <Mail size={36} style={{ color: isDark ? '#FBBF24' : '#D97706' }} />
                </div>
                <p className="text-sm mb-2" style={{ color: colors.heading }}>
                  {t('sendVerificationCode')}
                </p>
                <p className="text-base font-mono font-medium mb-6" style={{ color: colors.teal }}>
                  {maskEmail(PARENT_EMAIL)}
                </p>
                <button
                  onClick={handleSendCode}
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: colors.btnPrimaryBg, color: colors.btnPrimaryText, border: `1px solid ${colors.btnPrimaryBorder}` }}
                >
                  {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                  {forgotLoading ? t('sending') : t('sendCode')}
                </button>

                <p className="text-xs mt-4" style={{ color: colors.hint }}>
                  Código de teste: {MOCK_VERIFY_CODE}
                </p>
              </div>
            )}

            {/* Step 2: Digitar código */}
            {forgotStep === 'code' && (
              <div className="text-center py-4 animate-gk-fade-in">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: isDark ? 'rgba(20,184,166,0.15)' : 'rgba(13,148,136,0.08)' }}>
                  <Shield size={28} style={{ color: colors.teal }} />
                </div>
                <p className="text-sm mb-5" style={{ color: colors.subtitle }}>
                  {t('enterCodeSentTo', { email: maskEmail(PARENT_EMAIL) })}
                </p>

                <div className="flex justify-center mb-5">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerifyCode(v);
                      setForgotError('');
                    }}
                    placeholder="000000"
                    aria-label="Código de verificação"
                    autoFocus
                    className="w-48 text-center text-2xl font-mono font-medium py-3 rounded-xl outline-none transition-all focus:ring-2"
                    style={{
                      background: colors.inputBg,
                      border: `1.5px solid ${colors.inputBorder}`,
                      color: colors.inputText,
                      letterSpacing: '0.3em',
                    }}
                  />
                </div>

                {forgotError && <p className="text-center text-red-400 text-sm mb-4 animate-gk-fade-in">{forgotError}</p>}

                <button
                  onClick={handleVerifyCode}
                  disabled={forgotLoading || verifyCode.length !== 6}
                  className="w-full py-3 rounded-xl font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: colors.btnPrimaryBg, color: colors.btnPrimaryText, border: `1px solid ${colors.btnPrimaryBorder}` }}
                >
                  {forgotLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {forgotLoading ? t('verifying') : t('verify')}
                </button>

                <button
                  onClick={handleSendCode}
                  disabled={forgotLoading}
                  className="text-xs font-medium mt-4 transition-all hover:opacity-80"
                  style={{ color: colors.hint }}
                >
                  {t('resendCode')}
                </button>
              </div>
            )}

            {/* Step 3: Novo PIN */}
            {forgotStep === 'newPin' && (
              <div className="animate-gk-fade-in">
                <p className="text-center text-sm mb-4 font-medium" style={{ color: colors.heading }}>
                  {t('createNewPin')}
                </p>

                {/* Toggle show/hide */}
                <div className="flex justify-center mb-2">
                  <button
                    onClick={() => setShowNewPin(!showNewPin)}
                    className="flex items-center gap-1.5 text-xs transition-all hover:opacity-80"
                    style={{ color: colors.hint }}
                  >
                    {showNewPin ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showNewPin ? t('hidePin') : t('showPin')}
                  </button>
                </div>

                {showNewPin ? (
                  <div className="flex justify-center gap-3 mb-6">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-medium transition-all"
                        style={{
                          background: i < newPin.length ? colors.btnPrimaryBg : colors.dotEmpty,
                          color: colors.teal,
                          border: `1.5px solid ${i < newPin.length ? colors.btnPrimaryBorder : 'transparent'}`,
                        }}
                      >
                        {newPin[i] || ''}
                      </div>
                    ))}
                  </div>
                ) : (
                  renderDots(newPin.length)
                )}

                {forgotError && <p className="text-center text-red-400 text-sm mb-4 animate-gk-fade-in">{forgotError}</p>}

                {renderKeypad(handleNewPinDigit, handleNewPinBackspace, false, newPin.length)}
              </div>
            )}

            {/* Step 4: Confirmar PIN */}
            {forgotStep === 'confirmPin' && (
              <div className="animate-gk-fade-in">
                <p className="text-center text-sm mb-4 font-medium" style={{ color: colors.heading }}>
                  {t('confirmNewPin')}
                </p>

                {renderDots(confirmNewPin.length)}

                {forgotError && (
                  <p className="text-center text-red-400 text-sm mb-4 animate-gk-fade-in">{forgotError}</p>
                )}

                {renderKeypad(handleNewPinDigit, handleNewPinBackspace, false, confirmNewPin.length)}
              </div>
            )}

            {/* Step 5: Sucesso */}
            {forgotStep === 'done' && (
              <div className="text-center py-8 animate-gk-fade-in">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: colors.bioCircleActive }}>
                  <CheckCircle size={48} style={{ color: colors.teal }} />
                </div>
                <p className="text-lg font-medium mb-2" style={{ color: colors.heading }}>
                  {t('pinUpdated')}
                </p>
                <p className="text-sm" style={{ color: colors.subtitle }}>
                  {t('pinSavedSuccess')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gk-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
          20%, 40%, 60%, 80% { transform: translateX(8px); }
        }
        @keyframes gk-fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-gk-shake { animation: gk-shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both; }
        .animate-gk-fade-in { animation: gk-fade-in 0.3s ease-out; }
      `}} />
    </div>
  );
}

export default KidsGatekeeper;
