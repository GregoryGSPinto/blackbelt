import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blackbelt.app',
  appName: 'BlackBelt',
  webDir: 'out',

  // ── Dev server (usar em desenvolvimento local) ──
  // server: {
  //   url: 'http://localhost:3000',
  //   cleartext: true,
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0d0d1a',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'Dark', // App tem tema escuro
      backgroundColor: '#0d0d1a',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },

  // ── Deep Linking ──
  server: {
    hostname: 'blackbelt.app',
  },

  // ── iOS ──
  ios: {
    scheme: 'BlackBelt',
    contentInset: 'automatic',
    allowsLinkPreview: true,
    backgroundColor: '#0d0d1a',
  },

  // ── Android ──
  android: {
    backgroundColor: '#0d0d1a',
    allowMixedContent: false, // HTTPS only
    captureInput: true,
    webContentsDebuggingEnabled: false, // Desabilitar em produção
  },
};

export default config;
