/**
 * BlackBelt — Create test users in Supabase
 *
 * Creates 3 test users with profiles and memberships:
 *   admin@blackbelt.test    → owner
 *   professor@blackbelt.test → professor
 *   aluno@blackbelt.test    → student (Branca)
 *
 * Usage: npx tsx scripts/create-test-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || SUPABASE_URL.includes('your-')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured in .env.local');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your-')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured in .env.local');
  process.exit(1);
}

// Admin client (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACADEMY_ID = '00000000-0000-0000-0000-000000000001';

interface TestUser {
  email: string;
  password: string;
  fullName: string;
  role: 'owner' | 'admin' | 'professor' | 'student';
  beltRank?: string;
}

const TEST_USERS: TestUser[] = [
  {
    email: 'admin@blackbelt.test',
    password: 'Test@12345',
    fullName: 'Admin Teste',
    role: 'owner',
  },
  {
    email: 'professor@blackbelt.test',
    password: 'Test@12345',
    fullName: 'Professor Teste',
    role: 'professor',
  },
  {
    email: 'aluno@blackbelt.test',
    password: 'Test@12345',
    fullName: 'Aluno Teste',
    role: 'student',
    beltRank: 'Branca',
  },
];

async function main() {
  console.log('🥋 BlackBelt — Creating test users...\n');
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log(`   Academy:  ${ACADEMY_ID}\n`);

  // Step 1: Ensure academy exists
  console.log('1️⃣  Checking academy...');
  const { data: existingAcademy } = await supabase
    .from('academies')
    .select('id')
    .eq('id', ACADEMY_ID)
    .single();

  let academyNeedsOwnerUpdate = false;

  if (!existingAcademy) {
    // We need to create a user first to use as owner_id (FK to auth.users)
    // We'll create the admin user first, then the academy
    console.log('   Academy not found, will create after admin user.\n');
    academyNeedsOwnerUpdate = true;
  } else {
    console.log('   ✅ Academy exists.\n');
  }

  // Step 2: Create users
  const createdUsers: { email: string; id: string; role: string }[] = [];

  for (const user of TEST_USERS) {
    console.log(`2️⃣  Creating user: ${user.email} (${user.role})`);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === user.email);

    let userId: string;

    if (existing) {
      console.log(`   ⏭️  User already exists: ${existing.id}`);
      userId = existing.id;
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Auto-confirm email
      });

      if (authError) {
        console.error(`   ❌ Auth error: ${authError.message}`);
        continue;
      }

      userId = authData.user.id;
      console.log(`   ✅ Auth user created: ${userId}`);
    }

    // Step 3: Create/update profile
    console.log(`   Creating profile...`);
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: user.fullName,
        display_name: user.fullName.split(' ')[0],
      }, { onConflict: 'id' });

    if (profileError) {
      console.error(`   ❌ Profile error: ${profileError.message}`);
    } else {
      console.log(`   ✅ Profile OK`);
    }

    createdUsers.push({ email: user.email, id: userId, role: user.role });

    // If this is the admin/owner and academy doesn't exist, create it now
    if (user.role === 'owner' && academyNeedsOwnerUpdate) {
      console.log(`   Creating academy with owner ${userId}...`);
      const { error: academyError } = await supabase
        .from('academies')
        .upsert({
          id: ACADEMY_ID,
          name: 'Academia BlackBelt Demo',
          slug: 'blackbelt-demo',
          owner_id: userId,
          settings: { plan: 'pro', features: ['checkin', 'gamification', 'financial', 'progression'] },
          status: 'active',
        }, { onConflict: 'id' });

      if (academyError) {
        console.error(`   ❌ Academy error: ${academyError.message}`);
      } else {
        console.log(`   ✅ Academy created`);
        academyNeedsOwnerUpdate = false;
      }
    }
  }

  // Step 4: Update academy owner_id if it existed with placeholder
  if (!academyNeedsOwnerUpdate && existingAcademy) {
    const adminUser = createdUsers.find((u) => u.role === 'owner');
    if (adminUser) {
      const { error } = await supabase
        .from('academies')
        .update({ owner_id: adminUser.id })
        .eq('id', ACADEMY_ID);
      if (error) {
        console.error(`   ❌ Academy owner update error: ${error.message}`);
      } else {
        console.log(`   ✅ Academy owner updated to ${adminUser.id}`);
      }
    }
  }

  // Step 5: Create memberships
  console.log('\n3️⃣  Creating memberships...');
  for (const user of createdUsers) {
    const testUser = TEST_USERS.find((t) => t.email === user.email)!;

    const membershipData: Record<string, unknown> = {
      profile_id: user.id,
      academy_id: ACADEMY_ID,
      role: user.role,
      status: 'active',
    };

    if (testUser.beltRank) {
      membershipData.belt_rank = testUser.beltRank;
    }

    // Check existing
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('profile_id', user.id)
      .eq('academy_id', ACADEMY_ID)
      .eq('role', user.role)
      .single();

    if (existingMembership) {
      console.log(`   ⏭️  Membership exists: ${user.email} → ${user.role}`);
      continue;
    }

    const { error: memberError } = await supabase
      .from('memberships')
      .insert(membershipData);

    if (memberError) {
      console.error(`   ❌ Membership error (${user.email}): ${memberError.message}`);
    } else {
      console.log(`   ✅ ${user.email} → ${user.role}`);
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Test users ready!\n');
  console.log('┌─────────────────────────────┬───────────┬──────────────┐');
  console.log('│ Email                       │ Role      │ Password     │');
  console.log('├─────────────────────────────┼───────────┼──────────────┤');
  for (const user of TEST_USERS) {
    const email = user.email.padEnd(27);
    const role = user.role.padEnd(9);
    console.log(`│ ${email} │ ${role} │ ${user.password}  │`);
  }
  console.log('└─────────────────────────────┴───────────┴──────────────┘');
  console.log(`\nAcademy: Academia BlackBelt Demo (${ACADEMY_ID})`);
  console.log('Slug:    blackbelt-demo');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
