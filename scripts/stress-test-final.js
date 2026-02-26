#!/usr/bin/env node

/**
 * BLACKBELT — Stress Test Final: Validação Pré-Go-Live
 * 
 * 8 cenários cobrindo toda superfície de carga:
 *   S1: Read Flood (GET /api/students paginado)
 *   S2: Login Flood (POST /api/auth/login)
 *   S3: Progress Update Contention (PUT concurrent no mesmo recurso)
 *   S4: Mixed Workload (70% read, 20% write, 10% auth)
 *   S5: Burst Spike (0→500 instantâneo)
 *   S6: Rate Limiter Validation (must trigger 429)
 *   S7: Large Payload (POST com body grande)
 *   S8: Sustained Load (500 req/s por 60 segundos)
 * 
 * Execução:
 *   BASE_URL=http://localhost:3000 node scripts/stress-test-final.js
 *   BASE_URL=http://staging:3000 CONCURRENCY=500 node scripts/stress-test-final.js
 *   BASE_URL=http://staging:3000 SCENARIO=S3 node scripts/stress-test-final.js
 * 
 * Variáveis:
 *   BASE_URL      — URL do servidor (obrigatório)
 *   CONCURRENCY   — Requests simultâneas (default: 500)
 *   RAMP          — Segundos de ramp-up (default: 5)
 *   SCENARIO      — Executar apenas 1 cenário (S1-S8)
 *   AUTH_TOKEN     — JWT válido para requests autenticadas
 *   DURATION      — Duração do S8 em segundos (default: 60)
 *   REPORT_FILE   — Path do relatório JSON (default: stress-report.json)
 */

'use strict';

const http = require('http');
const https = require('https');

// ============================================================
// CONFIG
// ============================================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = parseInt(process.env.CONCURRENCY || '500');
const RAMP_SECONDS = parseInt(process.env.RAMP || '5');
const TIMEOUT_MS = 15_000;
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';
const SINGLE_SCENARIO = process.env.SCENARIO || '';
const SUSTAINED_DURATION_S = parseInt(process.env.DURATION || '60');
const REPORT_FILE = process.env.REPORT_FILE || 'stress-report.json';

const isHttps = BASE_URL.startsWith('https');
const httpModule = isHttps ? https : http;

// Keep-alive agent for connection reuse
const agent = new (isHttps ? https : http).Agent({
  keepAlive: true,
  maxSockets: CONCURRENCY,
  maxFreeSockets: 64,
  timeout: TIMEOUT_MS,
});

// ============================================================
// METRICS ENGINE (HDR-style histogram)
// ============================================================

class Histogram {
  constructor() {
    this.values = [];
    this.min = Infinity;
    this.max = 0;
    this.sum = 0;
  }

  record(v) {
    this.values.push(v);
    if (v < this.min) this.min = v;
    if (v > this.max) this.max = v;
    this.sum += v;
  }

  percentile(p) {
    if (this.values.length === 0) return 0;
    const sorted = [...this.values].sort((a, b) => a - b);
    const idx = Math.ceil(sorted.length * p / 100) - 1;
    return sorted[Math.max(0, idx)];
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
    this.connectionErrors = 0;
    this.timeouts = 0;
    this.startTime = 0;
    this.endTime = 0;
    this._active = 0;
    this.peakConcurrent = 0;
    this.rateLimitHits = 0;
    this.conflicts409 = 0;
  }

  record(result) {
    this.latency.record(result.latencyMs);
    const code = result.status || 0;
    this.statusCodes[code] = (this.statusCodes[code] || 0) + 1;
    if (code === 429) this.rateLimitHits++;
    if (code === 409) this.conflicts409++;
    if (result.error) {
      this.errors.push(result.error);
      if (result.error.includes('ECONNREFUSED') || result.error.includes('ECONNRESET')) {
        this.connectionErrors++;
      }
      if (result.error.includes('timeout') || result.error.includes('AbortError')) {
        this.timeouts++;
      }
    }
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
  
  get errorCount() { return this.totalRequests - this.successCount; }
  get errorRate() { return this.totalRequests > 0 ? (this.errorCount / this.totalRequests * 100) : 0; }

