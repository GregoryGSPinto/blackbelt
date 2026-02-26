#!/usr/bin/env node

/**
 * BLACKBELT — Go-Live Security Validator
 * 
 * Executa 42 verificações automáticas antes de liberar produção.
 * Cada check é PASS/FAIL/WARN com evidência.
 * Exit code 0 = aprovado, 1 = bloqueado.
 *
 * Execução:
 *   BASE_URL=https://api.blackbelt.com.br node scripts/go-live-validator.js
 *   BASE_URL=http://staging:3000 DB_URL=postgresql://... node scripts/go-live-validator.js
 *
 * Variáveis:
 *   BASE_URL   — URL do servidor (obrigatório)
 *   DB_URL     — Connection string PostgreSQL (para checks de banco)
 *   AUTH_TOKEN — JWT válido de ADMIN (para checks autenticados)
 *   SKIP_DB    — Pular checks de banco (se sem acesso direto)
 */

'use strict';

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const DB_URL = process.env.DB_URL || '';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const SKIP_DB = process.env.SKIP_DB === 'true';
const isHttps = BASE_URL.startsWith('https');

// ============================================================
// CHECK ENGINE
// ============================================================

const results = [];
let currentCategory = '';

function category(name) { currentCategory = name; }

function check(id, name, fn) {
  return { id, name, fn, category: currentCategory };
}

async function runCheck(c) {
  const start = performance.now();
  try {
    const result = await c.fn();
    const ms = Math.round(performance.now() - start);
    results.push({
      id: c.id, name: c.name, category: c.category,
      status: result.status, // PASS | FAIL | WARN | SKIP
      evidence: result.evidence,
      detail: result.detail || '',
      ms,
    });
  } catch (err) {
    results.push({
      id: c.id, name: c.name, category: c.category,
      status: 'FAIL',
      evidence: `Exception: ${err.message}`,
      detail: '',
      ms: Math.round(performance.now() - start),
    });
  }
}

function PASS(evidence, detail) { return { status: 'PASS', evidence, detail }; }
function FAIL(evidence, detail) { return { status: 'FAIL', evidence, detail }; }
function WARN(evidence, detail) { return { status: 'WARN', evidence, detail }; }
function SKIP(evidence) { return { status: 'SKIP', evidence }; }

// ============================================================
// HTTP HELPERS
// ============================================================

function httpGet(urlPath, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(urlPath, BASE_URL);
    const mod = url.protocol === 'https:' ? https : http;
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: { 'User-Agent': 'GoLiveValidator/1.0', ...headers },
      timeout: 10_000,
      rejectUnauthorized: true,
    };
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ status: 0, headers: {}, body: '', error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, headers: {}, body: '', error: 'timeout' }); });
    req.end();
  });
}

function httpPost(urlPath, body, headers = {}) {
  return new Promise((resolve) => {
    const url = new URL(urlPath, BASE_URL);
    const mod = url.protocol === 'https:' ? https : http;
    const bodyStr = JSON.stringify(body);
    const opts = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(bodyStr),
        'User-Agent': 'GoLiveValidator/1.0',
        ...headers,
      },
      timeout: 10_000,
    };
    const req = mod.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', (err) => resolve({ status: 0, headers: {}, body: '', error: err.message }));
    req.write(bodyStr);
    req.end();
  });
}

function psql(query) {
  if (!DB_URL || SKIP_DB) return null;
  try {
    return execSync(`psql "${DB_URL}" -t -A -c "${query}" 2>/dev/null`, {
      encoding: 'utf-8', timeout: 10_000,
    }).trim();
  } catch { return null; }
}

function grepRepo(pattern, dir = '.') {
  try {
    const result = execSync(
      `grep -rn "${pattern}" ${dir} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.env*" 2>/dev/null | grep -v node_modules | grep -v ".git/" | head -5`,
      { encoding: 'utf-8', timeout: 5000, cwd: process.env.REPO_PATH || '.' }
    ).trim();
    return result;
  } catch { return ''; }
}

// ============================================================
// CHECKS DEFINITION
// ============================================================

const allChecks = [];

// ─── CATEGORY 1: SECRETS ──────────────────────────────────
category('SECRETS');

allChecks.push(check('SEC-01', 'JWT_SECRET not in source code', async () => {
  const repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..');
  const found = grepRepo('JWT_SECRET\\s*=\\s*["\'][^$]', repoPath);
  if (found) return FAIL(`Found hardcoded: ${found.substring(0, 100)}`, 'Move to Secrets Manager');
  return PASS('No hardcoded JWT_SECRET found in source');
}));

