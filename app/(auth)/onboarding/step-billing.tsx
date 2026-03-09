'use client';

import { useState, useCallback } from 'react';
import { activateTrialAction } from '@/app/actions/onboarding';
import { CreditCard, ArrowLeft, Check, Sparkles } from 'lucide-react';

const PLANS = [
  {
    id: 'trial',
    name: 'Free Trial',
    price: 'Gratis',
    period: '14 dias',
    features: [
      'Ate 30 membros',
      'QR Check-in',
      'Agendamento de aulas',
      'Analytics basico',
      'Acesso via app mobile',
    ],
    recommended: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'Consulte valores',
    period: '',
    features: [
      'Membros ilimitados',
      'Analytics avancado',
      'Tema personalizado',
      'Suporte prioritario',
      'Todas integracoes',
    ],
    recommended: false,
  },
];

interface StepBillingProps {
  academyId: string;
  onComplete: () => void;
  onBack: () => void;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export default function StepBilling({ academyId, onComplete, onBack, tokens }: StepBillingProps) {
  const [selectedPlan, setSelectedPlan] = useState('trial');
  const [activating, setActivating] = useState(false);

  const handleActivate = useCallback(async () => {
    setActivating(true);
    try {
      await activateTrialAction(academyId);
      onComplete();
    } finally {
      setActivating(false);
    }
  }, [academyId, onComplete]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          <CreditCard className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: tokens.text }}>
          Choose your Plan
        </h2>
        <p className="text-sm mt-1" style={{ color: tokens.textMuted }}>
          Start with a free trial, upgrade anytime
        </p>
      </div>

      <div className="space-y-3">
        {PLANS.map((plan) => (
          <button
            key={plan.id}
            onClick={() => setSelectedPlan(plan.id)}
            className="w-full text-left p-4 rounded-xl transition-all"
            style={{
              border: `2px solid ${selectedPlan === plan.id ? 'var(--academy-primary, #C9A227)' : tokens.inputBorder}`,
              background: selectedPlan === plan.id ? tokens.overlay : 'transparent',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold" style={{ color: tokens.text }}>
                  {plan.name}
                </span>
                {plan.recommended && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
                  >
                    <Sparkles className="w-3 h-3" />
                    Recommended
                  </span>
                )}
              </div>
              <div className="text-right">
                <span className="font-medium" style={{ color: tokens.text }}>{plan.price}</span>
                <span className="text-xs ml-1" style={{ color: tokens.textMuted }}>{plan.period}</span>
              </div>
            </div>
            <div className="space-y-1">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs" style={{ color: tokens.textMuted }}>
                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: tokens.success }} />
                  {f}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleActivate}
          disabled={activating}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          {activating ? 'Activating...' : selectedPlan === 'trial' ? 'Start Free Trial' : 'Continue to Payment'}
        </button>
      </div>
    </div>
  );
}
