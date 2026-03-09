'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import StepAcademy from './step-academy';
import StepSchedule from './step-schedule';
import StepInvite from './step-invite';
import StepBilling from './step-billing';
import StepDone from './step-done';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';

const STEPS = [
  { id: 'academy', label: 'Academy' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'invite', label: 'Invite' },
  { id: 'billing', label: 'Plan' },
  { id: 'done', label: 'Done' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [currentStep, setCurrentStep] = useState(0);
  const [academyId, setAcademyId] = useState<string | null>(null);

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const handleAcademyCreated = useCallback((id: string) => {
    setAcademyId(id);
    handleNext();
  }, [handleNext]);

  const handleFinish = useCallback(() => {
    router.push('/');
  }, [router]);

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'academy':
        return <StepAcademy onComplete={handleAcademyCreated} tokens={tokens} />;
      case 'schedule':
        return <StepSchedule academyId={academyId!} onComplete={handleNext} onBack={handleBack} tokens={tokens} />;
      case 'invite':
        return <StepInvite academyId={academyId!} onComplete={handleNext} onBack={handleBack} tokens={tokens} />;
      case 'billing':
        return <StepBilling academyId={academyId!} onComplete={handleNext} onBack={handleBack} tokens={tokens} />;
      case 'done':
        return <StepDone onFinish={handleFinish} tokens={tokens} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: tokens.bg }}>
      <div className="w-full max-w-lg">
        <OnboardingWizard
          steps={STEPS}
          currentStep={currentStep}
          tokens={tokens}
        />
        <div className="mt-6 rounded-xl p-6" style={tokens.glass}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
