'use client';

/**
 * useDeepLink — Handles deep link navigation in Capacitor apps.
 *
 * When a user opens a deep link (e.g., blackbelt.app/academy/slug),
 * this hook resolves the URL and navigates to the correct internal route.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DeepLinkRoute {
  pattern: RegExp;
  resolve: (match: RegExpMatchArray) => string;
}

const ROUTES: DeepLinkRoute[] = [
  {
    pattern: /\/academy\/([a-zA-Z0-9_-]+)/,
    resolve: (match) => `/dashboard?academy=${match[1]}`,
  },
  {
    pattern: /\/athlete\/([a-f0-9-]+)/,
    resolve: (match) => `/aluno/${match[1]}`,
  },
  {
    pattern: /\/post\/([a-f0-9-]+)/,
    resolve: (match) => `/social/post/${match[1]}`,
  },
  {
    pattern: /\/competition\/([a-f0-9-]+)/,
    resolve: (match) => `/competitions/${match[1]}`,
  },
];

function resolveDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;

    for (const route of ROUTES) {
      const match = path.match(route.pattern);
      if (match) {
        return route.resolve(match);
      }
    }
  } catch {
    // Invalid URL
  }
  return null;
}

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    async function setupDeepLinks() {
      try {
        const { App } = await import('@capacitor/app');

        const listener = await App.addListener('appUrlOpen', (event) => {
          const resolved = resolveDeepLink(event.url);
          if (resolved) {
            router.push(resolved);
          }
        });

        cleanup = () => {
          listener.remove();
        };
      } catch {
        // Not running in Capacitor — deep links handled by Next.js routing
      }
    }

    setupDeepLinks();

    return () => {
      cleanup?.();
    };
  }, [router]);
}
