// ============================================================
// KeyboardSafeArea — Wrapper that keeps content above keyboard
// ============================================================
// Wraps forms/modals. Adds bottom padding when keyboard is open
// so save buttons remain tappable.
//
// Usage:
//   <KeyboardSafeArea>
//     <input ... />
//     <button>Salvar</button>
//   </KeyboardSafeArea>
// ============================================================
'use client';

import { type ReactNode } from 'react';
import { useKeyboardAvoid } from '@/hooks/useKeyboardAvoid';

interface KeyboardSafeAreaProps {
  children: ReactNode;
  className?: string;
}

export function KeyboardSafeArea({ children, className = '' }: KeyboardSafeAreaProps) {
  useKeyboardAvoid();

  return (
    <div className={`keyboard-safe-area ${className}`}>
      {children}
    </div>
  );
}
