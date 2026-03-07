declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function initGA(measurementId: string): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer.push(args);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    page_path: window.location.pathname,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

export function trackPageView(page: string): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  const gaId = process.env.NEXT_PUBLIC_GA_ID || '';
  if (!gaId) return;
  window.gtag('config', gaId, {
    page_path: page,
  });
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number
): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}

export function trackConversion(type: string, value?: number): void {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'conversion', {
    send_to: type,
    value: value,
    currency: 'BRL',
  });
}
