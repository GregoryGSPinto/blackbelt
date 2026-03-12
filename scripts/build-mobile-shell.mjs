import { mkdir, rm, writeFile, copyFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadDotenv } from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'mobile-build');

for (const envFile of ['.env.local', '.env.production', '.env']) {
  loadDotenv({ path: path.join(rootDir, envFile), override: false });
}

const appUrl = process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL;
const fallbackUrls = (process.env.CAPACITOR_FALLBACK_URLS || '')
  .split(',')
  .map(entry => entry.trim())
  .filter(Boolean);
const allowEphemeralHost = process.env.CAPACITOR_ALLOW_EPHEMERAL_HOST === 'true';

function normalizeUrl(value) {
  const url = new URL(value);
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/+$/, '');
}

function validateHost(urlValue) {
  const url = new URL(urlValue);
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

  if (!allowEphemeralHost && blockedHostPatterns.some(pattern => pattern.test(hostname))) {
    throw new Error(`Mobile shell host is not acceptable for store release: ${hostname}`);
  }

  return {
    normalized: normalizeUrl(urlValue),
    hostname,
    isProfessionalDomain: !blockedHostPatterns.some(pattern => pattern.test(hostname)),
  };
}

if (!appUrl) {
  throw new Error('Missing NEXT_PUBLIC_APP_URL or CAPACITOR_SERVER_URL for mobile shell generation.');
}

if (!appUrl.startsWith('https://')) {
  throw new Error(`Mobile shell requires an HTTPS app URL. Received: ${appUrl}`);
}

const primaryHost = validateHost(appUrl);
const normalizedAppUrl = primaryHost.normalized;
const normalizedFallbackUrls = fallbackUrls.map(url => validateHost(url).normalized);
const runtimeUrl = `${normalizedAppUrl}/api/mobile/runtime`;
const healthUrl = `${normalizedAppUrl}/api/health`;

