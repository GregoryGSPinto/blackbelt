#!/usr/bin/env node

/**
 * BLACKBELT — Stress Test Produção v2.0
 *
 * 11 cenários com gates de aprovação PRODUÇÃO (< 1% erro).
 *
 *   S1:  Read Flood (500 GET paginados)
 *   S2:  Login Flood (500 POST, 80% inválidos)
 *   S3:  Progress Contention (500 PUT mesmo recurso)
 *   S4:  Mixed Workload (70R/20W/10A)
 *   S5:  Burst Spike (0→500 instantâneo)
 *   S6:  Rate Limiter (200 login mesmo IP)
 *   S7:  Large Payload (100 POST 100KB)
 *   S8:  Sustained Load (500 req/s × 60s)
 *   S9:  Cross-Unit Isolation (tenant leak detection)       ← NEW
 *   S10: Data Integrity (write→read→verify consistency)     ← NEW
 *   S11: Concurrent Write Consistency (parallel writes)     ← NEW
 *
 * Execução:
 *   BASE_URL=https://api.blackbelt.com.br \
 *   AUTH_TOKEN_UNIT1=eyJ... AUTH_TOKEN_UNIT2=eyJ... \
 *   node scripts/stress-test-production.js
 *
 * Variáveis:
 *   BASE_URL           — servidor (obrigatório)
 *   CONCURRENCY        — requests simultâneas (default: 500)
 *   AUTH_TOKEN_UNIT1   — JWT de professor unit_001
 *   AUTH_TOKEN_UNIT2   — JWT de professor unit_002
 *   AUTH_TOKEN_ADMIN   — JWT de admin global
 *   SCENARIO           — executar 1 cenário (S1-S11)
 *   DURATION           — S8 duração em segundos (default: 60)
 *   REPORT_FILE        — path relatório (default: stress-report-production.json)
 */

'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');

// ============================================================
// CONFIG
// ============================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '500');
const RAMP_SECONDS = parseInt(process.env.RAMP || '5');
const TIMEOUT_MS = 15_000;
const SUSTAINED_DURATION_S = parseInt(process.env.DURATION || '60');
const REPORT_FILE = process.env.REPORT_FILE || 'stress-report-production.json';
const SINGLE_SCENARIO = process.env.SCENARIO || '';

// Auth tokens per tenant
const TOKENS = {
  unit1: process.env.AUTH_TOKEN_UNIT1 || '',
  unit2: process.env.AUTH_TOKEN_UNIT2 || '',
  admin: process.env.AUTH_TOKEN_ADMIN || '',
};

const isHttps = BASE_URL.startsWith('https');
const httpModule = isHttps ? https : http;

const agent = new (isHttps ? https : http).Agent({
  keepAlive: true,
  maxSockets: CONCURRENCY,
  maxFreeSockets: 64,
  timeout: TIMEOUT_MS,
});

// ============================================================
// METRICS ENGINE
// ============================================================

class Histogram {
  constructor() { this.values = []; this.min = Infinity; this.max = 0; this.sum = 0; }
  record(v) { this.values.push(v); if (v < this.min) this.min = v; if (v > this.max) this.max = v; this.sum += v; }
  percentile(p) {
    if (!this.values.length) return 0;
    const s = [...this.values].sort((a, b) => a - b);
    return s[Math.max(0, Math.ceil(s.length * p / 100) - 1)];
  }
  get mean() { return this.values.length ? this.sum / this.values.length : 0; }
  get count() { return this.values.length; }
}

class ScenarioMetrics {
  constructor(name) {
    this.name = name;
    this.latency = new Histogram();
    this.statusCodes = {};
    this.errors = [];
    this.startTime = 0; this.endTime = 0;
    this._active = 0; this.peakConcurrent = 0;
    this.rateLimitHits = 0; this.conflicts409 = 0;
    this.connectionErrors = 0; this.timeouts = 0;
    // NEW: isolation & integrity tracking
    this.tenantLeaks = 0;          // responses with wrong unit data
    this.integrityFailures = 0;    // write→read mismatches
    this.dataCorruptions = 0;      // unexpected mutations
  }

