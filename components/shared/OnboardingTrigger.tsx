// ============================================================
// OnboardingTrigger — Auto-starts tour on first visit
// ============================================================
// Place this component inside the profile layout. It checks
// if the user has completed the tour for the given profileKey.
// If not, it starts the tour after a short delay.
// ============================================================
'use client';

import { useEffect, useRef } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface OnboardingTriggerProps {
  /** Profile key matching TOURS in OnboardingContext: 'aluno' | 'instrutor' | 'responsavel' */
  profileKey: string;
  /** Delay before starting tour (ms) — allows page to load */
  delayMs?: number;
}

export function OnboardingTrigger({ profileKey, delayMs = 1500 }: OnboardingTriggerProps) {
  const { isFirstVisit, startTour, isActive } = useOnboarding();
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current || isActive) return;
    if (!isFirstVisit(profileKey)) return;

    triggered.current = true;
    const timer = setTimeout(() => {
      startTour(profileKey);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [profileKey, delayMs, isFirstVisit, startTour, isActive]);

  return null;
}
