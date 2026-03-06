// ============================================================
// OnboardingContext — Tour state management per profile
// ============================================================
// Tracks first-visit status per user profile type.
// Persists completion in localStorage.
// Can be reactivated from Configurações.
// ============================================================
'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface OnboardingStep {
  /** CSS selector for the target element */
  target: string;
  /** Title shown in tooltip */
  title: string;
  /** Description text */
  description: string;
  /** Position of tooltip relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTour {
  id: string;
  steps: OnboardingStep[];
}

interface OnboardingState {
  /** Whether the tour is currently active */
  isActive: boolean;
  /** Current step index (0-based) */
  currentStep: number;
  /** Total steps in current tour */
  totalSteps: number;
  /** Current tour data */
  tour: OnboardingTour | null;
  /** Start a tour by profile key */
  startTour: (profileKey: string) => void;
  /** Move to next step */
  next: () => void;
  /** Move to previous step */
  back: () => void;
  /** Skip/complete the tour */
  skip: () => void;
  /** Complete the current step and advance */
  complete: () => void;
  /** Check if a profile has completed its tour */
  isCompleted: (profileKey: string) => boolean;
  /** Reset a profile's tour (re-enable) */
  resetTour: (profileKey: string) => void;
  /** Check if first visit for a profile */
  isFirstVisit: (profileKey: string) => boolean;
}

const STORAGE_KEY = 'blackbelt_onboarding';

// ── Tour definitions per profile ──

// Tour step templates — titles/descriptions are resolved from i18n at runtime
interface TourTemplate {
  id: string;
  steps: Array<{
    target: string;
    titleKey: string;
    descKey: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
  }>;
}

const TOUR_TEMPLATES: Record<string, TourTemplate> = {
  aluno: {
    id: 'aluno',
    steps: [
      { target: '[data-tour="proxima-sessao"]', titleKey: 'step1Title', descKey: 'step1Desc', position: 'bottom' },
      { target: '[data-tour="frequencia"]', titleKey: 'step2Title', descKey: 'step2Desc', position: 'bottom' },
      { target: '[data-tour="videos"]', titleKey: 'step3Title', descKey: 'step3Desc', position: 'top' },
      { target: '[data-nav="ranking"]', titleKey: 'step4Title', descKey: 'step4Desc', position: 'top' },
    ],
  },
  instrutor: {
    id: 'instrutor',
    steps: [
      { target: '[data-tour="prof-dashboard"]', titleKey: 'step1Title', descKey: 'step1Desc', position: 'bottom' },
      { target: '[data-tour="prof-chamada"]', titleKey: 'step2Title', descKey: 'step2Desc', position: 'bottom' },
      { target: '[data-tour="prof-alertas"]', titleKey: 'step3Title', descKey: 'step3Desc', position: 'top' },
      { target: '[data-nav="professor-cronometro"]', titleKey: 'step4Title', descKey: 'step4Desc', position: 'top' },
    ],
  },
  responsavel: {
    id: 'responsavel',
    steps: [
      { target: '[data-tour="parent-frequencia"]', titleKey: 'step1Title', descKey: 'step1Desc', position: 'bottom' },
      { target: '[data-tour="parent-progresso"]', titleKey: 'step2Title', descKey: 'step2Desc', position: 'bottom' },
      { target: '[data-tour="parent-mensagem"]', titleKey: 'step3Title', descKey: 'step3Desc', position: 'top' },
    ],
  },
  admin: {
    id: 'admin',
    steps: [
      { target: '[data-tour="admin-dashboard"]', titleKey: 'step1Title', descKey: 'step1Desc', position: 'bottom' },
      { target: '[data-tour="admin-members"]', titleKey: 'step2Title', descKey: 'step2Desc', position: 'bottom' },
      { target: '[data-tour="admin-settings"]', titleKey: 'step3Title', descKey: 'step3Desc', position: 'top' },
      { target: '[data-tour="admin-alerts"]', titleKey: 'step4Title', descKey: 'step4Desc', position: 'top' },
    ],
  },
};

/** Resolves tour template with i18n translations */
function resolveTour(profileKey: string, translator: (key: string) => string): OnboardingTour | null {
  const template = TOUR_TEMPLATES[profileKey];
  if (!template) return null;

  return {
    id: template.id,
    steps: template.steps.map(step => ({
      target: step.target,
      title: translator(`${step.titleKey}`),
      description: translator(`${step.descKey}`),
      position: step.position,
    })),
  };
}

// ── Context ──

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tour, setTour] = useState<OnboardingTour | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const completedRef = useRef(completed);
  completedRef.current = completed;

  // i18n — load tour step translations
  const tSteps = useTranslations('common.onboarding.tourSteps');

  // Load completed state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const saveCompleted = useCallback((next: Record<string, boolean>) => {
    setCompleted(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  }, []);

  const isCompleted = useCallback((key: string) => !!completedRef.current[key], []);

  const isFirstVisit = useCallback((key: string) => !completedRef.current[key], []);

  const startTour = useCallback((profileKey: string) => {
    const translator = (stepKey: string) => {
      try {
        return tSteps(`${profileKey}.${stepKey}`);
      } catch {
        return stepKey;
      }
    };
    const resolved = resolveTour(profileKey, translator);
    if (!resolved) return;
    setTour(resolved);
    setCurrentStep(0);
    setIsActive(true);
  }, [tSteps]);

  const next = useCallback(() => {
    if (!tour) return;
    if (currentStep < tour.steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      // Tour complete
      setIsActive(false);
      saveCompleted({ ...completed, [tour.id]: true });
      setTour(null);
    }
  }, [tour, currentStep, completed, saveCompleted]);

  const back = useCallback(() => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  }, [currentStep]);

  const skip = useCallback(() => {
    if (!tour) return;
    setIsActive(false);
    saveCompleted({ ...completed, [tour.id]: true });
    setTour(null);
  }, [tour, completed, saveCompleted]);

  const complete = next; // alias

  const resetTour = useCallback((key: string) => {
    const next = { ...completed };
    delete next[key];
    saveCompleted(next);
  }, [completed, saveCompleted]);

  return (
    <OnboardingContext.Provider value={{
      isActive,
      currentStep,
      totalSteps: tour?.steps.length ?? 0,
      tour,
      startTour,
      next,
      back,
      skip,
      complete,
      isCompleted,
      resetTour,
      isFirstVisit,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be inside OnboardingProvider');
  return ctx;
}