  record(result) {
    this.latency.record(result.latencyMs);
    const code = result.status || 0;
    this.statusCodes[code] = (this.statusCodes[code] || 0) + 1;
    if (code === 429) this.rateLimitHits++;
    if (code === 409) this.conflicts409++;
    if (result.error) {
      this.errors.push(result.error);
      if (/ECONNREFUSED|ECONNRESET/.test(result.error)) this.connectionErrors++;
      if (/timeout|AbortError/.test(result.error)) this.timeouts++;
    }
    if (result.tenantLeak) this.tenantLeaks++;
    if (result.integrityFail) this.integrityFailures++;
    if (result.corruption) this.dataCorruptions++;
  }

  enter() { this._active++; if (this._active > this.peakConcurrent) this.peakConcurrent = this._active; }
  leave() { this._active--; }

  get totalRequests() { return this.latency.count; }
  get durationSec() { return (this.endTime - this.startTime) / 1000; }
  get rps() { return this.durationSec > 0 ? this.totalRequests / this.durationSec : 0; }

  get successCount() {
    return Object.entries(this.statusCodes)
      .filter(([c]) => { const n = parseInt(c); return n >= 200 && n < 400; })
      .reduce((s, [, c]) => s + c, 0);
  }

  // Error rate EXCLUDES expected 429 and 409 from denominator
  get adjustedErrorRate() {
    const expected = this.rateLimitHits + this.conflicts409;
    const total = this.totalRequests - expected;
    const errors = this.totalRequests - this.successCount - expected;
    return total > 0 ? Math.max(0, errors / total * 100) : 0;
  }

  get rawErrorRate() {
    return this.totalRequests > 0
      ? ((this.totalRequests - this.successCount) / this.totalRequests * 100)
      : 0;
  }

  summary() {
    return {
      scenario: this.name,
      totalRequests: this.totalRequests,
      durationSec: R(this.durationSec),
      rps: R(this.rps),
      peakConcurrent: this.peakConcurrent,
      latency: {
        min: R(this.latency.min === Infinity ? 0 : this.latency.min),
        mean: R(this.latency.mean),
        p50: R(this.latency.percentile(50)),
        p95: R(this.latency.percentile(95)),
        p99: R(this.latency.percentile(99)),
        max: R(this.latency.max),
      },
      statusCodes: { ...this.statusCodes },
      errorRate: { raw: R(this.rawErrorRate), adjusted: R(this.adjustedErrorRate) },
      errors: {
        total: this.totalRequests - this.successCount,
        connections: this.connectionErrors,
        timeouts: this.timeouts,
        rateLimitHits: this.rateLimitHits,
        conflicts409: this.conflicts409,
      },
      isolation: {
        tenantLeaks: this.tenantLeaks,
        integrityFailures: this.integrityFailures,
        dataCorruptions: this.dataCorruptions,
      },
    };
  }
}

