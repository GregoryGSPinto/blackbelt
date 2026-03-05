/**
 * BlackBelt — Complete Seed Runner
 *
 * Executes all seed scripts in dependency order.
 * Idempotent: each script checks before inserting.
 *
 * Usage: npx tsx scripts/seed-all.ts
 */
import { seedAcademy } from './seed-academy';
import { seedUsers } from './seed-users';
import { seedClasses } from './seed-classes';
import { seedAttendance } from './seed-attendance';
import { seedProgression } from './seed-progression';
import { seedFinancial } from './seed-financial';
import { seedNotifications } from './seed-notifications';
import { seedAchievements } from './seed-achievements';

async function main() {
  console.log('='.repeat(50));
  console.log('  BlackBelt — Complete Seed');
  console.log('='.repeat(50));

  const steps = [
    { name: 'Academy', fn: seedAcademy },
    { name: 'Users', fn: seedUsers },
    { name: 'Classes', fn: seedClasses },
    { name: 'Attendance', fn: seedAttendance },
    { name: 'Progression', fn: seedProgression },
    { name: 'Financial', fn: seedFinancial },
    { name: 'Notifications', fn: seedNotifications },
    { name: 'Achievements', fn: seedAchievements },
  ];

  for (const step of steps) {
    try {
      await step.fn();
    } catch (err) {
      console.error(`\n  FAILED: ${step.name}`);
      console.error(err);
      process.exit(1);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('  Seed complete!');
  console.log('='.repeat(50));
  console.log('\n  Login credentials:');
  console.log('  admin@blackbelt.app     / BlackBelt@2026!  (owner)');
  console.log('  professor@blackbelt.app / BlackBelt@2026!  (professor)');
  console.log('  adulto@blackbelt.app    / BlackBelt@2026!  (student - Azul)');
  console.log('  teen@blackbelt.app      / BlackBelt@2026!  (student - Amarela)');
  console.log('  kids@blackbelt.app      / BlackBelt@2026!  (student - Branca)');
  console.log('  parent@blackbelt.app    / BlackBelt@2026!  (parent)');
  console.log('');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