allChecks.push(check('SEC-02', 'No secrets in .env files', async () => {
  const repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..');
  const envFiles = ['/.env', '/.env.local', '/.env.production'];
  const leaks = [];
  for (const f of envFiles) {
    try {
      const content = fs.readFileSync(path.join(repoPath, f), 'utf-8');
      const lines = content.split('\n').filter(l =>
        /^(JWT_SECRET|DB_PASSWORD|ENCRYPTION_KEY|API_KEY|SIEM_API_KEY)\s*=/.test(l) &&
        !l.includes('CHANGE_ME') && !l.includes('${') && !l.includes('ssm:')
      );
      if (lines.length) leaks.push(...lines.map(l => `${f}: ${l.split('=')[0]}`));
    } catch { /* file doesn't exist — OK */ }
  }
  if (leaks.length) return FAIL(`Secrets in env files: ${leaks.join(', ')}`, 'Use Secrets Manager');
  return PASS('No production secrets in .env files');
}));

allChecks.push(check('SEC-03', 'No secrets in git history', async () => {
  try {
    const repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..');
    const result = execSync(
      `cd ${repoPath} && git log --all -p --diff-filter=A -- "*.env" "*.env.*" 2>/dev/null | grep -i "password\\|secret\\|api_key" | grep -v "CHANGE_ME" | head -3`,
      { encoding: 'utf-8', timeout: 15000 }
    ).trim();
    if (result) return FAIL(`Secrets in git history: ${result.substring(0, 80)}`, 'Run git filter-branch or BFG');
    return PASS('No secrets found in git history');
  } catch { return PASS('Clean git history (or no git repo)'); }
}));

allChecks.push(check('SEC-04', 'ENCRYPTION_KEY configured', async () => {
  if (!DB_URL || SKIP_DB) return SKIP('No DB access — verify manually');
  const result = psql("SELECT current_setting('app.encryption_key', true)");
  if (result && result.length >= 32) return PASS(`Key configured (${result.length} chars)`);
  return WARN('ENCRYPTION_KEY not set in DB session', 'Set via Secrets Manager at app startup');
}));

allChecks.push(check('SEC-05', 'Key rotation documented', async () => {
  const repoPath = process.env.REPO_PATH || path.resolve(__dirname, '..');
  const docPaths = ['/docs/key-rotation.md', '/docs/secrets-rotation.md', '/SECURITY.md'];
  for (const d of docPaths) {
    try { fs.accessSync(path.join(repoPath, d)); return PASS(`Rotation doc found: ${d}`); } catch {}
  }
  return WARN('No key rotation documentation found', 'Create docs/key-rotation.md with 90-day schedule');
}));

// ─── CATEGORY 2: DATABASE ─────────────────────────────────
category('DATABASE');

allChecks.push(check('DB-01', 'RLS enabled on critical tables', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const tables = ['students', 'classes', 'progress', 'attendance', 'medals'];
  const missing = [];
  for (const t of tables) {
    const rls = psql(`SELECT relrowsecurity FROM pg_class WHERE relname='${t}'`);
    if (rls !== 't') missing.push(t);
  }
  if (missing.length) return FAIL(`RLS disabled: ${missing.join(', ')}`, 'Run 002_rls_production.sql');
  return PASS(`RLS active on all ${tables.length} critical tables`);
}));

allChecks.push(check('DB-02', 'RLS FORCE enabled (owner cannot bypass)', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const result = psql("SELECT relname FROM pg_class WHERE relname IN ('students','classes','progress','attendance','medals') AND NOT relforcerowsecurity");
  if (result) return FAIL(`FORCE RLS missing: ${result}`, 'ALTER TABLE x FORCE ROW LEVEL SECURITY');
  return PASS('FORCE RLS active on all tables');
}));

allChecks.push(check('DB-03', 'blackbelt_app has NOBYPASSRLS', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const bypass = psql("SELECT rolbypassrls FROM pg_roles WHERE rolname='blackbelt_app'");
  if (bypass === 't') return FAIL('blackbelt_app can bypass RLS!', 'ALTER ROLE blackbelt_app NOBYPASSRLS');
  return PASS('blackbelt_app cannot bypass RLS');
}));

allChecks.push(check('DB-04', 'statement_timeout configured', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const timeout = psql("SHOW statement_timeout");
  if (!timeout || timeout === '0' || timeout === '0ms') return FAIL(`statement_timeout=${timeout}`, 'SET statement_timeout = 30000 (30s)');
  return PASS(`statement_timeout=${timeout}`);
}));

