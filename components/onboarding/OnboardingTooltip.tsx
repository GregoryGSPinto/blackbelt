/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingTooltipProps {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function OnboardingTooltip({
  target,
  title,
  description,
  position = 'bottom',
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
}: OnboardingTooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.querySelector(target);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scroll = { x: window.scrollX, y: window.scrollY };

    let top = 0;
    let left = 0;

    switch (position) {
      case 'bottom':
        top = rect.bottom + scroll.y + 8;
        left = rect.left + scroll.x + rect.width / 2;
        break;
      case 'top':
        top = rect.top + scroll.y - 8;
        left = rect.left + scroll.x + rect.width / 2;
        break;
      case 'left':
        top = rect.top + scroll.y + rect.height / 2;
        left = rect.left + scroll.x - 8;
        break;
      case 'right':
        top = rect.top + scroll.y + rect.height / 2;
        left = rect.right + scroll.x + 8;
        break;
    }

    setCoords({ top, left });

    // Highlight the target element
    el.classList.add('ring-2', 'ring-yellow-500', 'ring-offset-2', 'relative', 'z-[60]');
    return () => {
      el.classList.remove('ring-2', 'ring-yellow-500', 'ring-offset-2', 'relative', 'z-[60]');
    };
  }, [target, position]);

  if (!coords) return null;

  const transformOrigin =
    position === 'bottom' ? 'translate(-50%, 0)' :
    position === 'top' ? 'translate(-50%, -100%)' :
    position === 'left' ? 'translate(-100%, -50%)' :
    'translate(0, -50%)';

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-50 bg-black/30" onClick={onSkip} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[61] w-72 rounded-xl p-4 shadow-xl"
        style={{
          top: coords.top,
          left: coords.left,
          transform: transformOrigin,
          background: '#1a1a2e',
          border: '1px solid rgba(201, 162, 39, 0.3)',
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          <button onClick={onSkip} className="text-white/50 hover:text-white/80">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-white/70 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">
            {currentStep + 1}/{totalSteps}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={onBack}
                className="flex items-center gap-1 text-xs text-white/60 hover:text-white"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </button>
            )}
            <button
              onClick={onNext}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-md"
              style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
            >
              {currentStep < totalSteps - 1 ? (
                <>Next <ArrowRight className="w-3 h-3" /></>
              ) : (
                'Done'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