  summary() {
    return {
      scenario: this.name,
      totalRequests: this.totalRequests,
      durationSec: round(this.durationSec),
      rps: round(this.rps),
      peakConcurrent: this.peakConcurrent,
      latency: {
        min: round(this.latency.min === Infinity ? 0 : this.latency.min),
        mean: round(this.latency.mean),
        p50: round(this.latency.percentile(50)),
        p95: round(this.latency.percentile(95)),
        p99: round(this.latency.percentile(99)),
        max: round(this.latency.max),
      },
      statusCodes: { ...this.statusCodes },
      errorRate: round(this.errorRate),
      errors: {
        total: this.errorCount,
        connections: this.connectionErrors,
        timeouts: this.timeouts,
        rateLimitHits: this.rateLimitHits,
        conflicts409: this.conflicts409,
      },
    };
  }
}

function round(v) { return Math.round(v * 100) / 100; }

// ============================================================
// HTTP ENGINE
// ============================================================

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve) => {
    const start = performance.now();
    const url = new URL(path, BASE_URL);
    
    const defaultHeaders = {
      'Accept': 'application/json',
      'User-Agent': 'BlackBeltStressTest/2.0',
    };
    
    if (AUTH_TOKEN) {
      defaultHeaders['Authorization'] = `Bearer ${AUTH_TOKEN}`;
    }
    
    if (body) {
      defaultHeaders['Content-Type'] = 'application/json';
    }
    
    const allHeaders = { ...defaultHeaders, ...headers };
    const bodyStr = body ? JSON.stringify(body) : null;
    if (bodyStr) allHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: allHeaders,
      agent,
      timeout: TIMEOUT_MS,
    };
    
    const req = httpModule.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          latencyMs: performance.now() - start,
          body: data,
          headers: res.headers,
          error: null,
        });
      });
    });
    
    req.on('error', (err) => {
      resolve({
        status: 0,
        latencyMs: performance.now() - start,
        body: null,
        headers: {},
        error: err.message || err.code || 'Unknown error',
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 0,
        latencyMs: performance.now() - start,
        body: null,
        headers: {},
        error: 'timeout',
      });
    });
    
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
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
  
  // Ramp-up: distribute launches over rampSec seconds
  const batchSize = rampSec > 0 ? Math.ceil(count / rampSec) : count;
  const batchDelayMs = rampSec > 0 ? 1000 : 0;
  
  const promises = [];
  let launched = 0;
  let batch = 0;
  
  while (launched < count) {
    const thisBatch = Math.min(batchSize, count - launched);
    batch++;
    
    for (let i = 0; i < thisBatch; i++) {
      const idx = launched + i;
      const p = (async () => {
        if (delayBetweenMs > 0) {
          await sleep(Math.random() * delayBetweenMs);
        }
        metrics.enter();
        try {
          const result = await requestFn(idx);
          metrics.record(result);
        } finally {
          metrics.leave();
        }
      })();
      promises.push(p);
    }
    
    launched += thisBatch;
    
    // Progress
    const pct = Math.round(launched / count * 100);
    process.stdout.write(`\r  Launched: ${launched}/${count} (${pct}%) | Active: ${metrics._active}`);
    
    if (launched < count && batchDelayMs > 0) {
      await sleep(batchDelayMs);
    }
  }
  
  // Wait for all to complete
  await Promise.allSettled(promises);
  metrics.endTime = performance.now();
  
  // Print results
  const s = metrics.summary();
  console.log(`\n\n  Results:`);
  console.log(`  ├── Duration:     ${s.durationSec}s (${s.rps} req/s)`);
  console.log(`  ├── Peak:         ${s.peakConcurrent} concurrent`);
  console.log(`  ├── Latency:      p50=${s.latency.p50}ms | p95=${s.latency.p95}ms | p99=${s.latency.p99}ms | max=${s.latency.max}ms`);
  console.log(`  ├── Status:       ${JSON.stringify(s.statusCodes)}`);
  console.log(`  ├── Error Rate:   ${s.errorRate}%`);
  if (s.errors.rateLimitHits > 0) console.log(`  ├── Rate Limits:  ${s.errors.rateLimitHits} (429s)`);
  if (s.errors.conflicts409 > 0) console.log(`  ├── Conflicts:    ${s.errors.conflicts409} (409s)`);
  if (s.errors.connections > 0) console.log(`  ├── Conn Errors:  ${s.errors.connections}`);
  if (s.errors.timeouts > 0) console.log(`  ├── Timeouts:     ${s.errors.timeouts}`);
  
  return s;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================
