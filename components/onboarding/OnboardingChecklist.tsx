/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { getOnboardingProgressAction } from '@/app/actions/onboarding';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

const CHECKLIST_ITEMS = [
  { id: 'academy', label: 'Create your academy', href: '/onboarding' },
  { id: 'schedule', label: 'Set up first class schedule', href: '/onboarding' },
  { id: 'invite', label: 'Invite coaches and students', href: '/onboarding' },
  { id: 'billing', label: 'Choose a plan', href: '/onboarding' },
  { id: 'done', label: 'Complete setup', href: '/onboarding' },
];

interface OnboardingChecklistProps {
  academyId: string;
}

export function OnboardingChecklist({ academyId }: OnboardingChecklistProps) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [stepsCompleted, setStepsCompleted] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getOnboardingProgressAction(academyId);
        if (result.success && result.data) {
          setStepsCompleted(result.data.steps_completed ?? []);
          if (result.data.completed_at) {
            setDismissed(true);
          }
        }
      } catch {
        // No onboarding progress found
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [academyId]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(`onboarding_dismissed_${academyId}`, 'true');
    } catch { /* ignore */ }
  }, [academyId]);

  // Check localStorage for dismissed state
  useEffect(() => {
    try {
      if (localStorage.getItem(`onboarding_dismissed_${academyId}`) === 'true') {
        setDismissed(true);
      }
    } catch { /* ignore */ }
  }, [academyId]);

  if (!loaded || dismissed) return null;

  const completedCount = stepsCompleted.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  if (completedCount === totalCount) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-40 w-72 rounded-xl shadow-lg overflow-hidden"
      style={{
        background: isDark ? '#1a1a2e' : '#ffffff',
        border: `1px solid ${tokens.cardBorder}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: tokens.text }}>
            Complete your setup
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
          >
            {progress}%
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
            className="p-1 rounded hover:opacity-70"
          >
            <X className="w-3 h-3" style={{ color: tokens.textMuted }} />
          </button>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: tokens.textMuted }} />
          ) : (
            <ChevronUp className="w-4 h-4" style={{ color: tokens.textMuted }} />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-3 pb-2">
        <div className="h-1 rounded-full" style={{ background: tokens.overlay }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              background: 'var(--academy-primary, #C9A227)',
            }}
          />
        </div>
      </div>

      {/* Checklist items */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5">
          {CHECKLIST_ITEMS.map((item) => {
            const isComplete = stepsCompleted.includes(item.id);
            return (
              <div key={item.id} className="flex items-center gap-2">
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: tokens.success }} />
                ) : (
                  <Circle className="w-4 h-4 flex-shrink-0" style={{ color: tokens.textMuted }} />
                )}
                <span
                  className="text-xs"
                  style={{
                    color: isComplete ? tokens.textMuted : tokens.text,
                    textDecoration: isComplete ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
