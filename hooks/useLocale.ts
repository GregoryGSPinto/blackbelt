'use client';

import { useLocale as useNextIntlLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import type { AppLocale } from '@/i18n/routing';

export function useLocaleSwitch() {
  const locale = useNextIntlLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (newLocale: AppLocale) => {
      document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
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