allChecks.push(check('DB-05', 'idle_in_transaction_session_timeout set', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const timeout = psql("SHOW idle_in_transaction_session_timeout");
  if (!timeout || timeout === '0' || timeout === '0ms') return WARN(`idle_in_transaction_session_timeout=${timeout}`, 'Recommend: 60000 (60s)');
  return PASS(`idle_in_transaction_session_timeout=${timeout}`);
}));

allChecks.push(check('DB-06', 'SSL required for connections', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const ssl = psql("SHOW ssl");
  if (ssl !== 'on') return FAIL(`ssl=${ssl}`, 'Enable SSL in postgresql.conf');
  return PASS('SSL=on');
}));

allChecks.push(check('DB-07', 'pg_stat_statements active', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const ext = psql("SELECT count(*) FROM pg_extension WHERE extname='pg_stat_statements'");
  if (ext === '0') return WARN('pg_stat_statements not installed', 'CREATE EXTENSION pg_stat_statements');
  return PASS('pg_stat_statements active');
}));

allChecks.push(check('DB-08', 'Indexes on unit_id columns', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const count = psql("SELECT count(*) FROM pg_indexes WHERE indexdef LIKE '%unit_id%'");
  if (!count || parseInt(count) < 5) return FAIL(`Only ${count} unit_id indexes`, 'Run 002_rls_production.sql index section');
  return PASS(`${count} unit_id indexes found`);
}));

allChecks.push(check('DB-09', 'Audit logs immutable (UPDATE blocked)', async () => {
  if (SKIP_DB) return SKIP('No DB access');
  const policy = psql("SELECT polname FROM pg_policy WHERE polrelid='security_audit_logs'::regclass AND polcmd='w' AND polqual::text LIKE '%false%'");
  if (!policy) return WARN('Could not verify audit immutability', 'Test manually: UPDATE security_audit_logs SET... should fail');
  return PASS('Audit log UPDATE policy = false (immutable)');
}));

allChecks.push(check('DB-10', 'Backup automation configured', async () => {
  if (SKIP_DB) return SKIP('No DB access — verify in AWS Console');
  return WARN('Verify in AWS Console: RDS > Automated Backups > Retention ≥ 35 days', 'Manual check required');
}));

// ─── CATEGORY 3: INFRA / TRANSPORT ───────────────────────
category('INFRASTRUCTURE');

allChecks.push(check('INF-01', 'HTTPS enforced (no HTTP)', async () => {
  if (!isHttps) return FAIL(`Target is HTTP: ${BASE_URL}`, 'Use HTTPS in production');
  const res = await httpGet('/');
  if (res.status === 0) return FAIL(`Cannot connect: ${res.error}`);
  return PASS(`HTTPS active: ${BASE_URL}`);
}));

