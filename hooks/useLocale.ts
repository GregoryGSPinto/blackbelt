'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useTransition } from 'react';
import type { AppLocale } from '@/i18n/routing';

/**
 * Persist locale to Supabase profile (fire-and-forget).
 * Only runs if Supabase env vars are configured and user is authenticated.
 */
async function persistLocaleToProfile(newLocale: AppLocale) {
  try {
    const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // preferred_locale column added via migration 00021 — may not be in generated types yet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('profiles') as any)
        .update({ preferred_locale: newLocale })
        .eq('id', user.id);
    }
  } catch {
    // Silently fail — cookie is the primary persistence
  }
}

/**
 * Load locale from Supabase profile and sync cookie if needed.
 * Returns the profile locale or null if not available.
 */
async function loadLocaleFromProfile(): Promise<AppLocale | null> {
  try {
    const { getSupabaseBrowserClient } = await import('@/lib/supabase/client');
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // preferred_locale column added via migration 00021 — may not be in generated types yet
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('profiles') as any)
      .select('preferred_locale')
      .eq('id', user.id)
      .single();

    const locale = (data as Record<string, unknown>)?.preferred_locale as AppLocale | undefined;
    if (locale && (locale === 'pt-BR' || locale === 'en-US')) {
      return locale;
    }
  } catch {
    // Silently fail
  }
  return null;
}

export function useLocaleSwitch() {
  const locale = useNextIntlLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // On mount, check if profile has a different locale than cookie
  useEffect(() => {
    loadLocaleFromProfile().then((profileLocale) => {
      if (profileLocale && profileLocale !== locale) {
        document.cookie = `locale=${profileLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
        router.refresh();
      }
    });
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback(
    (newLocale: AppLocale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
      persistLocaleToProfile(newLocale);
      startTransition(() => {
        router.refresh();
      });
    },
    [router],
  );

  const toggleLocale = useCallback(() => {
    setLocale(locale === 'pt-BR' ? 'en-US' : 'pt-BR');
  }, [locale, setLocale]);

  return {
    locale,
    setLocale,
    toggleLocale,
    isPending,
  };
}
