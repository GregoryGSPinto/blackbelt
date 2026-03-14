import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

for (const envFile of ['.env.local', '.env.production', '.env']) {
  loadDotenv({ path: path.join(rootDir, envFile), override: false });
}

const primaryUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;
const fallbackUrls = (process.env.CAPACITOR_FALLBACK_URLS || '')
  .split(',')
  .map(entry => entry.trim())
  .filter(Boolean);
const configuredSupportEmail = process.env.SUPPORT_EMAIL?.trim();
const configuredPrivacyEmail = process.env.PRIVACY_EMAIL?.trim();
const supportEmail = configuredSupportEmail || 'suporte@blackbelt.app';
const privacyEmail = configuredPrivacyEmail || supportEmail;
const shouldRunOnlineChecks = process.argv.includes('--online');
const warnings = [];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`WARN: ${message}`);
}

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}

function inspectHost(value, label) {
  if (!value) {
    fail(`${label} is missing`);
    return null;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${label} is not a valid URL`);
    return null;
  }

  if (url.protocol !== 'https:') {
    fail(`${label} must use HTTPS`);
  } else {
    pass(`${label} uses HTTPS`);
  }

  const hostname = url.hostname.toLowerCase();
  const blockedHostPatterns = [
    /localhost$/,
    /^127\./,
    /\.local$/,
    /\.ngrok(-free)?\.app$/,
    /\.ngrok\.io$/,
    /\.trycloudflare\.com$/,
    /\.loca\.lt$/,
    /\.vercel\.app$/,
    /\.onrender\.com$/,
  ];

  if (blockedHostPatterns.some(pattern => pattern.test(hostname))) {
    fail(`${label} uses a non-production host: ${hostname}`);
  } else {
    pass(`${label} uses a professional domain: ${hostname}`);
  }

  return normalizeUrl(value);
}

async function checkEndpoint(baseUrl, endpoint) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' },
    });

    if (!response.ok) {
      fail(`${endpoint} returned ${response.status}`);
      return;
    }

    pass(`${endpoint} returned ${response.status}`);
  } catch (error) {
    fail(`${endpoint} could not be reached: ${error instanceof Error ? error.message : 'unknown error'}`);
  } finally {
    clearTimeout(timeout);
  }
}

const normalizedPrimary = inspectHost(primaryUrl, 'Primary mobile runtime URL');
const normalizedFallbacks = fallbackUrls
  .map((value, index) => inspectHost(value, `Fallback mobile runtime URL #${index + 1}`))
  .filter(Boolean);

if (configuredSupportEmail) {
  pass(`SUPPORT_EMAIL resolved to ${supportEmail}`);
} else {
  warn(`SUPPORT_EMAIL is not explicitly configured; runtime is using the default contact ${supportEmail}`);
}

if (configuredPrivacyEmail) {
  pass(`PRIVACY_EMAIL resolved to ${privacyEmail}`);
} else if (configuredSupportEmail) {
  warn(`PRIVACY_EMAIL is not explicitly configured; runtime is reusing SUPPORT_EMAIL (${privacyEmail})`);
} else {
  warn(`PRIVACY_EMAIL is not explicitly configured; runtime falls back to SUPPORT_EMAIL (${privacyEmail})`);
}

if (configuredSupportEmail && configuredPrivacyEmail && supportEmail === privacyEmail) {
  warn(`SUPPORT_EMAIL and PRIVACY_EMAIL point to the same inbox (${supportEmail}); a dedicated privacy contact is recommended before wider rollout`);
}

if (normalizedPrimary) {
  pass(`Primary runtime URL normalized to ${normalizedPrimary}`);
}

if (!normalizedFallbacks.length) {
  warn('No fallback runtime URLs configured; release is operating in single-host mode');
} else {
  pass(`Fallback runtime URLs configured: ${normalizedFallbacks.length}`);
}

if (shouldRunOnlineChecks && normalizedPrimary) {
  await checkEndpoint(normalizedPrimary, '/api/mobile/runtime');
  await checkEndpoint(normalizedPrimary, '/api/health');
  await checkEndpoint(normalizedPrimary, '/review-access');
  await checkEndpoint(normalizedPrimary, '/politica-privacidade');
  await checkEndpoint(normalizedPrimary, '/termos-de-uso');
  await checkEndpoint(normalizedPrimary, '/excluir-conta');
}

if (!process.exitCode) {
  pass(`Mobile runtime validation completed with ${warnings.length} warning(s)`);
}
