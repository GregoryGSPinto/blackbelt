#!/usr/bin/env tsx
/**
 * BlackBelt — Master Seed Script for Demo Environment
 *
 * Runs all seed scripts in the correct order:
 * 1. seed.sql (via supabase db reset)
 * 2. seed-demo-users.ts (creates 9 demo users)
 * 3. seed-demo-classes.ts (creates class schedules)
 *
 * Usage: npx tsx scripts/seed-all-demo.ts
 */

import { spawn } from 'child_process';

const SCRIPTS = [
  { name: 'Demo Users', cmd: 'tsx', args: ['scripts/seed-demo-users.ts'] },
  { name: 'Demo Classes', cmd: 'tsx', args: ['scripts/seed-demo-classes.ts'] },
];

async function runCommand(name: string, cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🚀 Running: ${name}`);
    console.log(`${'─'.repeat(60)}\n`);

    const child = spawn(cmd, args, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`\n✅ ${name} completed`);
        resolve();
      } else {
        reject(new Error(`${name} failed with code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`Failed to start ${name}: ${err.message}`));
    });
  });
}

async function main() {
  console.log('🥋 BlackBelt — Master Seed Script');
  console.log('═'.repeat(60));
  console.log('\n⚠️  Prerequisites:');
  console.log('   1. Supabase must be running (npm run supabase:start)');
  console.log('   2. Migrations must be applied');
  console.log('   3. .env.local must be configured');
  console.log('\n' + '═'.repeat(60));

  // Check if seed.sql has been applied
  console.log('\n📋 Note: Make sure you have run:');
  console.log('   npx supabase db reset');
  console.log('   (This applies migrations and seed.sql)\n');

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const answer = await new Promise<string>((resolve) => {
    rl.question('Have you run "npx supabase db reset"? (y/N): ', resolve);
  });

  rl.close();

  if (answer.toLowerCase() !== 'y') {
    console.log('\n❌ Please run "npx supabase db reset" first, then try again.');
    process.exit(1);
  }

  // Run all scripts
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 Starting seed process...\n');

  for (const script of SCRIPTS) {
    try {
      await runCommand(script.name, script.cmd, script.args);
    } catch (err) {
      console.error(`\n❌ ${script.name} failed:`);
      console.error(err);
      process.exit(1);
    }
  }

  // Final summary
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 ALL SEEDS COMPLETED!\n');
  console.log('Demo environment ready with:');
  console.log('  • 1 Academy (BlackBelt Demo)');
  console.log('  • 9 User profiles (all demo accounts)');
  console.log('  • 2 Families linked');
  console.log('  • 15+ Class schedules');
  console.log('  • Belt systems, achievements, products, videos');
  console.log('\nLogin credentials:');
  console.log('  Email: admin@blackbelt.com (or professor, adulto, etc.)');
  console.log('  Password: blackbelt123');
  console.log('\n' + '═'.repeat(60));
}

main().catch((err) => {
  console.error('\nFatal error:', err);
  process.exit(1);
});
