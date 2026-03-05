import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['pt-BR', 'en-US'] as const,
  defaultLocale: 'pt-BR',
  localePrefix: 'never',
  localeCookie: {
    name: 'locale',
    sameSite: 'lax',
  },
});

export type AppLocale = (typeof routing.locales)[number];
