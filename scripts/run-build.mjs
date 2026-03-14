import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true' && !process.env.VERCEL;

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('next', ['build']);

if (isCapacitorBuild) {
  run('node', ['scripts/build-mobile-shell.mjs']);
}
