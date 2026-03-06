/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';

interface StepDoneProps {
  onFinish: () => void;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export default function StepDone({ onFinish, tokens }: StepDoneProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="text-center py-6 space-y-6 transition-opacity duration-500"
      style={{ opacity: showContent ? 1 : 0 }}
    >
      <div
        className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
        style={{ background: tokens.success, color: '#fff' }}
      >
        <CheckCircle className="w-8 h-8" />
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: tokens.text }}>
          All set!
        </h2>
        <p className="text-sm" style={{ color: tokens.textMuted }}>
          Your academy is ready. Welcome to BlackBelt OS.
        </p>
      </div>

      <div className="space-y-2 text-left max-w-xs mx-auto">
        {[
          'Academy created',
          'First class scheduled',
          'Invite link generated',
          'Trial activated (14 days)',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm" style={{ color: tokens.textMuted }}>
            <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: tokens.success }} />
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-transform hover:scale-105"
        style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
