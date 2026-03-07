import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // Para build estático (Capacitor), usar locale padrão sem headers
  let locale = process.env.CAPACITOR_BUILD === 'true' 
    ? routing.defaultLocale 
    : await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
