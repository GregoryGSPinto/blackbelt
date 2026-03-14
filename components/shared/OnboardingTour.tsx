// ============================================================
// OnboardingTour — Spotlight overlay with positioned tooltip
// ============================================================
// Renders a dark overlay with a cutout around the target element.
// Shows a glassmorphism tooltip with step content and navigation.
// Respects prefers-reduced-motion.
// ============================================================
'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function OnboardingTour() {
  const t = useTranslations('common.onboarding');
  const tActions = useTranslations('common.actions');
  const { isActive, currentStep, totalSteps, tour, next, back, skip } = useOnboarding();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Find and measure target element
  const measureTarget = useCallback(() => {
    if (!tour || !isActive) { setTargetRect(null); return; }
    const step = tour.steps[currentStep];
    if (!step) { setTargetRect(null); return; }

    const el = document.querySelector(step.target);
    if (!el) {
      // Target not found — skip to position center
      setTargetRect(null);
      setTooltipPos({ top: window.innerHeight / 2 - 80, left: window.innerWidth / 2 - 150 });
      return;
    }

    const rect = el.getBoundingClientRect();
    const padding = 8;
    const tr: TargetRect = {
      top: rect.top - padding + window.scrollY,
      left: rect.left - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
    setTargetRect(tr);

    // Scroll into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Calculate tooltip position
    const pos = step.position || 'bottom';
    const tooltipW = 300;
    const tooltipH = 160;
    const gap = 16;
    let tTop = 0;
    let tLeft = 0;

    switch (pos) {
      case 'bottom':
        tTop = tr.top + tr.height + gap;
        tLeft = Math.max(16, Math.min(tr.left + tr.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
        break;
      case 'top':
        tTop = tr.top - tooltipH - gap;
        tLeft = Math.max(16, Math.min(tr.left + tr.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - 16));
        break;
      case 'left':
        tTop = tr.top + tr.height / 2 - tooltipH / 2;
        tLeft = tr.left - tooltipW - gap;
        break;
      case 'right':
        tTop = tr.top + tr.height / 2 - tooltipH / 2;
        tLeft = tr.left + tr.width + gap;
        break;
    }

    // Ensure within viewport
    tTop = Math.max(16, Math.min(tTop, window.innerHeight + window.scrollY - tooltipH - 16));
    tLeft = Math.max(16, Math.min(tLeft, window.innerWidth - tooltipW - 16));

    setTooltipPos({ top: tTop, left: tLeft });
  }, [tour, isActive, currentStep]);

  useEffect(() => {
    measureTarget();
    window.addEventListener('resize', measureTarget);
    window.addEventListener('scroll', measureTarget);
    return () => {
      window.removeEventListener('resize', measureTarget);
      window.removeEventListener('scroll', measureTarget);
    };
  }, [measureTarget]);

  // ESC to skip
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isActive, skip, next, back]);

  if (!mounted || !isActive || !tour) return null;

  const step = tour.steps[currentStep];
  if (!step) return null;

  const isLast = currentStep === totalSteps - 1;
  const isFirst = currentStep === 0;

  // Check reduced motion preference
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const animClass = prefersReduced ? '' : 'animate-[anim-fade-in_300ms_ease]';

  const overlay = (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-[9999] ${animClass}`}
      onClick={(e) => { if (e.target === overlayRef.current) skip(); }}
    >
      {/* Dark overlay with SVG cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ height: document.documentElement.scrollHeight }}>
        <defs>
          <mask id="onboarding-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0" y="0"
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.75)"
          mask="url(#onboarding-mask)"
        />
      </svg>

      {/* Spotlight border (ring around target) */}
      {targetRect && (
        <div
          className="absolute rounded-xl pointer-events-none"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            boxShadow: '0 0 0 2px rgba(251,191,36,0.4), 0 0 20px rgba(251,191,36,0.15)',
            transition: prefersReduced ? 'none' : 'all 400ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-[10000] w-[300px]"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          transition: prefersReduced ? 'none' : 'all 400ms cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div
          className="rounded-2xl p-5 shadow-2xl"
          style={{
            background: 'rgba(15,15,20,0.92)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          {/* Close button */}
          <button
            onClick={skip}
            className="absolute top-3 right-3 p-1 rounded-lg text-white/20 hover:text-white/50 transition-colors"
            aria-label={t('skipTour')}
          >
            <X size={14} />
          </button>

          {/* Content */}
          <h3 className="text-sm font-semibold text-white/90 mb-1.5 pr-6">{step.title}</h3>
          <p className="text-xs text-white/45 leading-relaxed mb-4">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Progress dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === currentStep ? 16 : 6,
                    height: 6,
                    background: i === currentStep ? '#FBBF24' : 'rgba(255,255,255,0.1)',
                  }}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={back}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
                  aria-label={tActions('back')}
                >
                  <ChevronLeft size={16} />
                </button>
              )}

              {isLast ? (
                <button
                  onClick={next}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(251,191,36,0.2)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}
                >
                  {t('finish')}
                </button>
              ) : (
                <button
                  onClick={next}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  {t('nextStep')}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Skip text */}
          {!isLast && (
            <button
              onClick={skip}
              className="mt-3 text-[10px] text-white/20 hover:text-white/40 transition-colors"
            >
              {t('skipTour')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