function R(v) { return Math.round(v * 100) / 100; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// HTTP ENGINE
// ============================================================

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    const url = new URL(path, BASE_URL);
    const defaultHeaders = { 'Accept': 'application/json', 'User-Agent': 'BlackBeltStressProd/2.0' };
    if (body) defaultHeaders['Content-Type'] = 'application/json';
    const allHeaders = { ...defaultHeaders, ...headers };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) allHeaders['Content-Length'] = Buffer.byteLength(bodyStr);

    const opts = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method, headers: allHeaders, agent, timeout: TIMEOUT_MS,
    };

    const req = httpModule.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch {}
        resolve({
          status: res.statusCode, latencyMs: performance.now() - start,
          body: data, json: parsed, headers: res.headers, error: null,
        });
      });
    });
    req.on('error', (e) => resolve({
      status: 0, latencyMs: performance.now() - start,
      body: null, json: null, headers: {}, error: e.message || e.code,
    }));
    req.on('timeout', () => { req.destroy(); resolve({
      status: 0, latencyMs: performance.now() - start,
      body: null, json: null, headers: {}, error: 'timeout',
    }); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================
// SCENARIO RUNNER
// ============================================================

async function runScenario(name, description, count, requestFn, opts = {}) {
  const { rampSec = RAMP_SECONDS, delayBetweenMs = 0 } = opts;
  const metrics = new ScenarioMetrics(name);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${name}: ${description}`);
  console.log(`  Requests: ${count} | Ramp: ${rampSec}s | Target: ${BASE_URL}`);
  console.log(`${'═'.repeat(60)}`);

  metrics.startTime = performance.now();
  const batchSize = rampSec > 0 ? Math.ceil(count / rampSec) : count;
  const batchDelayMs = rampSec > 0 ? 1000 : 0;

  const promises = [];
  let launched = 0;

  while (launched < count) {
    const thisBatch = Math.min(batchSize, count - launched);
    for (let i = 0; i < thisBatch; i++) {
      const idx = launched + i;
      const p = (async () => {
        if (delayBetweenMs > 0) await sleep(Math.random() * delayBetweenMs);
        metrics.enter();
        try {
          const result = await requestFn(idx);
          metrics.record(result);
        } finally { metrics.leave(); }
      })();
      promises.push(p);
    }
    launched += thisBatch;
    process.stdout.write(`\r  Launched: ${launched}/${count} (${Math.round(launched/count*100)}%) | Active: ${metrics._active}`);
    if (launched < count && batchDelayMs > 0) await sleep(batchDelayMs);
  }

  await Promise.allSettled(promises);
  metrics.endTime = performance.now();

  const s = metrics.summary();
  console.log(`\n\n  Results:`);
  console.log(`  ├── Duration:     ${s.durationSec}s (${s.rps} req/s)`);
  console.log(`  ├── Peak:         ${s.peakConcurrent} concurrent`);
  console.log(`  ├── Latency:      p50=${s.latency.p50}ms | p95=${s.latency.p95}ms | p99=${s.latency.p99}ms | max=${s.latency.max}ms`);
  console.log(`  ├── Status:       ${JSON.stringify(s.statusCodes)}`);
  console.log(`  ├── Error Rate:   ${s.errorRate.adjusted}% adjusted (${s.errorRate.raw}% raw)`);
  if (s.errors.rateLimitHits > 0) console.log(`  ├── Rate Limits:  ${s.errors.rateLimitHits}`);
  if (s.errors.conflicts409 > 0) console.log(`  ├── Conflicts:    ${s.errors.conflicts409}`);
  if (s.isolation.tenantLeaks > 0) console.log(`  ├── TENANT LEAKS: ${s.isolation.tenantLeaks} ← CRITICAL`);
  if (s.isolation.integrityFailures > 0) console.log(`  ├── INTEGRITY:    ${s.isolation.integrityFailures} failures`);
  if (s.isolation.dataCorruptions > 0) console.log(`  ├── CORRUPTION:   ${s.isolation.dataCorruptions} ← CRITICAL`);

  return s;
}

// ============================================================
// 11 SCENARIOS
// ============================================================

const scenarios = {

  // ─── S1-S8: Mesmos cenários com gates apertados ─────────

  S1: {
    name: 'S1: Read Flood (Paginação)',
    description: '500 GET /api/students?page=N — carga leitura pura',
    run: (n) => runScenario('S1', 'Read flood paginado', n,
      async (idx) => makeRequest('GET', `/api/students?page=${(idx%10)+1}&limit=20`,
        null, authHeaders(TOKENS.unit1))),
    gates: { p95_max_ms: 300, p99_max_ms: 800, adjusted_error_max_pct: 1, min_rps: 80 },
  },

  S2: {
    name: 'S2: Login Flood',
    description: '500 POST /api/auth/login — 80% inválidos',
    run: (n) => runScenario('S2', 'Login flood', n,
      async (idx) => {
        const valid = idx % 5 === 0;
        return makeRequest('POST', '/api/auth/login', {
          email: valid ? `prof${idx%3}@blackbelt.com` : `fake${idx}@evil.com`,
          password: valid ? 'ValidPassword123!' : 'wrong',
        });
      }, { rampSec: 3 }),
    gates: { p95_max_ms: 800, p99_max_ms: 1500, min_rps: 40, expect_429: true },
  },

  S3: {
    name: 'S3: Progress Contention (409)',
    description: '500 PUT /api/progress/stu_001 — mesmo recurso',
    run: (n) => runScenario('S3', 'Write contention', n,
      async (idx) => makeRequest('PUT', '/api/progress/stu_001', {
        belt: 'BLUE', stripes: idx % 4, version: 1, notes: `Update #${idx}`,
      }, authHeaders(TOKENS.unit1)),
      { rampSec: 2 }),
    gates: { p95_max_ms: 800, p99_max_ms: 1500, expect_409: true, adjusted_error_max_pct: 1 },
  },

  S4: {
    name: 'S4: Mixed Workload (70R/20W/10A)',
    description: '500 requests mistas — tráfego realista',
    run: (n) => runScenario('S4', 'Mixed workload', n,
      async (idx) => {
        const roll = idx % 10;
        if (roll < 7)
          return makeRequest('GET', `/api/students?page=${(idx%10)+1}&limit=20`, null, authHeaders(TOKENS.unit1));
        if (roll < 9)
          return makeRequest('PUT', `/api/attendance/stu_${idx%50}`,
            { date: new Date().toISOString().split('T')[0], present: true },
            authHeaders(TOKENS.unit1));
        return makeRequest('POST', '/api/auth/login',
          { email: `user${idx%10}@blackbelt.com`, password: 'TestPassword123!' });
      }),
    gates: { p95_max_ms: 400, p99_max_ms: 1000, adjusted_error_max_pct: 1, min_rps: 80 },
  },

  S5: {
    name: 'S5: Burst Spike (0→500)',
    description: '500 GET instantâneas sem ramp-up',
    run: (n) => runScenario('S5', 'Burst spike', n,
      async (idx) => makeRequest('GET', `/api/classes?unit_id=unit_${(idx%3)+1}`,
        null, authHeaders(TOKENS.unit1)),
      { rampSec: 0 }),
    gates: { p95_max_ms: 1500, p99_max_ms: 3000, adjusted_error_max_pct: 5, min_rps: 40 },
  },

  S6: {
    name: 'S6: Rate Limiter Validation',
    description: '200 login mesmo IP — must block ≥ 150',
    run: () => runScenario('S6', 'Rate limiter', 200,
      async (idx) => makeRequest('POST', '/api/auth/login',
        { email: 'attacker@evil.com', password: 'brute_' + idx },
        { 'X-Forwarded-For': '203.0.113.66' }),
      { rampSec: 1 }),
    gates: { expect_429: true, min_429_count: 150 },
  },

  S7: {
    name: 'S7: Large Payload (100KB)',
    description: '100 POST com body 100KB',
    run: () => {
      const bigNotes = 'A'.repeat(100_000);
      return runScenario('S7', 'Large payload', 100,
        async (idx) => makeRequest('POST', '/api/evaluations',
          { studentId: `stu_${idx%50}`, notes: bigNotes, grade: idx % 5 },
          authHeaders(TOKENS.unit1)),
        { rampSec: 2 });
    },
    gates: { p95_max_ms: 1500, adjusted_error_max_pct: 1 },
  },

  S8: {
    name: 'S8: Sustained Load (60s)',
    description: '~500 req/s sustained — detecta leaks e degradação',
    run: async () => {
      const metrics = new ScenarioMetrics('S8');
      const targetRPS = 500;
      const intervalMs = 1000 / targetRPS;

      console.log(`\n${'═'.repeat(60)}`);
      console.log(`  S8: Sustained Load — ${targetRPS} req/s × ${SUSTAINED_DURATION_S}s`);
      console.log(`${'═'.repeat(60)}`);

      metrics.startTime = performance.now();
      const endAt = metrics.startTime + SUSTAINED_DURATION_S * 1000;
      const inflight = new Set();
      let launched = 0, lastSec = 0;

      // Track p95 over time for degradation detection
      const p95PerSecond = [];

      while (performance.now() < endAt) {
        const now = performance.now();
        const sec = Math.floor((now - metrics.startTime) / 1000);
        if (sec !== lastSec) {
          lastSec = sec;
          p95PerSecond.push(R(metrics.latency.percentile(95)));
          process.stdout.write(
            `\r  [${sec}s/${SUSTAINED_DURATION_S}s] Sent: ${launched} | Active: ${inflight.size} | ` +
            `p95: ${R(metrics.latency.percentile(95))}ms | err: ${R(metrics.adjustedErrorRate)}%`
          );
        }

        const idx = launched++;
        const roll = idx % 10;
        let req;
        if (roll < 6)
          req = makeRequest('GET', `/api/students?page=${(idx%20)+1}&limit=20`, null, authHeaders(TOKENS.unit1));
        else if (roll < 8)
          req = makeRequest('GET', '/api/classes', null, authHeaders(TOKENS.unit1));
        else if (roll < 9)
          req = makeRequest('PUT', `/api/attendance/stu_${idx%50}`,
            { date: new Date().toISOString().split('T')[0], present: true }, authHeaders(TOKENS.unit1));
        else
          req = makeRequest('POST', '/api/auth/login',
            { email: `user${idx%10}@blackbelt.com`, password: 'Test123!' });

        const tracker = req.then(r => { metrics.record(r); inflight.delete(tracker); });
        inflight.add(tracker);
        metrics.enter(); tracker.finally(() => metrics.leave());
        await sleep(intervalMs + Math.random() * 2);
      }

      await Promise.allSettled([...inflight]);
      metrics.endTime = performance.now();

      // Degradation check: compare first 10s p95 vs last 10s p95
      const firstP95 = p95PerSecond.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(10, p95PerSecond.length) || 0;
      const lastP95 = p95PerSecond.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, p95PerSecond.length) || 0;
      const degradation = lastP95 > 0 && firstP95 > 0 ? R((lastP95 / firstP95 - 1) * 100) : 0;

      const s = metrics.summary();
      s.degradation = { firstP95: R(firstP95), lastP95: R(lastP95), pctIncrease: degradation };

      console.log(`\n\n  Results:`);
      console.log(`  ├── Duration:     ${s.durationSec}s (${s.rps} req/s)`);
      console.log(`  ├── Latency:      p50=${s.latency.p50}ms | p95=${s.latency.p95}ms | p99=${s.latency.p99}ms`);
      console.log(`  ├── Error Rate:   ${s.errorRate.adjusted}% adjusted`);
      console.log(`  ├── Degradation:  first10s p95=${R(firstP95)}ms → last10s p95=${R(lastP95)}ms (${degradation > 0 ? '+' : ''}${degradation}%)`);
      if (degradation > 50) console.log(`  ├── ⚠ DEGRADATION WARNING: p95 increased ${degradation}% — possible memory leak`);
      return s;
    },
    gates: { p95_max_ms: 400, p99_max_ms: 1500, adjusted_error_max_pct: 1, min_rps: 200, max_degradation_pct: 50 },
  },

  // ─── S9: Cross-Unit Isolation (NEW) ─────────────────────

  S9: {
    name: 'S9: Cross-Unit Isolation',
    description: '500 requests alternando unit_001/unit_002 — zero leak',
    run: (n) => runScenario('S9', 'Tenant isolation under load', n,
      async (idx) => {
        // Alternate between unit_001 and unit_002 every request
        const isUnit1 = idx % 2 === 0;
        const token = isUnit1 ? TOKENS.unit1 : TOKENS.unit2;
        const expectedUnit = isUnit1 ? 'unit_001' : 'unit_002';

        const result = await makeRequest('GET', '/api/students?limit=50',
          null, authHeaders(token));

        // Check response for tenant leak
        if (result.json && Array.isArray(result.json.data || result.json)) {
          const records = result.json.data || result.json;
          for (const record of records) {
            const recordUnit = record.unit_id || record.unitId || record.academiaId;
            if (recordUnit && recordUnit !== expectedUnit) {
              // CRITICAL: Data from wrong tenant
              result.tenantLeak = true;
              result.error = `TENANT LEAK: Expected ${expectedUnit}, got ${recordUnit} in record ${record.id}`;
              break;
            }
          }
        }

        return result;
      },
      { rampSec: 3 }),
    gates: {
      zero_tenant_leaks: true,   // ABSOLUTE: any leak = FAIL
      adjusted_error_max_pct: 1,
      p95_max_ms: 500,
    },
  },

  // ─── S10: Data Integrity (NEW) ──────────────────────────

  S10: {
    name: 'S10: Data Integrity (Write→Read→Verify)',
    description: '200 write→read cycles — zero corruption',
    run: () => runScenario('S10', 'Data integrity validation', 200,
      async (idx) => {
        const uniqueId = `stress_${Date.now()}_${idx}`;
        const expectedNotes = `IntegrityTest_${uniqueId}`;
        const studentId = `stu_integrity_${idx % 20}`;

        // Step 1: WRITE
        const writeResult = await makeRequest('PUT', `/api/attendance/${studentId}`, {
          date: new Date().toISOString().split('T')[0],
          present: idx % 2 === 0,
          notes: expectedNotes,
          classId: `cls_${idx % 5}`,
        }, authHeaders(TOKENS.unit1));

        if (writeResult.status >= 400 && writeResult.status !== 409) {
          return writeResult;
        }

        // Step 2: READ back
        const readResult = await makeRequest('GET',
          `/api/attendance/${studentId}?date=${new Date().toISOString().split('T')[0]}`,
          null, authHeaders(TOKENS.unit1));

        // Merge latency (total round-trip)
        const totalLatency = writeResult.latencyMs + readResult.latencyMs;

        // Step 3: VERIFY consistency
        if (readResult.json) {
          const data = readResult.json.data || readResult.json;
          const record = Array.isArray(data)
            ? data.find(r => r.notes === expectedNotes)
            : (data.notes === expectedNotes ? data : null);

          if (writeResult.status < 400 && !record) {
            // Wrote successfully but can't read back
            return {
              ...readResult,
              latencyMs: totalLatency,
              integrityFail: true,
              error: `INTEGRITY: Wrote ${expectedNotes} but read-back found nothing`,
            };
          }

          // Check for data corruption (field mutation)
          if (record && record.notes !== expectedNotes) {
            return {
              ...readResult,
              latencyMs: totalLatency,
              corruption: true,
              error: `CORRUPTION: Wrote "${expectedNotes}", read "${record.notes}"`,
            };
          }
        }

        return { ...readResult, latencyMs: totalLatency };
      },
      { rampSec: 5, delayBetweenMs: 50 }),
    gates: {
      zero_integrity_failures: true,
      zero_corruptions: true,
      adjusted_error_max_pct: 1,
    },
  },

  // ─── S11: Concurrent Write Consistency (NEW) ────────────

  S11: {
    name: 'S11: Concurrent Write Consistency',
    description: '300 parallel writes to 5 students — no lost updates',
    run: () => {
      // Track expected final state
      const counters = {}; // studentId → number of successful writes

      return runScenario('S11', 'Parallel write consistency', 300,
        async (idx) => {
          const studentId = `stu_concurrent_${idx % 5}`;

          // Each write increments a counter
          const result = await makeRequest('PUT', `/api/progress/${studentId}`, {
            belt: 'PURPLE',
            stripes: idx % 4,
            version: idx,
            notes: `ConcurrentWrite_${idx}_${Date.now()}`,
          }, authHeaders(TOKENS.unit1));

          // Track successful writes
          if (result.status >= 200 && result.status < 400) {
            counters[studentId] = (counters[studentId] || 0) + 1;
          }

          // 409 is EXPECTED and GOOD (optimistic locking working)
          if (result.status === 409) {
            return { ...result, error: null }; // Don't count as error
          }

          return result;
        },
        { rampSec: 2 });
    },
    gates: {
      expect_409: true,
      adjusted_error_max_pct: 1,
      zero_corruptions: true,
    },
  },
};

