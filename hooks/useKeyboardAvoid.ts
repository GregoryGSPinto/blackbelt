// ============================================================
// useKeyboardAvoid — Keeps focused inputs visible above keyboard
// ============================================================
// Problem: On mobile, virtual keyboard covers inputs/buttons.
// Solution: Detect focus on inputs, scroll into view, add bottom
//           padding to ensure save buttons remain accessible.
//
// Usage:
//   useKeyboardAvoid();  // Call once in layout or form wrapper
// ============================================================
'use client';

import { useEffect, useCallback } from 'react';

const IS_IOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
const SCROLL_DELAY = IS_IOS ? 350 : 150; // iOS keyboard is slower

export function useKeyboardAvoid() {
  const handleFocus = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    const tag = target.tagName.toLowerCase();
    const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
    if (!isInput) return;

    // Add keyboard-open class to body for CSS adjustments
    document.body.classList.add('keyboard-open');

    // Scroll the focused element into view with padding
    setTimeout(() => {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }, SCROLL_DELAY);
  }, []);

  const handleBlur = useCallback(() => {
    document.body.classList.remove('keyboard-open');
  }, []);

  // VisualViewport API: detect actual keyboard size
  const handleResize = useCallback(() => {
    if (!window.visualViewport) return;
    const vv = window.visualViewport;
    const keyboardHeight = window.innerHeight - vv.height;

    document.documentElement.style.setProperty(
      '--keyboard-height',
      `${Math.max(0, keyboardHeight)}px`
    );

    if (keyboardHeight > 100) {
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('focusin', handleFocus, { passive: true });
    document.addEventListener('focusout', handleBlur, { passive: true });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true });
      window.visualViewport.addEventListener('scroll', handleResize, { passive: true });
    }

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.removeProperty('--keyboard-height');
    };
  }, [handleFocus, handleBlur, handleResize]);
}
