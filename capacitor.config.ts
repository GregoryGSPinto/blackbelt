import type { CapacitorConfig } from '@capacitor/cli';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: '.env.local', override: false });
loadDotenv({ path: '.env.production', override: false });

const remoteAppUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;
const remoteHost = remoteAppUrl ? new URL(remoteAppUrl).hostname : undefined;
const fallbackHosts = (process.env.CAPACITOR_FALLBACK_URLS || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean)
  .map((entry) => new URL(entry).hostname);
const allowNavigation = [...new Set([remoteHost, ...fallbackHosts].filter(Boolean))] as string[];

const config: CapacitorConfig = {
  appId: 'com.blackbelt.app',
  appName: 'BlackBelt',
  // Fonte canonica de assets web para iOS/Android.
  webDir: 'mobile-build',

  // ── Dev server (usar em desenvolvimento local) ──
  // server: {
  //   url: 'http://localhost:3000',
  //   cleartext: true,
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#1a1a2e',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark', // App tem tema escuro
      backgroundColor: '#1a1a2e',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },

  server: {
    hostname: 'app.blackbelt.local',
    ...(allowNavigation.length ? { allowNavigation } : {}),
  },

  // ── iOS ──
  ios: {
    scheme: 'BlackBelt',
    contentInset: 'automatic',
    allowsLinkPreview: true,
    backgroundColor: '#1a1a2e',
  },

  // ── Android ──
  android: {
    backgroundColor: '#1a1a2e',
    allowMixedContent: false, // HTTPS only
    captureInput: true,
    webContentsDebuggingEnabled: false, // Desabilitar em produção
  },
};

export default config;
