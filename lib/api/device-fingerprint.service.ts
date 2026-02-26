// ============================================================
// Device Fingerprint Service — Per-device analytics
// ============================================================
// Collects non-PII device info for support diagnostics.
// Storage: localStorage, keyed per user
// No IP, no geolocation, no cookies — LGPD-safe
// ============================================================

const STORAGE_KEY = 'blackbelt_device_sessions';

// ── Types ────────────────────────────────────────────────

export interface DeviceFingerprint {
  id: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  screenResolution: string;
  language: string;
  timezone: string;
}

export interface DeviceSession {
  device: DeviceFingerprint;
  firstSeen: string;
  lastSeen: string;
  sessionCount: number;
  errors: DeviceError[];
}

export interface DeviceError {
  timestamp: string;
  type: string;
  message: string;
  page: string;
}

export interface DeviceInsight {
  deviceId: string;
  label: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

// ── Detection ────────────────────────────────────────────

function detectBrowser(): { name: string; version: string } {
  const ua = navigator.userAgent;
  const browsers: [string, RegExp][] = [
    ['Chrome', /Chrome\/(\d+[\.\d]*)/],
    ['Firefox', /Firefox\/(\d+[\.\d]*)/],
    ['Safari', /Version\/(\d+[\.\d]*).*Safari/],
    ['Edge', /Edg\/(\d+[\.\d]*)/],
    ['Opera', /OPR\/(\d+[\.\d]*)/],
  ];
  for (const [name, regex] of browsers) {
    const match = ua.match(regex);
    if (match) return { name, version: match[1] };
  }
  return { name: 'Unknown', version: '0' };
}

function detectOS(): { name: string; version: string } {
  const ua = navigator.userAgent;
  const systems: [string, RegExp][] = [
    ['Android', /Android (\d+[\.\d]*)/],
    ['iOS', /OS (\d+[_\d]*) like Mac/],
    ['Windows', /Windows NT (\d+[\.\d]*)/],
    ['macOS', /Mac OS X (\d+[_\.\d]*)/],
    ['Linux', /Linux/],
    ['ChromeOS', /CrOS/],
  ];
  for (const [name, regex] of systems) {
    const match = ua.match(regex);
    if (match) return { name, version: (match[1] || '').replace(/_/g, '.') };
  }
  return { name: 'Unknown', version: '0' };
}

function detectDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  const ua = navigator.userAgent;
  if (/Mobi|Android.*Mobile|iPhone|iPod/.test(ua)) return 'mobile';
  if (/iPad|Android(?!.*Mobile)|Tablet/.test(ua)) return 'tablet';
  return 'desktop';
}

function generateDeviceId(fp: Omit<DeviceFingerprint, 'id'>): string {
  const raw = `${fp.browser}-${fp.browserVersion}-${fp.os}-${fp.osVersion}-${fp.screenResolution}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + c;
    hash |= 0;
  }
  return `dev_${Math.abs(hash).toString(36)}`;
}

// ── Public API ───────────────────────────────────────────

export function getDeviceFingerprint(): DeviceFingerprint {
  const browser = detectBrowser();
  const os = detectOS();
  const base = {
    browser: browser.name,
    browserVersion: browser.version,
    os: os.name,
    osVersion: os.version,
    deviceType: detectDeviceType(),
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  return { ...base, id: generateDeviceId(base) };
}

export function recordDeviceSession(userId: string): DeviceSession {
  const fp = getDeviceFingerprint();
  const sessions = loadSessions(userId);
  const existing = sessions.find((s) => s.device.id === fp.id);

  if (existing) {
    existing.lastSeen = new Date().toISOString();
    existing.sessionCount += 1;
    existing.device = fp; // update in case browser updated
    saveSessions(userId, sessions);
    return existing;
  }

  const newSession: DeviceSession = {
    device: fp,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    sessionCount: 1,
    errors: [],
  };
  sessions.push(newSession);
  saveSessions(userId, sessions);
  return newSession;
}

export function recordDeviceError(
  userId: string,
  error: { type: string; message: string; page: string },
): void {
  const fp = getDeviceFingerprint();
  const sessions = loadSessions(userId);
  const session = sessions.find((s) => s.device.id === fp.id);
  if (!session) return;

  session.errors.push({
    timestamp: new Date().toISOString(),
    ...error,
  });

  // Keep last 50 errors per device
  if (session.errors.length > 50) {
    session.errors = session.errors.slice(-50);
  }

  saveSessions(userId, sessions);
}

export function getDeviceSessions(userId: string): DeviceSession[] {
  return loadSessions(userId);
}

/**
 * AI-ready insights: pattern analysis per device
 */
export function getDeviceInsights(userId: string): DeviceInsight[] {
  const sessions = loadSessions(userId);
  const insights: DeviceInsight[] = [];

  for (const s of sessions) {
    const { device, errors } = s;
    const label = `${device.browser} ${device.browserVersion} / ${device.os} ${device.osVersion} (${device.deviceType})`;

    // Recurring errors on same device
    const recentErrors = errors.filter(
      (e) => Date.now() - new Date(e.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000,
    );

    if (recentErrors.length >= 5) {
      insights.push({
        deviceId: device.id,
        label,
        severity: recentErrors.length >= 10 ? 'critical' : 'warning',
        message: `${recentErrors.length} erros nos últimos 7 dias neste dispositivo`,
      });
    }

    // Old OS/browser detection
    if (device.os === 'Android' && parseFloat(device.osVersion) < 12) {
      insights.push({
        deviceId: device.id,
        label,
        severity: 'warning',
        message: `SO desatualizado: ${device.os} ${device.osVersion} — pode causar incompatibilidades`,
      });
    }

    if (device.browser === 'Safari' && parseFloat(device.browserVersion) < 16) {
      insights.push({
        deviceId: device.id,
        label,
        severity: 'info',
        message: `Safari ${device.browserVersion} detectado — considerar polyfills`,
      });
    }
  }

  return insights;
}

// ── Persistence ──────────────────────────────────────────

function loadSessions(userId: string): DeviceSession[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(userId: string, sessions: DeviceSession[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(sessions));
  } catch {
    // silent
  }
}

// ── Mock data for CTO dashboard ──────────────────────────

export function getMockDeviceInsights(): DeviceInsight[] {
  return [
    {
      deviceId: 'dev_a3f92',
      label: 'Chrome 119 / Android 11 (mobile)',
      severity: 'critical',
      message: '12 erros de renderização nos últimos 7 dias — SO desatualizado',
    },
    {
      deviceId: 'dev_b7c1e',
      label: 'Safari 15.4 / iOS 15 (mobile)',
      severity: 'warning',
      message: '3 falhas de WebSocket nos últimos 3 dias',
    },
    {
      deviceId: 'dev_e41d8',
      label: 'Firefox 120 / Windows 11 (desktop)',
      severity: 'info',
      message: 'Sessões estáveis — 0 erros em 14 dias',
    },
  ];
}
