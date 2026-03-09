type Scenario = {
  name: string;
  run: () => Promise<void>;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const scenarios: Scenario[] = [
  {
    name: 'api-timeout',
    async run() {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25);

      try {
        await fetch('https://example.invalid/api/timeout', {
          signal: controller.signal,
        });
      } catch {
        return;
      } finally {
        clearTimeout(timeout);
      }

      throw new Error('timeout scenario did not fail as expected');
    },
  },
  {
    name: 'network-failure',
    async run() {
      try {
        await fetch('http://127.0.0.1:9/unreachable');
      } catch {
        return;
      }

      throw new Error('network scenario unexpectedly succeeded');
    },
  },
  {
    name: 'database-unavailable',
    async run() {
      await sleep(10);
      throw new Error('simulated database unavailable');
    },
  },
];

async function main() {
  let hasFailure = false;

  for (const scenario of scenarios) {
    try {
      await scenario.run();
      console.log(`[chaos:test] ${scenario.name}: expected failure observed`);
    } catch (error) {
      hasFailure = true;
      console.error(`[chaos:test] ${scenario.name}: unexpected result`, error);
    }
  }

  if (hasFailure) {
    process.exitCode = 1;
  }
}

void main();
