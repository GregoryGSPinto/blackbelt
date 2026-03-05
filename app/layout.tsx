import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ResponsiveProvider } from "@/contexts/ResponsiveContext";
import { KeyboardProvider } from "@/components/shared/KeyboardProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SlowConnectionBanner } from "@/components/shared/SlowConnectionBanner";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { PrivacyConsentModal } from "@/components/shared/PrivacyConsentModal";
import { ErrorTrackerInit } from "@/components/shared/ErrorTrackerInit";
import { ThemedBackground } from "@/components/shared/ThemedBackground";
import SplashScreen from "@/components/SplashScreen";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: "BlackBelt - Plataforma de Gestão",
  description: "Plataforma inteligente de gestão e desenvolvimento",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-1024.png', sizes: '1024x1024', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BlackBelt" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `
          if('serviceWorker' in navigator){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})};
        `}} />
      </head>
      <body className={inter.className}>
        <a href="#main-content" className="skip-to-content">Pular para conteúdo</a>
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
                    <DemoBanner />
                    <SlowConnectionBanner />
                    <SplashScreen />
                    <PrivacyConsentModal />
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
      </body>
    </html>
  );
}
