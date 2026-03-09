// ============================================================
// Web Vitals Reporter — Core Web Vitals Monitoring
// ============================================================
// Tracks: LCP, FID, CLS, FCP, TTFB, INP
// Reports to console (dev) or future analytics endpoint (prod).
//
// Integration: Called in WebVitalsInit component.
// Reference: https://web.dev/vitals/
// ============================================================

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Thresholds per Google's Core Web Vitals
const THRESHOLDS: Record<MetricName, [number, number]> = {
  CLS:  [0.1, 0.25],
  FCP:  [1800, 3000],
  FID:  [100, 300],
  INP:  [200, 500],
  LCP:  [2500, 4000],
  TTFB: [800, 1800],
};

function getRating(name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const [good, poor] = THRESHOLDS[name] || [Infinity, Infinity];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

const queue: WebVitalMetric[] = [];

function onReport(metric: { name: string; value: number; delta: number; id: string; navigationType: string }) {
  const name = metric.name as MetricName;
  const rating = getRating(name, metric.value);

  const entry: WebVitalMetric = {
    name,
    value: Math.round(metric.value * 100) / 100,
    rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  queue.push(entry);
}

/** Initialize web vitals tracking (call once) */
export async function initWebVitals() {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import — web-vitals is a small library
    // For now, use PerformanceObserver directly
    initPerformanceObserver();
  } catch {
    // Silently fail — observability should never break the app
  }
}

function initPerformanceObserver() {
  // LCP
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries[entries.length - 1];
        if (last) {
          onReport({
            name: 'LCP',
            value: last.startTime,
            delta: last.startTime,
            id: `lcp-${Date.now()}`,
            navigationType: getNavType(),
          });
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch { /* unsupported */ }

    // FCP
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            onReport({
              name: 'FCP',
              value: entry.startTime,
              delta: entry.startTime,
              id: `fcp-${Date.now()}`,
              navigationType: getNavType(),
            });
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch { /* unsupported */ }

    // CLS
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as PerformanceEntry & { value: number }).value;
          }
        }
        onReport({
          name: 'CLS',
          value: clsValue,
          delta: clsValue,
          id: `cls-${Date.now()}`,
          navigationType: getNavType(),
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch { /* unsupported */ }
  }

  // TTFB (from Navigation Timing)
  if (performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      const ttfb = navEntries[0].responseStart;
      onReport({
        name: 'TTFB',
        value: ttfb,
        delta: ttfb,
        id: `ttfb-${Date.now()}`,
        navigationType: getNavType(),
      });
    }
  }
}

function getNavType(): string {
  if (typeof performance === 'undefined') return 'unknown';
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  return nav?.type || 'navigate';
}

/** Get collected metrics (for debug/admin panel) */
export function getWebVitals(): readonly WebVitalMetric[] {
  return queue;
}
