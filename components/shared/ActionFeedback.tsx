// ============================================================
// ActionFeedback — Visual feedback wrapper for any action
// ============================================================
// Wraps content and flashes a border color on success/error.
// Usage:
//   <ActionFeedback status={status}>
//     <YourContent />
//   </ActionFeedback>
// ============================================================
'use client';

import { useEffect, useState, type ReactNode } from 'react';

type FeedbackStatus = 'idle' | 'loading' | 'success' | 'error';

interface ActionFeedbackProps {
  status: FeedbackStatus;
  children: ReactNode;
  className?: string;
}

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  idle: 'border-transparent',
  loading: 'border-transparent',
  success: 'border-green-500/40 shadow-[0_0_12px_rgba(34,197,94,0.15)]',
  error: 'border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)] animate-shake',
};

const SHAKE_CSS = `
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}
.animate-shake { animation: shake 0.4s ease; }
`;

export function ActionFeedback({ status, children, className = '' }: ActionFeedbackProps) {
  const [displayStatus, setDisplayStatus] = useState<FeedbackStatus>(status);

  useEffect(() => {
    setDisplayStatus(status);
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => setDisplayStatus('idle'), 1500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <>
      {displayStatus === 'error' && <style>{SHAKE_CSS}</style>}
      <div
        className={`relative rounded-2xl border-2 transition-all duration-300 ${STATUS_STYLES[displayStatus]} ${className}`}
      >
        {/* Loading shimmer overlay */}
        {displayStatus === 'loading' && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none z-10">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
