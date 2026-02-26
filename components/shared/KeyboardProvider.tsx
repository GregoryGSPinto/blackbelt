// ============================================================
// KeyboardProvider — Global keyboard avoidance activation
// ============================================================
'use client';

import { useKeyboardAvoid } from '@/hooks/useKeyboardAvoid';

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  useKeyboardAvoid();
  return <>{children}</>;
}
