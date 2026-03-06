'use client';

import { useEffect, useRef } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

/**
 * Convenience hook that auto-triggers the onboarding tour for a profile
 * on first visit. Uses OnboardingContext under the hood.
 *
 * Usage:
 *   useOnboardingTour('aluno');   // inside athlete dashboard
 *   useOnboardingTour('admin');   // inside admin dashboard
 */
export function useOnboardingTour(profileKey: string, delayMs = 1500) {
  const { isFirstVisit, startTour, isActive, isCompleted, resetTour } = useOnboarding();
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

  return {
    isCompleted: isCompleted(profileKey),
    restart: () => {
      triggered.current = false;
      resetTour(profileKey);
      // Start after a brief delay to allow state update
      setTimeout(() => startTour(profileKey), 300);
    },
  };
}