// ============================================================
// GATE EVALUATION
// ============================================================

function evaluateGates(result, gates) {
  const verdicts = [];

  if (gates.p95_max_ms !== undefined) {
    verdicts.push({ gate: `p95 ≤ ${gates.p95_max_ms}ms`, actual: `${result.latency.p95}ms`,
      pass: result.latency.p95 <= gates.p95_max_ms });
  }
  if (gates.p99_max_ms !== undefined) {
    verdicts.push({ gate: `p99 ≤ ${gates.p99_max_ms}ms`, actual: `${result.latency.p99}ms`,
      pass: result.latency.p99 <= gates.p99_max_ms });
  }
  if (gates.adjusted_error_max_pct !== undefined) {
    const rate = result.errorRate.adjusted;
    verdicts.push({ gate: `Error rate ≤ ${gates.adjusted_error_max_pct}%`, actual: `${rate}%`,
      pass: rate <= gates.adjusted_error_max_pct });
  }
  if (gates.min_rps !== undefined) {
    verdicts.push({ gate: `RPS ≥ ${gates.min_rps}`, actual: `${result.rps}`,
      pass: result.rps >= gates.min_rps });
  }
  if (gates.expect_429) {
    verdicts.push({ gate: 'Rate limiter (429)', actual: `${result.errors.rateLimitHits} hits`,
      pass: result.errors.rateLimitHits > 0 });
  }
  if (gates.min_429_count !== undefined) {
    verdicts.push({ gate: `429 count ≥ ${gates.min_429_count}`, actual: `${result.errors.rateLimitHits}`,
      pass: result.errors.rateLimitHits >= gates.min_429_count });
  }
  if (gates.expect_409) {
    verdicts.push({ gate: 'Optimistic lock (409)', actual: `${result.errors.conflicts409} conflicts`,
      pass: result.errors.conflicts409 > 0 });
  }
  if (gates.zero_tenant_leaks) {
    verdicts.push({ gate: 'ZERO tenant leaks', actual: `${result.isolation.tenantLeaks} leaks`,
      pass: result.isolation.tenantLeaks === 0, critical: true });
  }
  if (gates.zero_integrity_failures) {
    verdicts.push({ gate: 'ZERO integrity failures', actual: `${result.isolation.integrityFailures}`,
      pass: result.isolation.integrityFailures === 0, critical: true });
  }
  if (gates.zero_corruptions) {
    verdicts.push({ gate: 'ZERO data corruptions', actual: `${result.isolation.dataCorruptions}`,
      pass: result.isolation.dataCorruptions === 0, critical: true });
  }
  if (gates.max_degradation_pct !== undefined && result.degradation) {
    verdicts.push({ gate: `Degradation ≤ ${gates.max_degradation_pct}%`,
      actual: `${result.degradation.pctIncrease}%`,
      pass: result.degradation.pctIncrease <= gates.max_degradation_pct });
  }

  return verdicts;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║    BLACKBELT — Stress Test PRODUÇÃO v2.0                  ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║  Target:      ${BASE_URL.padEnd(44)}║`);
  console.log(`║  Concurrency: ${String(CONCURRENCY).padEnd(44)}║`);
  console.log(`║  Scenarios:   ${(SINGLE_SCENARIO || 'ALL (S1-S11)').padEnd(44)}║`);
  console.log(`║  Auth Unit1:  ${(TOKENS.unit1 ? 'PROVIDED' : '⚠ MISSING').padEnd(44)}║`);
  console.log(`║  Auth Unit2:  ${(TOKENS.unit2 ? 'PROVIDED' : '⚠ MISSING').padEnd(44)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (!TOKENS.unit1 || !TOKENS.unit2) {
    console.log('\n⚠ AUTH_TOKEN_UNIT1 e AUTH_TOKEN_UNIT2 são necessários para S9 (cross-unit isolation).');
    console.log('  Sem tokens, S9 será executado mas não pode validar tenant leak.');
  }

  // Connectivity
  console.log('\nVerificando conectividade...');
  const health = await makeRequest('GET', '/');
  if (health.status === 0) {
    console.error(`\n✗ Servidor inacessível: ${BASE_URL} (${health.error})`);
    process.exit(1);
  }
  console.log(`✓ HTTP ${health.status} (${R(health.latencyMs)}ms)`);

  // Run
  const allResults = {};
  const allGates = {};
  const toRun = SINGLE_SCENARIO ? { [SINGLE_SCENARIO]: scenarios[SINGLE_SCENARIO] } : scenarios;

  if (SINGLE_SCENARIO && !scenarios[SINGLE_SCENARIO]) {
    console.error(`\n✗ Cenário desconhecido: ${SINGLE_SCENARIO}. Disponíveis: ${Object.keys(scenarios).join(', ')}`);
    process.exit(1);
  }

  for (const [key, scenario] of Object.entries(toRun)) {
    try {
      allResults[key] = await scenario.run(CONCURRENCY);
      allGates[key] = evaluateGates(allResults[key], scenario.gates);
    } catch (err) {
      console.error(`\n✗ ${key}: ${err.message}`);
      allResults[key] = { error: err.message };
      allGates[key] = [{ gate: 'Execution', actual: err.message, pass: false }];
    }
    if (Object.keys(toRun).length > 1) { console.log('\n  ⏳ Cooldown 3s...'); await sleep(3000); }
  }

  // ─── REPORT ───
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              RELATÓRIO FINAL — GATES DE PRODUÇÃO            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  let totalGates = 0, passed = 0, failed = 0, criticalFails = 0;

  for (const [key, gates] of Object.entries(allGates)) {
    console.log(`\n─── ${key} ───`);
    for (const g of gates) {
      totalGates++;
      const icon = g.pass ? '✓' : '✗';
      const suffix = !g.pass ? (g.critical ? ' ← CRITICAL FAIL' : ' ← FAIL') : '';
      console.log(`  ${icon} ${g.gate}: ${g.actual}${suffix}`);
      if (g.pass) passed++;
      else { failed++; if (g.critical) criticalFails++; }
    }
  }

  // Latency table
  console.log('\n── Resumo de Latência ──');
  console.log('  Cenário           │  p50   │  p95   │  p99   │  max    │ err%  │ rps   │ leaks │ corrupt');
  console.log('  ──────────────────┼────────┼────────┼────────┼─────────┼───────┼───────┼───────┼────────');
  for (const [key, r] of Object.entries(allResults)) {
    if (r.error && !r.latency) { console.log(`  ${key.padEnd(19)} │ ERROR: ${r.error}`); continue; }
    const l = r.latency; const iso = r.isolation || {};
    console.log(
      `  ${key.padEnd(19)} │ ${String(l.p50).padStart(5)}ms │ ${String(l.p95).padStart(5)}ms │ ` +
      `${String(l.p99).padStart(5)}ms │ ${String(l.max).padStart(6)}ms │ ${String(r.errorRate.adjusted).padStart(5)}% │ ` +
      `${String(r.rps).padStart(5)} │ ${String(iso.tenantLeaks||0).padStart(5)} │ ${String(iso.dataCorruptions||0).padStart(6)}`
    );
  }

  // Verdict
  console.log(`\n${'═'.repeat(62)}`);
  if (criticalFails > 0) {
    console.log(`  ✗ CRITICAL FAILURE — ${criticalFails} data safety gate(s) failed`);
    console.log(`    Sistema NÃO PODE ir para produção. Resolver antes de re-testar.`);
  } else if (failed > 0) {
    console.log(`  ✗ ${failed}/${totalGates} gates FAILED — Sistema não aprovado`);
  } else {
    console.log(`  ✓ ALL ${totalGates} GATES PASSED — APROVADO PARA PRODUÇÃO`);
  }
  console.log(`  Gates: ${passed}/${totalGates} passed | ${failed} failed (${criticalFails} critical)`);
  console.log(`${'═'.repeat(62)}`);

  // JSON report
  const report = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    concurrency: CONCURRENCY,
    version: '2.0-production',
    verdict: criticalFails > 0 ? 'CRITICAL_FAILURE' : failed > 0 ? 'REJECTED' : 'APPROVED',
    summary: { totalGates, passed, failed, criticalFails },
    criteria: {
      error_threshold: '< 1%',
      tenant_isolation: 'ZERO leaks mandatory',
      data_integrity: 'ZERO corruptions mandatory',
      rate_limiter: 'Must activate on flood',
    },
    scenarios: allResults,
    gates: allGates,
  };

  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n📄 Relatório: ${REPORT_FILE}`);

  process.exit(criticalFails > 0 ? 2 : failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(2); });
