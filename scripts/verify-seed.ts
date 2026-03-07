import { getAdminClient } from './seed-helpers';

async function main() {
  const supabase = getAdminClient();

  const tables = [
    'profiles',
    'academies',
    'memberships',
    'class_schedules',
    'class_sessions',
    'attendances',
    'plans',
    'subscriptions',
    'invoices',
    'payments',
    'notifications',
    'achievements',
    'member_achievements',
    'promotions',
    'milestones',
    'streaks',
    'skill_assessments',
    'parent_child_links',
  ];

  console.log('='.repeat(50));
  console.log('  BlackBelt — Seed Verification');
  console.log('='.repeat(50));

  let allGood = true;

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  FAIL  ${table.padEnd(22)} error: ${error.message}`);
      allGood = false;
    } else if (count === 0) {
      console.log(`  WARN  ${table.padEnd(22)} 0 rows`);
      allGood = false;
    } else {
      console.log(`  OK    ${table.padEnd(22)} ${count} rows`);
    }
  }

  // Verify auth users
  const { data: authData } = await supabase.auth.admin.listUsers();
  const authCount = authData?.users?.length ?? 0;
  console.log(`  OK    ${'auth.users'.padEnd(22)} ${authCount} users`);

  console.log('\n' + '='.repeat(50));
  console.log(allGood ? '  All checks passed!' : '  Some checks failed!');
  console.log('='.repeat(50));

  process.exit(allGood ? 0 : 1);
}

main().catch(console.error);