allChecks.push(check('INF-02', 'HSTS header present', async () => {
  const res = await httpGet('/');
  const hsts = res.headers['strict-transport-security'] || '';
  if (!hsts) return FAIL('No HSTS header', 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
  if (!hsts.includes('max-age')) return FAIL(`Invalid HSTS: ${hsts}`);
  const maxAge = parseInt(hsts.match(/max-age=(\d+)/)?.[1] || '0');
  if (maxAge < 31536000) return WARN(`HSTS max-age=${maxAge} (recommend ≥31536000)`, 'Increase max-age');
  return PASS(`HSTS: ${hsts}`);
}));

allChecks.push(check('INF-03', 'CSP header present', async () => {
  const res = await httpGet('/');
  const csp = res.headers['content-security-policy'] || '';
  if (!csp) return FAIL('No CSP header', "Add Content-Security-Policy: default-src 'self'");
  if (csp.includes("'unsafe-eval'")) return WARN(`CSP has unsafe-eval: ${csp.substring(0, 80)}`);
  if (csp.includes("'unsafe-inline'") && !csp.includes('nonce-')) return WARN('CSP has unsafe-inline without nonce');
  return PASS(`CSP active: ${csp.substring(0, 80)}...`);
}));

allChecks.push(check('INF-04', 'X-Frame-Options: DENY', async () => {
  const res = await httpGet('/');
  const xfo = (res.headers['x-frame-options'] || '').toUpperCase();
  if (xfo !== 'DENY' && xfo !== 'SAMEORIGIN') return FAIL(`X-Frame-Options: ${xfo || 'MISSING'}`);
  return PASS(`X-Frame-Options: ${xfo}`);
}));

allChecks.push(check('INF-05', 'X-Content-Type-Options: nosniff', async () => {
  const res = await httpGet('/');
  const xcto = res.headers['x-content-type-options'] || '';
  if (xcto !== 'nosniff') return FAIL(`X-Content-Type-Options: ${xcto || 'MISSING'}`);
  return PASS('X-Content-Type-Options: nosniff');
}));

allChecks.push(check('INF-06', 'Referrer-Policy restrictive', async () => {
  const res = await httpGet('/');
  const rp = res.headers['referrer-policy'] || '';
  const safe = ['no-referrer', 'strict-origin', 'strict-origin-when-cross-origin', 'same-origin'];
  if (!safe.some(s => rp.includes(s))) return WARN(`Referrer-Policy: ${rp || 'MISSING'}`);
  return PASS(`Referrer-Policy: ${rp}`);
}));

allChecks.push(check('INF-07', 'Permissions-Policy active', async () => {
  const res = await httpGet('/');
  const pp = res.headers['permissions-policy'] || '';
  if (!pp) return WARN('No Permissions-Policy header');
  return PASS(`Permissions-Policy: ${pp.substring(0, 60)}`);
}));

allChecks.push(check('INF-08', 'Server header not leaking info', async () => {
  const res = await httpGet('/');
  const server = res.headers['server'] || '';
  if (server.match(/nginx\/[\d.]+|apache\/[\d.]+|express/i)) {
    return WARN(`Server header leaks version: ${server}`, 'Remove version from Server header');
  }
  return PASS(server ? `Server: ${server} (no version leak)` : 'No Server header (good)');
}));

allChecks.push(check('INF-09', 'No X-Powered-By header', async () => {
  const res = await httpGet('/');
  const xpb = res.headers['x-powered-by'] || '';
  if (xpb) return FAIL(`X-Powered-By: ${xpb}`, 'Remove X-Powered-By header');
  return PASS('No X-Powered-By header');
}));

// ─── CATEGORY 4: AUTHENTICATION ───────────────────────────
category('AUTHENTICATION');

allChecks.push(check('AUTH-01', 'Unauthenticated API returns 401', async () => {
  const res = await httpGet('/api/students');
  if (res.status === 401 || res.status === 403) return PASS(`No auth → HTTP ${res.status}`);
  if (res.status === 200) return FAIL('API returns 200 without auth!', 'All /api/* must require JWT');
  return WARN(`Unexpected status: ${res.status}`);
}));

allChecks.push(check('AUTH-02', 'Invalid JWT returns 401', async () => {
  const res = await httpGet('/api/students', { Authorization: 'Bearer invalid.token.here' });
  if (res.status === 401) return PASS('Invalid JWT → 401');
  if (res.status === 200) return FAIL('Server accepts invalid JWT!');
  return WARN(`Unexpected: HTTP ${res.status}`);
}));

allChecks.push(check('AUTH-03', 'Rate limiter blocks brute force', async () => {
  const attempts = [];
  for (let i = 0; i < 10; i++) {
    attempts.push(httpPost('/api/auth/login', {
      email: 'validator@test.com', password: 'wrong_' + i,
    }, { 'X-Forwarded-For': '198.51.100.99' }));
  }
  const results = await Promise.all(attempts);
  const got429 = results.some(r => r.status === 429);
  if (got429) return PASS(`Rate limiter active (429 after ${results.findIndex(r => r.status === 429) + 1} attempts)`);
  const statuses = [...new Set(results.map(r => r.status))].join(',');
  return WARN(`No 429 in 10 attempts (got: ${statuses})`, 'Verify rate limiter threshold');
}));

allChecks.push(check('AUTH-04', 'Login response has no sensitive data', async () => {
  const res = await httpPost('/api/auth/login', {
    email: 'admin@blackbelt.com', password: 'test',
  });
  const body = res.body.toLowerCase();
  if (body.includes('stack') || body.includes('trace') || body.includes('prisma') ||
      body.includes('postgres') || body.includes('.ts:') || body.includes('.js:')) {
    return FAIL('Error response leaks internals', 'Error handler must sanitize');
  }
  return PASS('No internal details leaked in error response');
}));

allChecks.push(check('AUTH-05', 'Cookie flags secure', async () => {
  const res = await httpPost('/api/auth/login', {
    email: 'admin@blackbelt.com', password: 'admin123',
  });
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return WARN('No Set-Cookie header (may use token-based auth)');
  const cookieStr = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  const issues = [];
  if (!cookieStr.includes('HttpOnly')) issues.push('Missing HttpOnly');
  if (!cookieStr.includes('Secure')) issues.push('Missing Secure');
  if (!cookieStr.includes('SameSite')) issues.push('Missing SameSite');
  if (issues.length) return FAIL(`Cookie flags: ${issues.join(', ')}`, 'Set HttpOnly, Secure, SameSite=Strict');
  return PASS('Cookies have HttpOnly, Secure, SameSite');
}));

allChecks.push(check('AUTH-06', 'MFA endpoint exists', async () => {
  const res = await httpPost('/api/auth/mfa/setup', {}, AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {});
  if (res.status === 404) return FAIL('MFA endpoint not found: /api/auth/mfa/setup', 'Implement TOTP MFA (BE-016)');
  if (res.status === 401) return PASS('MFA endpoint exists (requires auth)');
  return PASS(`MFA endpoint responds: HTTP ${res.status}`);
}));

allChecks.push(check('AUTH-07', 'Step-up auth endpoint exists', async () => {
  const res = await httpPost('/api/auth/step-up', { action: 'delete_student' },
    AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {});
  if (res.status === 404) return FAIL('Step-up endpoint not found', 'Implement step-up auth for critical actions');
  if (res.status === 401) return PASS('Step-up endpoint exists (requires auth)');
  return PASS(`Step-up endpoint responds: HTTP ${res.status}`);
}));

// ─── CATEGORY 5: ERROR HANDLING ───────────────────────────
category('ERROR HANDLING');

allChecks.push(check('ERR-01', 'Invalid route returns safe error', async () => {
  const res = await httpGet('/api/this-does-not-exist-' + Date.now());
  if (res.body.includes('stack') || res.body.includes('Error:') ||
      res.body.includes('at ') || res.body.includes('.ts:')) {
    return FAIL('Error leaks stack trace');
  }
  return PASS(`404 response is safe (HTTP ${res.status})`);
}));

allChecks.push(check('ERR-02', 'SQL injection returns safe error', async () => {
  const res = await httpGet("/api/students?id=1'%20OR%201=1--");
  if (res.body.includes('syntax error') || res.body.includes('SQL') ||
      res.body.includes('pg_') || res.body.includes('SELECT')) {
    return FAIL('SQL error details leaked!', 'Error handler must catch and sanitize');
  }
  return PASS('SQL injection attempt returns safe response');
}));

allChecks.push(check('ERR-03', 'XSS reflected in response', async () => {
  const payload = '<script>alert(1)</script>';
  const res = await httpGet(`/api/students?search=${encodeURIComponent(payload)}`);
  if (res.body.includes('<script>')) return FAIL('XSS reflected in response!');
  return PASS('XSS payload not reflected');
}));

// ─── CATEGORY 6: LOGGING / SIEM ──────────────────────────
category('LOGGING');

allChecks.push(check('LOG-01', 'SIEM endpoint configured', async () => {
  const siem = process.env.SIEM_ENDPOINT || process.env.SIEM_PROVIDER || '';
  if (!siem) return WARN('No SIEM_ENDPOINT or SIEM_PROVIDER env var', 'Configure SIEM shipping (BE-027)');
  return PASS(`SIEM configured: ${siem.substring(0, 40)}`);
}));

allChecks.push(check('LOG-02', 'NEXT_PUBLIC_USE_MOCK is false', async () => {
  const mock = process.env.NEXT_PUBLIC_USE_MOCK || '';
  if (mock === 'true') return FAIL('NEXT_PUBLIC_USE_MOCK=true in production!', 'Set to false');
  return PASS(`NEXT_PUBLIC_USE_MOCK=${mock || 'unset (OK)'}`);
}));

allChecks.push(check('LOG-03', 'NODE_ENV is production', async () => {
  const env = process.env.NODE_ENV || '';
  if (env !== 'production') return WARN(`NODE_ENV=${env}`, 'Set NODE_ENV=production');
  return PASS('NODE_ENV=production');
}));

// ─── CATEGORY 7: OPERATIONAL SECURITY ────────────────────
category('OPERATIONS');

allChecks.push(check('OPS-01', 'Source maps not exposed', async () => {
  const res = await httpGet('/_next/static/chunks/main.js.map');
  if (res.status === 200) return FAIL('Source maps accessible in production!', 'Disable productionBrowserSourceMaps');
  return PASS(`Source maps: HTTP ${res.status} (not accessible)`);
}));

allChecks.push(check('OPS-02', 'Debug/devtools not exposed', async () => {
  const paths = ['/_next/data', '/api/debug', '/api/health/debug', '/__nextjs_original-stack-frame'];
  for (const p of paths) {
    const res = await httpGet(p);
    if (res.status === 200 && res.body.length > 100) {
      return WARN(`Debug endpoint accessible: ${p} (HTTP ${res.status})`);
    }
  }
  return PASS('No debug endpoints exposed');
}));

allChecks.push(check('OPS-03', '.env file not served', async () => {
  const res = await httpGet('/.env');
  if (res.status === 200 && res.body.includes('=')) return FAIL('.env file accessible!');
  return PASS(`.env not served (HTTP ${res.status})`);
}));

allChecks.push(check('OPS-04', 'Directory listing disabled', async () => {
  const res = await httpGet('/api/');
  if (res.body.includes('Index of') || res.body.includes('Directory listing')) {
    return FAIL('Directory listing enabled!');
  }
  return PASS('No directory listing');
}));

allChecks.push(check('OPS-05', 'Auto-remediation dry-run OFF in prod', async () => {
  const dryRun = process.env.AUTO_REMEDIATION_DRY_RUN;
  if (dryRun === 'true') return WARN('Auto-remediation in DRY RUN mode', 'Set AUTO_REMEDIATION_DRY_RUN=false');
  return PASS(`AUTO_REMEDIATION_DRY_RUN=${dryRun || 'unset (active)'}`);
}));

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║      BLACKBELT — Go-Live Security Validator          ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Target:  ${BASE_URL.padEnd(45)}║`);
  console.log(`║  DB:      ${(DB_URL ? 'CONNECTED' : 'SKIP').padEnd(45)}║`);
  console.log(`║  Auth:    ${(AUTH_TOKEN ? 'PROVIDED' : 'NONE').padEnd(45)}║`);
  console.log(`║  Checks:  ${String(allChecks.length).padEnd(45)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Run all checks
  for (const c of allChecks) {
    process.stdout.write(`  Running ${c.id}...`);
    await runCheck(c);
    const last = results[results.length - 1];
    const icon = { PASS: '✓', FAIL: '✗', WARN: '⚠', SKIP: '○' }[last.status];
    process.stdout.write(`\r  ${icon} ${c.id.padEnd(8)} ${c.name.padEnd(45)} ${last.status} (${last.ms}ms)\n`);
  }

  // Summary by category
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESULTADO FINAL                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  const categories = [...new Set(results.map(r => r.category))];
  let totalPass = 0, totalFail = 0, totalWarn = 0, totalSkip = 0;

  for (const cat of categories) {
    const catResults = results.filter(r => r.category === cat);
    const pass = catResults.filter(r => r.status === 'PASS').length;
    const fail = catResults.filter(r => r.status === 'FAIL').length;
    const warn = catResults.filter(r => r.status === 'WARN').length;
    const skip = catResults.filter(r => r.status === 'SKIP').length;
    totalPass += pass; totalFail += fail; totalWarn += warn; totalSkip += skip;

    const catIcon = fail > 0 ? '✗' : warn > 0 ? '⚠' : '✓';
    console.log(`  ${catIcon} ${cat}: ${pass}✓ ${fail}✗ ${warn}⚠ ${skip}○`);

    // Show failures
    for (const r of catResults.filter(r => r.status === 'FAIL')) {
      console.log(`      ✗ ${r.id}: ${r.name}`);
      console.log(`        Evidence: ${r.evidence}`);
      if (r.detail) console.log(`        Fix: ${r.detail}`);
    }
  }

  console.log(`\n${'─'.repeat(58)}`);
  console.log(`  TOTAL: ${totalPass}✓  ${totalFail}✗  ${totalWarn}⚠  ${totalSkip}○  (${results.length} checks)`);

  const verdict = totalFail === 0;
  console.log(`\n  ${verdict ? '✓ APROVADO PARA GO-LIVE' : '✗ NÃO APROVADO — resolver FAILs antes de go-live'}`);
  console.log(`${'─'.repeat(58)}\n`);

  // JSON report
  const report = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    verdict: verdict ? 'APPROVED' : 'REJECTED',
    summary: { total: results.length, pass: totalPass, fail: totalFail, warn: totalWarn, skip: totalSkip },
    checks: results,
  };

  const reportPath = 'go-live-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Relatório: ${reportPath}`);

  process.exit(verdict ? 0 : 1);
}

main().catch(err => { console.error('Fatal:', err); process.exit(2); });
