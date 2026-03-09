'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { useTranslations } from 'next-intl';
import {
  checkBiometricSupport,
  clearCredential,
  getSavedCredential,
  getStoredPin,
  MOCK_VERIFY_CODE,
  savePin,
  type ForgotStep,
  type GatekeeperMode,
  webauthnAuthenticate,
  webauthnRegister,
} from './KidsGatekeeperLogic';

type GatekeeperTranslations = ReturnType<typeof useTranslations>;

type UseKidsGatekeeperOptions = {
  isOpen: boolean;
  onSuccess: () => void;
  t: GatekeeperTranslations;
};

export function useKidsGatekeeper({ isOpen, onSuccess, t }: UseKidsGatekeeperOptions) {
  const [mode, setMode] = useState<GatekeeperMode>('pin');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [shake, setShake] = useState(false);
  const [bioSupported, setBioSupported] = useState<boolean | null>(null);
  const [bioStatus, setBioStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [bioMessage, setBioMessage] = useState('');
  const [forgotStep, setForgotStep] = useState<ForgotStep>('confirm');
  const [verifyCode, setVerifyCode] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const isBioRunning = useRef(false);

  const resetForgotState = useCallback(() => {
    setForgotStep('confirm');
    setVerifyCode('');
    setNewPin('');
    setConfirmNewPin('');
    setForgotError('');
    setForgotLoading(false);
    setShowNewPin(false);
  }, []);

  useEffect(() => {
    checkBiometricSupport().then((supported) => setBioSupported(supported));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setPin('');
    setError('');
    setMode('pin');
    setBioStatus('idle');
    setBioMessage('');
    isBioRunning.current = false;
    resetForgotState();
  }, [isOpen, resetForgotState]);

  useEffect(() => {
    if (lockTimer > 0) {
      const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (lockTimer === 0 && locked) {
      setLocked(false);
      setAttempts(0);
    }
  }, [lockTimer, locked]);

  const triggerBiometric = useCallback(async () => {
    if (isBioRunning.current) return;
    isBioRunning.current = true;
    setBioStatus('verifying');
    setBioMessage(t('placeFinger'));

    const savedCredential = getSavedCredential();

    if (savedCredential) {
      const result = await webauthnAuthenticate(savedCredential);
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
    const registration = await webauthnRegister();
    if (!isBioRunning.current) return;

    if (registration.ok) {
      setBioStatus('success');
      setBioMessage(t('biometricRegistered'));
      setTimeout(() => onSuccess(), 500);
      return;
    }

    if (registration.error === 'cancel') {
      setBioStatus('idle');
      setBioMessage('');
      isBioRunning.current = false;
      return;
    }

    setBioStatus('error');
    setBioMessage(registration.error || t('biometricError'));
    isBioRunning.current = false;
  }, [onSuccess, t]);

  useEffect(() => {
    if (mode === 'biometric' && bioSupported && isOpen && bioStatus === 'idle') {
      const timer = setTimeout(() => {
        void triggerBiometric();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [mode, bioSupported, isOpen, bioStatus, triggerBiometric]);

  const handlePinInput = useCallback((digit: string) => {
    if (locked) return;
    setError('');

    setPin((previous) => {
      const nextPin = previous + digit;
      if (nextPin.length === 4) {
        setTimeout(() => {
          const stored = getStoredPin();
          if (nextPin === stored) {
            setPin('');
            setAttempts(0);
            onSuccess();
          } else {
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);
            setShake(true);
            setTimeout(() => setShake(false), 600);

            if (nextAttempts >= 3) {
              setLocked(true);
              setLockTimer(30);
              setError(t('maxAttempts'));
            } else {
              setError(t('invalidPin'));
            }

            setPin('');
          }
        }, 100);
      }

      return nextPin;
    });
  }, [attempts, locked, onSuccess, t]);

  const handleBackspace = useCallback(() => {
    if (locked) return;
    setPin((previous) => previous.slice(0, -1));
    setError('');
  }, [locked]);

  useEffect(() => {
    if (!isOpen || mode !== 'pin') return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handlePinInput(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackspace, handlePinInput, isOpen, mode]);

  const handleNewPinDigit = useCallback((digit: string) => {
    if (forgotStep === 'newPin') {
      setNewPin((previous) => {
        if (previous.length >= 4) return previous;
        const nextPin = previous + digit;
        if (nextPin.length === 4) {
          setForgotError('');
          setTimeout(() => setForgotStep('confirmPin'), 200);
        }
        return nextPin;
      });
      return;
    }

    if (forgotStep === 'confirmPin') {
      setConfirmNewPin((previous) => {
        if (previous.length >= 4) return previous;
        const nextPin = previous + digit;
        if (nextPin.length === 4) {
          setTimeout(() => {
            if (nextPin === newPin) {
              savePin(nextPin);
              setForgotStep('done');
              setTimeout(() => onSuccess(), 1200);
            } else {
              setForgotError(t('pinsDontMatch'));
              setConfirmNewPin('');
            }
          }, 200);
        }
        return nextPin;
      });
    }
  }, [forgotStep, newPin, onSuccess, t]);

  const handleNewPinBackspace = useCallback(() => {
    setForgotError('');
    if (forgotStep === 'newPin') {
      setNewPin((previous) => previous.slice(0, -1));
    } else if (forgotStep === 'confirmPin') {
      setConfirmNewPin((previous) => previous.slice(0, -1));
    }
  }, [forgotStep]);

  useEffect(() => {
    if (!isOpen || mode !== 'forgot') return;
    if (forgotStep !== 'newPin' && forgotStep !== 'confirmPin') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        handleNewPinDigit(event.key);
      } else if (event.key === 'Backspace') {
        event.preventDefault();
        handleNewPinBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [forgotStep, handleNewPinBackspace, handleNewPinDigit, isOpen, mode]);

  const handleSendCode = useCallback(async () => {
    setForgotLoading(true);
    setForgotError('');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setForgotLoading(false);
    setForgotStep('code');
  }, []);

  const handleVerifyCode = useCallback(async () => {
    setForgotLoading(true);
    setForgotError('');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setForgotLoading(false);

    if (verifyCode === MOCK_VERIFY_CODE) {
      setForgotStep('newPin');
      return;
    }

    setForgotError(t('invalidCode'));
  }, [t, verifyCode]);

  return {
    bioMessage,
    bioStatus,
    bioSupported,
    confirmNewPin,
    error,
    forgotError,
    forgotLoading,
    forgotStep,
    handleBackspace,
    handleNewPinBackspace,
    handleNewPinDigit,
    handlePinInput,
    handleSendCode,
    handleVerifyCode,
    lockTimer,
    locked,
    mode,
    newPin,
    pin,
    resetForgotState,
    setBioMessage,
    setBioStatus,
    setConfirmNewPin,
    setForgotError,
    setMode,
    setShowNewPin,
    setVerifyCode,
    shake,
    showNewPin,
    triggerBiometric,
    verifyCode,
    isBioRunning,
  };
}
