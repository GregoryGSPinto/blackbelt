/**
 * BLACKBELT — Stress Test Concorrente
 * Fase 2: Fortalecimento
 *
 * Simula 500 requisições paralelas para identificar:
 * - Degradação de latência sob carga
 * - Erros de concorrência (409, 500, 503)
 * - Limite do connection pool
 * - Comportamento do rate limiter sob flood
 *
 * Execução: BASE_URL=http://localhost:3000 node scripts/stress-test.js
 * Opções:  CONCURRENCY=500 DURATION=30 RAMP=5
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TOTAL_REQUESTS = parseInt(process.env.CONCURRENCY || '500');
const RAMP_SECONDS = parseInt(process.env.RAMP || '5');
const TIMEOUT_MS = 15_000;

// ============================================================
// METRICS COLLECTOR
// ============================================================

class StressMetrics {
  constructor() {
    this.latencies = [];
    this.statusCodes = {};
    this.errors = [];
    this.startTime = 0;
    this.endTime = 0;
    this.concurrentPeak = 0;
    this._active = 0;
  }

  record(result) {
    this.latencies.push(result.latency);
    this.statusCodes[result.status] = (this.statusCodes[result.status] || 0) + 1;
    if (result.error) this.errors.push(result.error);
  }

  trackConcurrency(delta) {
    this._active += delta;
    if (this._active > this.concurrentPeak) this.concurrentPeak = this._active;
  }

  percentile(p) {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const idx = Math.ceil(sorted.length * p / 100) - 1;
    return sorted[Math.max(0, idx)] || 0;
  }

  summary() {
    const sorted = [...this.latencies].sort((a, b) => a - b);
    const total = this.latencies.length;
    const duration = (this.endTime - this.startTime) / 1000;
    const success = Object.entries(this.statusCodes)
      .filter(([code]) => parseInt(code) < 400)
      .reduce((s, [, c]) => s + c, 0);
    const errors = total - success;

    return {
      totalRequests: total,
      duration: `${duration.toFixed(1)}s`,
      rps: (total / duration).toFixed(1),
      concurrentPeak: this.concurrentPeak,
      successRate: `${((success / total) * 100).toFixed(1)}%`,
      errorRate: `${((errors / total) * 100).toFixed(1)}%`,
      statusCodes: this.statusCodes,
      latency: {
        min: sorted[0] || 0,
        avg: Math.round(this.latencies.reduce((s, l) => s + l, 0) / total),
        p50: this.percentile(50),
        p95: this.percentile(95),
        p99: this.percentile(99),
        max: sorted[sorted.length - 1] || 0,
      },
      errors: this.errors.slice(0, 10), // First 10 unique errors
    };
  }
}

// ============================================================
// REQUEST ENGINE
// ============================================================

async function fireRequest(path, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { status: res.status, latency: Date.now() - start };
  } catch (err) {
    clearTimeout(timer);
    const latency = Date.now() - start;
    if (err.name === 'AbortError') {
      return { status: 0, latency, error: `TIMEOUT (${TIMEOUT_MS}ms)` };
    }
    return { status: 0, latency, error: err.code || err.message };
  }
}

// ============================================================
// SCENARIOS
// ============================================================

async function runScenario(name, description, requestFn) {
  const metrics = new StressMetrics();
  console.log(`\n─── ${name} ───`);
  console.log(`    ${description}`);
  console.log(`    Requests: ${TOTAL_REQUESTS} | Ramp: ${RAMP_SECONDS}s`);

  metrics.startTime = Date.now();

  // Ramp-up: distribute requests across ramp period
  const batchSize = Math.ceil(TOTAL_REQUESTS / RAMP_SECONDS);
  const promises = [];

  for (let batch = 0; batch < RAMP_SECONDS; batch++) {
    const batchStart = batch * batchSize;
    const batchEnd = Math.min(batchStart + batchSize, TOTAL_REQUESTS);

    for (let i = batchStart; i < batchEnd; i++) {
      const delay = (batch * 1000) + (Math.random() * 800); // Jitter within second
      const p = new Promise(resolve => setTimeout(resolve, delay))
        .then(() => {
          metrics.trackConcurrency(1);
          return requestFn(i);
        })
        .then(result => {
          metrics.record(result);
          metrics.trackConcurrency(-1);
          return result;
        })
        .catch(err => {
          metrics.record({ status: 0, latency: 0, error: err.message });
          metrics.trackConcurrency(-1);
        });
      promises.push(p);
    }
  }

  await Promise.all(promises);
  metrics.endTime = Date.now();

  return metrics.summary();
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   BLACKBELT — Stress Test Concorrente             ║');
  console.log(`║   Target: ${BASE_URL.padEnd(42)}║`);
  console.log(`║   Requests: ${String(TOTAL_REQUESTS).padEnd(40)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  const allResults = {};

  // Scenario 1: Read flood (GET students)
  allResults['read_flood'] = await runScenario(
    'S1: Read Flood',
    `${TOTAL_REQUESTS} GET /api/students simultâneos`,
    (i) => fireRequest('/api/students')
  );

  // Scenario 2: Auth flood (POST login)
  allResults['auth_flood'] = await runScenario(
    'S2: Auth Flood',
    `${TOTAL_REQUESTS} POST /api/auth/login simultâneos`,
    (i) => fireRequest('/api/auth/login', {
      method: 'POST',
      body: { email: `user${i}@test.com`, password: 'wrong' },
    })
  );

  // Scenario 3: Write contention (concurrent updates to same resource)
  allResults['write_contention'] = await runScenario(
    'S3: Write Contention',
    `${TOTAL_REQUESTS} PUT /api/students/1 simultâneos (optimistic locking)`,
    (i) => fireRequest('/api/students/1', {
      method: 'PUT',
      body: { nome: `Student ${i}`, version: 1 },
    })
  );

  // Scenario 4: Mixed workload (80% read, 20% write)
  allResults['mixed_workload'] = await runScenario(
    'S4: Mixed Workload',
    `${TOTAL_REQUESTS} requests (80% GET, 20% POST)`,
    (i) => i % 5 === 0
      ? fireRequest('/api/students', {
          method: 'POST',
          body: { nome: `New Student ${i}`, email: `s${i}@test.com` },
        })
      : fireRequest('/api/students')
  );

  // Print results
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   RESULTADOS CONSOLIDADOS                           ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  for (const [scenario, result] of Object.entries(allResults)) {
    console.log(`─── ${scenario} ───`);
    console.log(`  RPS: ${result.rps} | Duration: ${result.duration}`);
    console.log(`  Success: ${result.successRate} | Errors: ${result.errorRate}`);
    console.log(`  Latency: min=${result.latency.min}ms avg=${result.latency.avg}ms p95=${result.latency.p95}ms p99=${result.latency.p99}ms max=${result.latency.max}ms`);
    console.log(`  Peak concurrent: ${result.concurrentPeak}`);
    console.log(`  Status: ${JSON.stringify(result.statusCodes)}`);
    if (result.errors.length > 0) {
      console.log(`  Errors: ${result.errors.slice(0, 3).join(', ')}`);
    }
    console.log('');
  }

  // Determine pass/fail thresholds
  const checks = [];
  for (const [name, r] of Object.entries(allResults)) {
    const p99 = r.latency.p99;
    const errorPct = parseFloat(r.errorRate);
    checks.push({
      scenario: name,
      p99ok: p99 < 3000,
      errorsOk: errorPct < 10,
      p99, errorPct,
    });
  }

  console.log('─── VALIDAÇÃO ───');
  for (const c of checks) {
    const icon = c.p99ok && c.errorsOk ? '✅' : '❌';
    console.log(`${icon} ${c.scenario}: p99=${c.p99}ms (<3000ms: ${c.p99ok}), errors=${c.errorPct}% (<10%: ${c.errorsOk})`);
  }

  // Save report
  const report = {
    target: BASE_URL,
    timestamp: new Date().toISOString(),
    config: { totalRequests: TOTAL_REQUESTS, rampSeconds: RAMP_SECONDS, timeoutMs: TIMEOUT_MS },
    scenarios: allResults,
    validation: checks,
  };
  const reportPath = process.env.REPORT_PATH || './stress-test-report.json';
  require('fs').writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nRelatório: ${reportPath}`);
}

main().catch(console.error);
