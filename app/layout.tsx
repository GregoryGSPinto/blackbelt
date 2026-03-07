import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { KeyboardProvider } from "@/components/shared/KeyboardProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SlowConnectionBanner } from "@/components/shared/SlowConnectionBanner";
// DemoBanner removido - não exibir barra de modo demonstração
import { PrivacyConsentModal } from "@/components/shared/PrivacyConsentModal";
import { ErrorTrackerInit } from "@/components/shared/ErrorTrackerInit";
import { ThemedBackground } from "@/components/shared/ThemedBackground";
import { NpsSurvey } from "@/components/shared/NpsSurvey";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";

import { DynamicFavicon } from "@/components/shared/DynamicFavicon";
import { AppInitializer } from "@/components/shared/AppInitializer";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: "BlackBelt - Plataforma de Gestão para Academias de Artes Marciais",
  description: "Plataforma inteligente de gestão e desenvolvimento para academias de artes marciais. Controle alunos, turmas, pagamentos e evolução de faixas.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "BlackBelt - Plataforma de Gestão para Academias",
    description: "Plataforma inteligente de gestão e desenvolvimento para academias de artes marciais. Controle alunos, turmas, pagamentos e evolução de faixas.",
    url: "https://blackbelt-five.vercel.app",
    siteName: "BlackBelt",
    type: "website",
    images: [
      {
        url: "https://blackbelt-five.vercel.app/icon-1024.png",
        width: 1024,
        height: 1024,
        alt: "BlackBelt - Plataforma de Gestão",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BlackBelt - Plataforma de Gestão para Academias",
    description: "Plataforma inteligente de gestão e desenvolvimento para academias de artes marciais. Controle alunos, turmas, pagamentos e evolução de faixas.",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations('common');

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="alternate" hrefLang="pt-BR" href="/" />
        <link rel="alternate" hrefLang="en-US" href="/" />
        <link rel="alternate" hrefLang="x-default" href="/" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BlackBelt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})};
          document.documentElement.classList.add('loading');
          window.addEventListener('load', function() {
            document.documentElement.classList.remove('loading');
            document.documentElement.classList.add('loaded');
          });
        `}} />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AppInitializer>
        <GoogleAnalytics />
        <a href="#main-content" className="skip-to-content">{t('meta.skipToContent')}</a>
        <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider>
          <ThemedBackground />
          <div className="relative z-10">
            <AuthProvider>
              <NotificationProvider>
              <OnboardingProvider>
                <ToastProvider>
                  <ResponsiveProvider>
                    <KeyboardProvider>
                    <ErrorTrackerInit />
                    <DynamicFavicon />
                    {/* DemoBanner removido - interface mais limpa */}
                    <SlowConnectionBanner />
                    <PrivacyConsentModal />
                    <NpsSurvey />
                    {children}
                  </KeyboardProvider>
                  </ResponsiveProvider>
                </ToastProvider>
              </OnboardingProvider>
              </NotificationProvider>
            </AuthProvider>
          </div>
        </ThemeProvider>
        </NextIntlClientProvider>
        </AppInitializer>
      </body>
    </html>
  );
}
