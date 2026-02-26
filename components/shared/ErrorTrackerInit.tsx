// ============================================================
// ErrorTrackerInit — Initializes global error tracking + vitals
// ============================================================
// Place once in root layout. Captures:
// - window.onerror (uncaught exceptions)
// - unhandledrejection (promise rejections)
// - Core Web Vitals (LCP, CLS, FCP, TTFB)
// ============================================================
'use client';

import { useEffect } from 'react';
import { errorTracker } from '@/lib/monitoring/error-tracker';
import { initWebVitals } from '@/lib/monitoring/web-vitals';

export function ErrorTrackerInit() {
  useEffect(() => {
    errorTracker.init();
    initWebVitals();
  }, []);

  return null;
}
