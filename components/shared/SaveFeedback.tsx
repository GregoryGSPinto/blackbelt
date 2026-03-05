// ============================================================
// SaveFeedback — Animated save confirmation
// ============================================================
// Shows an animated checkmark + "Salvo!" that fades out.
//
// Usage:
//   const { showSaved, triggerSave } = useSaveFeedback();
//   <SaveFeedback visible={showSaved} />
//   // call triggerSave() after successful save
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

const SAVE_STYLES = `
  @keyframes save-pop {
    0% { opacity: 0; transform: scale(0.5); }
    50% { opacity: 1; transform: scale(1.1); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes save-fade-out {
    0% { opacity: 1; }
    70% { opacity: 1; }
    100% { opacity: 0; }
  }
  @keyframes save-check-draw {
    from { stroke-dashoffset: 24; }
    to { stroke-dashoffset: 0; }
  }
`;

interface SaveFeedbackProps {
  visible: boolean;
  label?: string;
  className?: string;
}

export function SaveFeedback({ visible, label, className = '' }: SaveFeedbackProps) {
  const t = useTranslations('common.actions');
  const displayLabel = label || t('saved');
  if (!visible) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 ${className}`}
      style={{ animation: 'save-fade-out 2s ease 0.5s both' }}
    >
      <style dangerouslySetInnerHTML={{ __html: SAVE_STYLES }} />
      <div
        className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center"
        style={{ animation: 'save-pop 300ms cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <Check size={12} className="text-emerald-400" strokeWidth={3} />
      </div>
      <span
        className="text-emerald-400 text-xs font-semibold"
        style={{ animation: 'save-pop 300ms cubic-bezier(0.34,1.56,0.64,1) 100ms both' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Hook for easy integration ──

/**
 * Hook to manage save feedback state.
 * Auto-hides after 2.5 seconds.
 *
 * Usage:
 *   const { showSaved, triggerSave } = useSaveFeedback();
 *   const handleSave = async () => {
 *     await saveData();
 *     triggerSave();
 *   };
 *   <SaveFeedback visible={showSaved} />
 */
export function useSaveFeedback(duration = 2500) {
  const [showSaved, setShowSaved] = useState(false);

  const triggerSave = useCallback(() => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), duration);
  }, [duration]);

  return { showSaved, triggerSave };
}