// 8 SCENARIOS
// ============================================================

const scenarios = {

  // ─── S1: Read Flood (paginação) ─────────────────────────
  S1: {
    name: 'S1: Read Flood (Listagem Paginada)',
    description: '500 GET /api/students?page=N simultâneos',
    run: (count) => runScenario(
      'S1', '500 GET /api/students?page=N simultâneos', count,
      async (idx) => {
        const page = (idx % 10) + 1;
        return makeRequest('GET', `/api/students?page=${page}&limit=20&unit_id=unit_001`);
      }
    ),
    gates: {
      p95_max_ms: 500,
      p99_max_ms: 1000,
      error_rate_max_pct: 5,
      min_rps: 50,
    },
  },

  // ─── S2: Login Flood ────────────────────────────────────
  S2: {
    name: 'S2: Login Flood',
    description: '500 POST /api/auth/login simultâneos',
    run: (count) => runScenario(
      'S2', '500 POST /api/auth/login simultâneos', count,
      async (idx) => {
        // Rotate between valid and invalid credentials
        const isValid = idx % 5 === 0; // 20% valid, 80% invalid
        return makeRequest('POST', '/api/auth/login', {
          email: isValid ? `professor${idx % 3}@blackbelt.com` : `attacker${idx}@fake.com`,
          password: isValid ? 'ValidPassword123!' : 'wrong_password',
        });
      },
      { rampSec: 3 } // Faster ramp to stress auth
    ),
    gates: {
      p95_max_ms: 1000,
      p99_max_ms: 2000,
      error_rate_max_pct: 85, // Expected: 80% fail (intentional invalid creds)
      min_rps: 30,
      expect_429: true, // Rate limiter MUST activate
    },
  },

  // ─── S3: Progress Update Contention (409 expected) ──────
  S3: {
    name: 'S3: Progress Update Contention',
    description: '500 PUT /api/progress/stu_001 no MESMO recurso',
    run: (count) => runScenario(
      'S3', '500 PUT /api/progress/stu_001 no MESMO recurso', count,
      async (idx) => {
        // Todos atualizando o MESMO student progress
        // Optimistic locking deve gerar 409 Conflict
        return makeRequest('PUT', '/api/progress/stu_001', {
          belt: 'BLUE',
          stripes: idx % 4,
          version: 1, // Stale version → 409 expected
          notes: `Stress test update #${idx}`,
        });
      },
      { rampSec: 2 } // Fast ramp to maximize contention
    ),
    gates: {
      p95_max_ms: 1000,
      p99_max_ms: 2000,
      error_rate_max_pct: 10, // Excluding expected 409s
      expect_409: true, // MUST see 409 Conflict (optimistic locking works)
    },
  },

  // ─── S4: Mixed Workload ─────────────────────────────────
  S4: {
    name: 'S4: Mixed Workload (70R/20W/10A)',
    description: '500 requests: 70% GET, 20% PUT, 10% POST login',
    run: (count) => runScenario(
      'S4', '500 requests: 70% GET, 20% PUT, 10% POST login', count,
      async (idx) => {
        const roll = idx % 10;
        if (roll < 7) {
          // 70% READ
          const page = (idx % 10) + 1;
          return makeRequest('GET', `/api/students?page=${page}&limit=20`);
        } else if (roll < 9) {
          // 20% WRITE
          const studentId = `stu_${String(idx % 50).padStart(3, '0')}`;
          return makeRequest('PUT', `/api/attendance/${studentId}`, {
            date: new Date().toISOString().split('T')[0],
            present: true,
            classId: `cls_${idx % 5}`,
          });
        } else {
          // 10% AUTH
          return makeRequest('POST', '/api/auth/login', {
            email: `user${idx % 10}@blackbelt.com`,
            password: 'TestPassword123!',
          });
        }
      }
    ),
    gates: {
      p95_max_ms: 500,
      p99_max_ms: 1500,
      error_rate_max_pct: 5,
      min_rps: 50,
    },
  },

  // ─── S5: Burst Spike (0→500 instantâneo) ────────────────
  S5: {
    name: 'S5: Burst Spike (0→500 instant)',
    description: '500 requests enviadas simultaneamente sem ramp-up',
    run: (count) => runScenario(
      'S5', '500 requests simultaneamente sem ramp-up', count,
      async (idx) => {
        return makeRequest('GET', `/api/classes?unit_id=unit_${(idx % 3) + 1}`);
      },
      { rampSec: 0 } // ZERO ramp — all at once
    ),
    gates: {
      p95_max_ms: 2000,
      p99_max_ms: 5000,
      error_rate_max_pct: 10,
      min_rps: 30,
    },
  },

  // ─── S6: Rate Limiter Validation ────────────────────────
  S6: {
    name: 'S6: Rate Limiter Validation',
    description: '200 login attempts do MESMO IP (must trigger 429)',
    run: () => runScenario(
      'S6', '200 login attempts from same IP', 200,
      async (idx) => {
        return makeRequest('POST', '/api/auth/login', {
          email: 'attacker@evil.com',
          password: 'bruteforce_attempt_' + idx,
        }, {
          'X-Forwarded-For': '203.0.113.66', // Same IP
        });
      },
      { rampSec: 1 } // Fast — simulate real brute force
    ),
    gates: {
      expect_429: true,
      min_429_count: 150, // Must block ≥150 of 200 attempts
    },
  },

  // ─── S7: Large Payload ──────────────────────────────────
  S7: {
    name: 'S7: Large Payload Handling',
    description: '100 POST com body 100KB cada',
    run: () => {
      // Generate 100KB body
      const largeNotes = 'A'.repeat(100_000);
      return runScenario(
        'S7', '100 POST with 100KB body each', 100,
        async (idx) => {
          return makeRequest('POST', '/api/evaluations', {
            studentId: `stu_${idx % 50}`,
            professorId: 'prof_001',
            notes: largeNotes,
            grade: idx % 5,
            date: new Date().toISOString(),
          });
        },
        { rampSec: 2 }
      );
    },
    gates: {
      p95_max_ms: 2000,
      error_rate_max_pct: 5,
    },
  },

  // ─── S8: Sustained Load (endurance) ─────────────────────
  S8: {
    name: 'S8: Sustained Load (60s)',
    description: `~500 req/s sustained for ${SUSTAINED_DURATION_S}s`,
    run: async () => {
      const metrics = new ScenarioMetrics('S8');
      const targetRPS = 500;
      const intervalMs = 1000 / targetRPS;
      
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`  S8: Sustained Load`);
      console.log(`  Target: ${targetRPS} req/s for ${SUSTAINED_DURATION_S}s | Total: ~${targetRPS * SUSTAINED_DURATION_S} requests`);
      console.log(`${'═'.repeat(60)}`);
      
      metrics.startTime = performance.now();
      const endAt = metrics.startTime + SUSTAINED_DURATION_S * 1000;
      
      const inflight = new Set();
      let totalLaunched = 0;
      let secondCounter = 0;
      let lastSecond = Math.floor(metrics.startTime / 1000);
      
      while (performance.now() < endAt) {
        const now = performance.now();
        const currentSecond = Math.floor(now / 1000);
        
        // Progress every second
        if (currentSecond !== lastSecond) {
          lastSecond = currentSecond;
          secondCounter++;
          const elapsed = round((now - metrics.startTime) / 1000);
          const currentRPS = round(totalLaunched / elapsed);
          process.stdout.write(
            `\r  [${elapsed}s/${SUSTAINED_DURATION_S}s] Launched: ${totalLaunched} | ` +
            `Active: ${inflight.size} | RPS: ${currentRPS} | ` +
            `p95: ${round(metrics.latency.percentile(95))}ms`
          );
        }
        
        // Launch request
        const idx = totalLaunched++;
        const page = (idx % 20) + 1;
        const roll = idx % 10;
        
        let reqPromise;
        if (roll < 6) {
          reqPromise = makeRequest('GET', `/api/students?page=${page}&limit=20`);
        } else if (roll < 8) {
          reqPromise = makeRequest('GET', `/api/classes?unit_id=unit_001`);
        } else if (roll < 9) {
          reqPromise = makeRequest('PUT', `/api/attendance/stu_${idx % 50}`, {
            date: new Date().toISOString().split('T')[0],
            present: true,
          });
        } else {
          reqPromise = makeRequest('POST', '/api/auth/login', {
            email: `user${idx % 10}@blackbelt.com`,
            password: 'TestPassword123!',
          });
        }
        
        const tracker = reqPromise.then(result => {
          metrics.record(result);
          inflight.delete(tracker);
        });
        inflight.add(tracker);
        metrics.enter();
        tracker.finally(() => metrics.leave());
        
        // Throttle to target RPS
        await sleep(intervalMs + Math.random() * 2);
      }
      
      // Wait for inflight
      await Promise.allSettled([...inflight]);
      metrics.endTime = performance.now();
      
      const s = metrics.summary();
      console.log(`\n\n  Results:`);
      console.log(`  ├── Duration:     ${s.durationSec}s`);
      console.log(`  ├── Total:        ${s.totalRequests} requests (${s.rps} req/s)`);
      console.log(`  ├── Peak:         ${s.peakConcurrent} concurrent`);
      console.log(`  ├── Latency:      p50=${s.latency.p50}ms | p95=${s.latency.p95}ms | p99=${s.latency.p99}ms`);
      console.log(`  ├── Status:       ${JSON.stringify(s.statusCodes)}`);
      console.log(`  ├── Error Rate:   ${s.errorRate}%`);
      if (s.errors.connections > 0) console.log(`  ├── Conn Errors:  ${s.errors.connections}`);
      if (s.errors.timeouts > 0) console.log(`  ├── Timeouts:     ${s.errors.timeouts}`);
      
      return s;
    },
    gates: {
      p95_max_ms: 500,
      p99_max_ms: 2000,
      error_rate_max_pct: 5,
      min_rps: 200,
    },
  },
};

