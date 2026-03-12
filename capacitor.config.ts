import type { CapacitorConfig } from '@capacitor/cli';
import { config as loadDotenv } from 'dotenv';

loadDotenv({ path: '.env.local', override: false });
loadDotenv({ path: '.env.production', override: false });

const remoteAppUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;
const remoteHost = remoteAppUrl ? new URL(remoteAppUrl).hostname : undefined;

const config: CapacitorConfig = {
  appId: 'com.blackbelt.app',
  appName: 'BlackBelt',
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
    ...(remoteHost ? { allowNavigation: [remoteHost] } : {}),
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
