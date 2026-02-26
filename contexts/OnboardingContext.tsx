// ============================================================
// OnboardingContext — Tour state management per profile
// ============================================================
// Tracks first-visit status per user profile type.
// Persists completion in localStorage.
// Can be reactivated from Configurações.
// ============================================================
'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';

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

const TOURS: Record<string, OnboardingTour> = {
  aluno: {
    id: 'aluno',
    steps: [
      {
        target: '[data-tour="proxima-sessao"]',
        title: 'Suas próximas sessões',
        description: 'Veja qual é sua próxima sessão, o horário e o instrutor. Faça check-in com um toque!',
        position: 'bottom',
      },
      {
        target: '[data-tour="frequencia"]',
        title: 'Frequência e evolução',
        description: 'Acompanhe sua presença mensal e veja sua tendência. Tente bater sua meta!',
        position: 'bottom',
      },
      {
        target: '[data-tour="videos"]',
        title: 'Catálogo de técnicas',
        description: 'Assista sessões e técnicas no catálogo. Novos vídeos são adicionados toda semana.',
        position: 'top',
      },
      {
        target: '[data-nav="ranking"]',
        title: 'Defina sua meta!',
        description: 'Confira o ranking, conquistas e desafios. Cada treino conta pontos. Oss! 🥋',
        position: 'top',
      },
    ],
  },
  instrutor: {
    id: 'instrutor',
    steps: [
      {
        target: '[data-tour="prof-dashboard"]',
        title: 'Seu painel de controle',
        description: 'Aqui você tem a visão completa: turmas, alunos, estatísticas e alertas.',
        position: 'bottom',
      },
      {
        target: '[data-tour="prof-chamada"]',
        title: 'Chamada com 1 toque',
        description: 'Inicie a chamada rapidamente. O sistema detecta a turma pelo horário automaticamente.',
        position: 'bottom',
      },
      {
        target: '[data-tour="prof-alertas"]',
        title: 'Alunos que precisam de atenção',
        description: 'Alertas inteligentes mostram ausências, quedas de frequência e alunos aptos para graduação.',
        position: 'top',
      },
      {
        target: '[data-nav="professor-cronometro"]',
        title: 'Cronômetro de sessão',
        description: 'Use o cronômetro durante a sessão para controlar rounds e intervalos.',
        position: 'top',
      },
    ],
  },
  responsavel: {
    id: 'responsavel',
    steps: [
      {
        target: '[data-tour="parent-frequencia"]',
        title: 'Frequência do seu filho',
        description: 'Acompanhe a presença semanal e veja se está no caminho certo.',
        position: 'bottom',
      },
      {
        target: '[data-tour="parent-progresso"]',
        title: 'Progresso e conquistas',
        description: 'Veja as graduações, conquistas e evolução técnica.',
        position: 'bottom',
      },
      {
        target: '[data-tour="parent-mensagem"]',
        title: 'Mensagem para o instrutor',
        description: 'Envie mensagens rápidas sobre ausência, dúvidas ou elogios.',
        position: 'top',
      },
    ],
  },
};

// ── Context ──

const OnboardingContext = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tour, setTour] = useState<OnboardingTour | null>(null);
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

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

  const isCompleted = useCallback((key: string) => !!completed[key], [completed]);

  const isFirstVisit = useCallback((key: string) => !completed[key], [completed]);

  const startTour = useCallback((profileKey: string) => {
    const t = TOURS[profileKey];
    if (!t) return;
    setTour(t);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

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