// ============================================================
// GATE EVALUATION
// ============================================================

function evaluateGates(result, gates) {
  const verdicts = [];
  
  if (gates.p95_max_ms !== undefined) {
    const pass = result.latency.p95 <= gates.p95_max_ms;
    verdicts.push({
      gate: `p95 ≤ ${gates.p95_max_ms}ms`,
      actual: `${result.latency.p95}ms`,
      pass,
    });
  }
  
  if (gates.p99_max_ms !== undefined) {
    const pass = result.latency.p99 <= gates.p99_max_ms;
    verdicts.push({
      gate: `p99 ≤ ${gates.p99_max_ms}ms`,
      actual: `${result.latency.p99}ms`,
      pass,
    });
  }
  
  if (gates.error_rate_max_pct !== undefined) {
    const pass = result.errorRate <= gates.error_rate_max_pct;
    verdicts.push({
      gate: `Error rate ≤ ${gates.error_rate_max_pct}%`,
      actual: `${result.errorRate}%`,
      pass,
    });
  }
  
  if (gates.min_rps !== undefined) {
    const pass = result.rps >= gates.min_rps;
    verdicts.push({
      gate: `RPS ≥ ${gates.min_rps}`,
      actual: `${result.rps}`,
      pass,
    });
  }
  
  if (gates.expect_429) {
    const pass = result.errors.rateLimitHits > 0;
    verdicts.push({
      gate: 'Rate limiter triggered (429)',
      actual: `${result.errors.rateLimitHits} hits`,
      pass,
    });
  }
  
  if (gates.min_429_count !== undefined) {
    const pass = result.errors.rateLimitHits >= gates.min_429_count;
    verdicts.push({
      gate: `429 count ≥ ${gates.min_429_count}`,
      actual: `${result.errors.rateLimitHits}`,
      pass,
    });
  }
  
  if (gates.expect_409) {
    const pass = result.errors.conflicts409 > 0;
    verdicts.push({
      gate: 'Optimistic lock conflict (409)',
      actual: `${result.errors.conflicts409} conflicts`,
      pass,
    });
  }
  
  return verdicts;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   BLACKBELT — Stress Test Final: Validação Go-Live   ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Target:      ${BASE_URL.padEnd(40)}║`);
  console.log(`║  Concurrency: ${String(CONCURRENCY).padEnd(40)}║`);
  console.log(`║  Ramp:        ${(RAMP_SECONDS + 's').padEnd(40)}║`);
  console.log(`║  Auth:        ${(AUTH_TOKEN ? 'PROVIDED' : 'NONE').padEnd(40)}║`);
  console.log(`║  Scenarios:   ${(SINGLE_SCENARIO || 'ALL (S1-S8)').padEnd(40)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  // Connectivity check
  console.log('\nVerificando conectividade...');
  try {
    const healthCheck = await makeRequest('GET', '/');
    if (healthCheck.status === 0) {
      console.error(`\n✗ Servidor inacessível: ${BASE_URL}`);
      console.error(`  Error: ${healthCheck.error}`);
      console.error(`  Verifique se o servidor está rodando.`);
      process.exit(1);
    }
    console.log(`✓ Servidor respondeu: HTTP ${healthCheck.status} (${round(healthCheck.latencyMs)}ms)`);
  } catch (err) {
    console.error(`\n✗ Falha na conexão: ${err.message}`);
    process.exit(1);
  }
  
  // Run scenarios
  const allResults = {};
  const allGates = {};
  
  const scenariosToRun = SINGLE_SCENARIO
    ? { [SINGLE_SCENARIO]: scenarios[SINGLE_SCENARIO] }
    : scenarios;
  
  if (SINGLE_SCENARIO && !scenarios[SINGLE_SCENARIO]) {
    console.error(`\n✗ Cenário desconhecido: ${SINGLE_SCENARIO}`);
    console.error(`  Disponíveis: ${Object.keys(scenarios).join(', ')}`);
    process.exit(1);
  }
  
  for (const [key, scenario] of Object.entries(scenariosToRun)) {
    try {
      allResults[key] = await scenario.run(CONCURRENCY);
      allGates[key] = evaluateGates(allResults[key], scenario.gates);
    } catch (err) {
      console.error(`\n✗ Cenário ${key} falhou: ${err.message}`);
      allResults[key] = { error: err.message };
      allGates[key] = [{ gate: 'Execution', actual: err.message, pass: false }];
    }
    
    // Brief pause between scenarios to let server recover
    if (Object.keys(scenariosToRun).length > 1) {
      console.log('\n  ⏳ Cooldown 3s...');
      await sleep(3000);
    }
  }
  
  // ─── FINAL REPORT ───
  console.log('\n\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║               RELATÓRIO FINAL — GO-LIVE GATES          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  let totalGates = 0;
  let passedGates = 0;
  let failedGates = 0;
  
  for (const [key, gates] of Object.entries(allGates)) {
    console.log(`\n─── ${key} ───`);
    for (const g of gates) {
      totalGates++;
      const icon = g.pass ? '✓' : '✗';
      const color = g.pass ? '' : ' ← FAIL';
      if (g.pass) passedGates++;
      else failedGates++;
      console.log(`  ${icon} ${g.gate}: ${g.actual}${color}`);
    }
  }
  
  // Summary table
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  
  if (failedGates === 0) {
    console.log('║  ✓ ALL GATES PASSED — SISTEMA APROVADO PARA GO-LIVE    ║');
  } else {
    console.log(`║  ✗ ${failedGates}/${totalGates} GATES FAILED — SISTEMA NÃO APROVADO       ║`);
  }
  
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  Gates: ${passedGates}/${totalGates} passed                                     ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  
  // Latency summary table
  console.log('\n── Resumo de Latência ──');
  console.log('  Cenário                    │  p50   │  p95   │  p99   │  max   │ err%  │ rps');
  console.log('  ───────────────────────────┼────────┼────────┼────────┼────────┼───────┼──────');
  for (const [key, r] of Object.entries(allResults)) {
    if (r.error) {
      console.log(`  ${key.padEnd(27)} │ ERROR: ${r.error}`);
      continue;
    }
    const l = r.latency;
    console.log(
      `  ${key.padEnd(27)} │ ${String(l.p50).padStart(5)}ms │ ${String(l.p95).padStart(5)}ms │ ` +
      `${String(l.p99).padStart(5)}ms │ ${String(l.max).padStart(5)}ms │ ${String(r.errorRate).padStart(5)}% │ ${r.rps}`
    );
  }
  
  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    target: BASE_URL,
    concurrency: CONCURRENCY,
    rampSeconds: RAMP_SECONDS,
    scenarios: allResults,
    gates: allGates,
    verdict: failedGates === 0 ? 'APPROVED' : 'REJECTED',
    summary: {
      totalGates,
      passed: passedGates,
      failed: failedGates,
    },
  };
  
  const fs = require('fs');
  const reportPath = REPORT_FILE;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Relatório salvo: ${reportPath}`);
  
  // Exit code
  process.exit(failedGates > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\nFatal error:', err);
  process.exit(2);
});