const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, viewport-fit=cover"
    />
    <meta name="theme-color" content="#1a1a2e" />
    <title>BlackBelt</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #120f1a;
        --card: rgba(255, 255, 255, 0.06);
        --text: #f8f7fb;
        --muted: rgba(248, 247, 251, 0.68);
        --accent: #d4a24b;
        --danger: #ef4444;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        background:
          radial-gradient(circle at top, rgba(212,162,75,0.18), transparent 38%),
          linear-gradient(180deg, #191624 0%, var(--bg) 100%);
        color: var(--text);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }
      main {
        width: min(100%, 420px);
        background: var(--card);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 28px;
        padding: 28px 24px;
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
      }
      h1 {
        margin: 0 0 8px;
        font-size: 28px;
        line-height: 1.1;
      }
      p {
        margin: 0;
        line-height: 1.5;
        color: var(--muted);
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(212, 162, 75, 0.12);
        color: #f4cb79;
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .spinner {
        width: 52px;
        height: 52px;
        margin: 22px auto 18px;
        border-radius: 999px;
        border: 3px solid rgba(255, 255, 255, 0.12);
        border-top-color: var(--accent);
        animation: spin 0.9s linear infinite;
      }
      .actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }
      button, a {
        flex: 1;
        border: 0;
        border-radius: 16px;
        padding: 14px 16px;
        text-align: center;
        font-size: 15px;
        font-weight: 600;
        text-decoration: none;
      }
      button {
        background: linear-gradient(135deg, #d4a24b, #e2ba6c);
        color: #1c160d;
      }
      a {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text);
      }
      .hidden { display: none; }
      .error {
        margin-top: 16px;
        padding: 14px;
        border-radius: 16px;
        background: rgba(239, 68, 68, 0.12);
        color: #fecaca;
        font-size: 14px;
      }
      .hint {
        margin-top: 18px;
        font-size: 13px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <main>
      <div class="badge">BlackBelt mobile</div>
      <h1>Preparando seu acesso</h1>
      <p id="status">
        Estamos conectando o aplicativo ao ambiente seguro do BlackBelt.
      </p>
      <div class="spinner" id="spinner" aria-hidden="true"></div>
      <div id="error" class="error hidden" role="alert"></div>
      <p class="hint">
        Se a rede estiver indisponível, o app permanece nesta tela para evitar uma navegação quebrada.
      </p>
      <div class="actions">
        <button id="retry" type="button">Tentar novamente</button>
        <a href="${normalizedAppUrl}" target="_blank" rel="noreferrer">Abrir no navegador</a>
      </div>
    </main>
    <script>
      const primaryAppUrl = ${JSON.stringify(normalizedAppUrl)};
      const fallbackAppUrls = ${JSON.stringify(normalizedFallbackUrls)};
      const runtimeUrl = ${JSON.stringify(runtimeUrl)};
      const healthUrl = ${JSON.stringify(healthUrl)};
      const statusEl = document.getElementById('status');
      const errorEl = document.getElementById('error');
      const retryButton = document.getElementById('retry');
      const bootHosts = [primaryAppUrl].concat(fallbackAppUrls);

      async function verifyRemoteApp(url) {
        if (!navigator.onLine) {
          throw new Error('Sem conexao com a internet.');
        }

        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 7000);

        try {
          const runtimeResponse = await fetch(url + '/api/mobile/runtime', {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          });

          if (!runtimeResponse.ok) {
            throw new Error('O ambiente remoto nao respondeu ao bootstrap mobile.');
          }

          const runtime = await runtimeResponse.json();
          if (!runtime?.bootstrap?.reviewAccessPath || !runtime?.bootstrap?.accountDeletionPath) {
            throw new Error('O ambiente remoto nao expôs as rotas mínimas de review/compliance.');
          }

          const response = await fetch(url + '/api/health', {
            method: 'GET',
            cache: 'no-store',
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error('O ambiente remoto respondeu com erro.');
          }

          return runtime;
        } finally {
          window.clearTimeout(timeout);
        }
      }

      async function boot() {
        errorEl.classList.add('hidden');
        errorEl.textContent = '';
        statusEl.textContent = 'Validando conectividade, host e disponibilidade do ambiente.';

        let lastError = null;

        for (const host of bootHosts) {
          try {
            const runtime = await verifyRemoteApp(host);
            statusEl.textContent = 'Ambiente validado. Abrindo BlackBelt...';
            window.location.replace(runtime?.shell?.primaryHost || host);
            return;
          } catch (error) {
            lastError = error;
          }
        }

        statusEl.textContent = 'Nao foi possivel abrir o ambiente online agora.';
        errorEl.textContent = lastError instanceof Error ? lastError.message : 'Falha de conectividade.';
        errorEl.classList.remove('hidden');
      }

      retryButton.addEventListener('click', boot);
      window.addEventListener('online', boot);
      boot();
    </script>
  </body>
</html>
`;

const offlineHtml = html.replace(
  'Estamos conectando o aplicativo ao ambiente seguro do BlackBelt.',
  'O aplicativo precisa de conectividade com o ambiente seguro do BlackBelt para continuar.'
);

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await writeFile(path.join(outputDir, 'index.html'), html, 'utf8');
await writeFile(path.join(outputDir, 'offline.html'), offlineHtml, 'utf8');

for (const asset of ['favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png', 'manifest.json']) {
  const source = path.join(rootDir, 'public', asset);
  try {
    await access(source);
    await copyFile(source, path.join(outputDir, asset));
  } catch {
    // optional asset
  }
}

const metadata = {
  appUrl: normalizedAppUrl,
  fallbackUrls: normalizedFallbackUrls,
  generatedAt: new Date().toISOString(),
  strategy: 'remote-hosted-capacitor-shell',
  runtimeEndpoint: '/api/mobile/runtime',
  healthEndpoint: '/api/health',
};

await writeFile(
  path.join(outputDir, 'mobile-shell.json'),
  `${JSON.stringify(metadata, null, 2)}\n`,
  'utf8'
);

console.log(`mobile-build ready for ${normalizedAppUrl}`);
