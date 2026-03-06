/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { Check } from 'lucide-react';

interface WizardStep {
  id: string;
  label: string;
}

interface OnboardingWizardProps {
  steps: WizardStep[];
  currentStep: number;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export function OnboardingWizard({ steps, currentStep, tokens }: OnboardingWizardProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors"
                style={{
                  background: isCompleted || isCurrent
                    ? 'var(--academy-primary, #C9A227)'
                    : 'transparent',
                  color: isCompleted || isCurrent ? '#fff' : tokens.textMuted,
                  border: `2px solid ${isCompleted || isCurrent ? 'var(--academy-primary, #C9A227)' : tokens.inputBorder}`,
                }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className="text-xs mt-1 whitespace-nowrap"
                style={{ color: isCurrent ? tokens.text : tokens.textMuted }}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mt-[-12px]"
                style={{
                  background: isCompleted
                    ? 'var(--academy-primary, #C9A227)'
                    : tokens.inputBorder,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
