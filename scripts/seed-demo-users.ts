#!/usr/bin/env tsx
/**
 * BlackBelt — Seed Demo Users
 *
 * Creates all 9 demo users with complete profiles, memberships and family links:
 *
 * ┌─────────────────────────────────┬──────────────────────────────┬────────────────┐
 * │ Perfil                          │ Email                        │ Senha          │
 * ├─────────────────────────────────┼──────────────────────────────┼────────────────┤
 * │ Administrador                   │ admin@blackbelt.com          │ blackbelt123   │
 * │ Professor                       │ professor@blackbelt.com      │ blackbelt123   │
 * │ Aluno Adulto                    │ adulto@blackbelt.com         │ blackbelt123   │
 * │ Aluno Teen — Miguel Oliveira    │ miguel@blackbelt.com         │ blackbelt123   │
 * │ Aluno Teen — Beatriz Oliveira   │ beatriz@blackbelt.com        │ blackbelt123   │
 * │ Aluno Kids — Pedro Ferreira     │ kid@blackbelt.com            │ blackbelt123   │
 * │ Aluno Kids — Sofia Ferreira     │ sofia@blackbelt.com          │ blackbelt123   │
 * │ Pai/Responsável (Teen)          │ paiteen@blackbelt.com        │ blackbelt123   │
 * │ Pai/Responsável (Kids)          │ paikids@blackbelt.com        │ blackbelt123   │
 * │ Super Admin                     │ superadmin@blackbelt.com     │ blackbelt123   │
 * └─────────────────────────────────┴──────────────────────────────┴────────────────┘
 *
 * Famílias:
 * - Família Oliveira: Roberto (pai) + Miguel (15) + Beatriz (14)
 * - Família Ferreira: Ana (mãe) + Pedro (8) + Sofia (6)
 *
 * Usage: npx tsx scripts/seed-demo-users.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || SUPABASE_URL.includes('your-') || SUPABASE_URL.includes('placeholder')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured in .env.local');
  console.error('   Please set your Supabase URL and Service Role Key');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your-') || SERVICE_ROLE_KEY.includes('placeholder')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured in .env.local');
  process.exit(1);
}

// Admin client (bypasses RLS)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACADEMY_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_PASSWORD = 'blackbelt123';

interface DemoUser {
  email: string;
  fullName: string;
  displayName: string;
  role: 'owner' | 'admin' | 'professor' | 'student' | 'parent';
  beltRank?: string;
  birthDate?: string;
  phone?: string;
  avatar?: string;
  familyId?: string;
  parentEmail?: string; // For linking children to parents
}

// Family identifiers
const FAMILY_OLIVEIRA = 'fam_oliveira_001';
const FAMILY_FERREIRA = 'fam_ferreira_001';

const DEMO_USERS: DemoUser[] = [
  // ============================================================
  // STAFF - Admin e Professor
  // ============================================================
  {
    email: 'superadmin@blackbelt.com',
    fullName: 'Super Admin BlackBelt',
    displayName: 'Super Admin',
    role: 'owner',
    avatar: '👨‍💼',
    phone: '+55 11 99999-0001',
  },
  {
    email: 'admin@blackbelt.com',
    fullName: 'Carlos Administrador',
    displayName: 'Admin',
    role: 'admin',
    beltRank: 'Preta',
    birthDate: '1985-03-15',
    avatar: '👔',
    phone: '+55 11 99999-0002',
  },
  {
    email: 'professor@blackbelt.com',
    fullName: 'Prof. Ricardo Mendes',
    displayName: 'Prof. Ricardo',
    role: 'professor',
    beltRank: 'Preta 2º grau',
    birthDate: '1980-07-20',
    avatar: '🥋',
    phone: '+55 11 99999-0003',
  },

  // ============================================================
  // ALUNO ADULTO (sem família)
  // ============================================================
  {
    email: 'adulto@blackbelt.com',
    fullName: 'Carlos Silva',
    displayName: 'Carlos',
    role: 'student',
    beltRank: 'Azul',
    birthDate: '1998-06-12',
    avatar: '🥋',
    phone: '+55 11 99999-0010',
  },

  // ============================================================
  // FAMÍLIA OLIVEIRA - Pai + 2 Adolescentes
  // ============================================================
  {
    email: 'paiteen@blackbelt.com',
    fullName: 'Roberto Oliveira',
    displayName: 'Roberto',
    role: 'parent',
    birthDate: '1984-09-22',
    avatar: '👨',
    phone: '+55 11 99999-0020',
    familyId: FAMILY_OLIVEIRA,
  },
  {
    email: 'miguel@blackbelt.com',
    fullName: 'Miguel Oliveira',
    displayName: 'Miguel',
    role: 'student',
    beltRank: 'Cinza',
    birthDate: '2011-04-10',
    avatar: '🤸',
    phone: '+55 11 99999-0021',
    familyId: FAMILY_OLIVEIRA,
    parentEmail: 'paiteen@blackbelt.com',
  },
  {
    email: 'beatriz@blackbelt.com',
    fullName: 'Beatriz Oliveira',
    displayName: 'Beatriz',
    role: 'student',
    beltRank: 'Cinza-Amarela',
    birthDate: '2012-08-05',
    avatar: '💪',
    phone: '+55 11 99999-0022',
    familyId: FAMILY_OLIVEIRA,
    parentEmail: 'paiteen@blackbelt.com',
  },

  // ============================================================
  // FAMÍLIA FERREIRA - Mãe + 2 Crianças
  // ============================================================
  {
    email: 'paikids@blackbelt.com',
    fullName: 'Ana Ferreira',
    displayName: 'Ana',
    role: 'parent',
    birthDate: '1991-11-30',
    avatar: '👩',
    phone: '+55 11 99999-0030',
    familyId: FAMILY_FERREIRA,
  },
  {
    email: 'kid@blackbelt.com',
    fullName: 'Pedro Ferreira',
    displayName: 'Pedro',
    role: 'student',
    beltRank: 'Branca',
    birthDate: '2018-02-14',
    avatar: '👦',
    phone: '+55 11 99999-0031',
    familyId: FAMILY_FERREIRA,
    parentEmail: 'paikids@blackbelt.com',
  },
  {
    email: 'sofia@blackbelt.com',
    fullName: 'Sofia Ferreira',
    displayName: 'Sofia',
    role: 'student',
    beltRank: 'Branca',
    birthDate: '2020-06-01',
    avatar: '👧',
    phone: '+55 11 99999-0032',
    familyId: FAMILY_FERREIRA,
    parentEmail: 'paikids@blackbelt.com',
  },
];

// Store created user IDs for family linking
const createdUsers = new Map<string, { id: string; email: string; role: string }>();

async function main() {
  console.log('🥋 BlackBelt — Seeding Demo Users\n');
  console.log(`   Supabase: ${SUPABASE_URL}`);
  console.log(`   Academy:  ${ACADEMY_ID}`);
  console.log(`   Password: ${DEFAULT_PASSWORD}\n`);

  // Step 1: Ensure academy exists
  console.log('1️⃣  Checking academy...');
  const { data: existingAcademy } = await supabase
    .from('academies')
    .select('id, owner_id')
    .eq('id', ACADEMY_ID)
    .single();

  if (!existingAcademy) {
    console.log('   ⚠️  Academy not found. Please run seed.sql first:');
    console.log('      npx supabase db reset');
    process.exit(1);
  }

  console.log('   ✅ Academy exists\n');

  // Step 2: Create/update users
  console.log('2️⃣  Creating/updating users...\n');

  for (const user of DEMO_USERS) {
    console.log(`   📧 ${user.email} (${user.role})`);

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u) => u.email === user.email);

    let userId: string;

    if (existing) {
      console.log(`      ⏭️  User exists: ${existing.id}`);
      userId = existing.id;

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        userId,
        { password: DEFAULT_PASSWORD }
      );
      if (updateError) {
        console.log(`      ⚠️  Password update failed: ${updateError.message}`);
      } else {
        console.log(`      ✅ Password updated`);
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
      });

      if (authError) {
        console.error(`      ❌ Auth error: ${authError.message}`);
        continue;
      }

      userId = authData.user.id;
      console.log(`      ✅ Created: ${userId}`);
    }

    // Store for later use
    createdUsers.set(user.email, { id: userId, email: user.email, role: user.role });

    // Step 3: Create/update profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        full_name: user.fullName,
        display_name: user.displayName,
        avatar_url: user.avatar,
        phone: user.phone,
        birth_date: user.birthDate,
      }, { onConflict: 'id' });

    if (profileError) {
      console.error(`      ❌ Profile error: ${profileError.message}`);
    } else {
      console.log(`      ✅ Profile OK`);
    }
  }

  // Step 4: Update academy owner to superadmin
  console.log('\n3️⃣  Updating academy owner...');
  const superadmin = createdUsers.get('superadmin@blackbelt.com');
  if (superadmin) {
    const { error } = await supabase
      .from('academies')
      .update({ owner_id: superadmin.id })
      .eq('id', ACADEMY_ID);

    if (error) {
      console.error(`   ❌ Failed: ${error.message}`);
    } else {
      console.log(`   ✅ Owner set to: ${superadmin.email}`);
    }
  }

  // Step 5: Create memberships
  console.log('\n4️⃣  Creating memberships...');

  for (const user of DEMO_USERS) {
    const userData = createdUsers.get(user.email);
    if (!userData) {
      console.log(`   ⚠️  Skipping ${user.email} (user not created)`);
      continue;
    }

    // Check if membership already exists
    const { data: existingMembership } = await supabase
      .from('memberships')
      .select('id')
      .eq('profile_id', userData.id)
      .eq('academy_id', ACADEMY_ID)
      .eq('role', user.role)
      .single();

    if (existingMembership) {
      console.log(`   ⏭️  ${user.email} → ${user.role} (exists)`);
      continue;
    }

    const membershipData: Record<string, unknown> = {
      profile_id: userData.id,
      academy_id: ACADEMY_ID,
      role: user.role,
      status: 'active',
    };

    if (user.beltRank) {
      membershipData.belt_rank = user.beltRank;
    }

    const { error: memberError } = await supabase
      .from('memberships')
      .insert(membershipData);

    if (memberError) {
      console.error(`   ❌ ${user.email}: ${memberError.message}`);
    } else {
      console.log(`   ✅ ${user.email} → ${user.role}`);
    }
  }

  // Step 6: Create parent-child links
  console.log('\n5️⃣  Creating parent-child links...');

  // Link Oliveira kids
  const roberto = createdUsers.get('paiteen@blackbelt.com');
  const miguel = createdUsers.get('miguel@blackbelt.com');
  const beatriz = createdUsers.get('beatriz@blackbelt.com');

  if (roberto && miguel) {
    await createParentChildLink(roberto.id, miguel.id);
  }
  if (roberto && beatriz) {
    await createParentChildLink(roberto.id, beatriz.id);
  }

  // Link Ferreira kids
  const ana = createdUsers.get('paikids@blackbelt.com');
  const pedro = createdUsers.get('kid@blackbelt.com');
  const sofia = createdUsers.get('sofia@blackbelt.com');

  if (ana && pedro) {
    await createParentChildLink(ana.id, pedro.id);
  }
  if (ana && sofia) {
    await createParentChildLink(ana.id, sofia.id);
  }

  // Summary
  printSummary();
}

async function createParentChildLink(parentId: string, childId: string) {
  const { data: existing } = await supabase
    .from('parent_child_links')
    .select('id')
    .eq('parent_id', parentId)
    .eq('child_id', childId)
    .single();

  if (existing) {
    console.log(`   ⏭️  Link exists: ${parentId.substring(0, 8)}... → ${childId.substring(0, 8)}...`);
    return;
  }

  const { error } = await supabase
    .from('parent_child_links')
    .insert({
      parent_id: parentId,
      child_id: childId,
      relationship: 'parent',
    });

  if (error) {
    console.error(`   ❌ Link failed: ${error.message}`);
  } else {
    console.log(`   ✅ Linked: ${parentId.substring(0, 8)}... → ${childId.substring(0, 8)}...`);
  }
}

function printSummary() {
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 Demo Users Ready!\n');
  console.log('┌─────────────────────────────────┬─────────────┬────────────────┐');
  console.log('│ Email                           │ Role        │ Perfil         │');
  console.log('├─────────────────────────────────┼─────────────┼────────────────┤');

  const roleLabels: Record<string, string> = {
    owner: '👨‍💼 Super Admin',
    admin: '👔 Admin',
    professor: '🥋 Professor',
    student: '🎓 Aluno',
    parent: '👨‍👩‍👧 Responsável',
  };

  for (const user of DEMO_USERS) {
    const email = user.email.padEnd(31);
    const role = roleLabels[user.role].padEnd(11);
    const name = user.displayName.padEnd(14);
    console.log(`│ ${email} │ ${role} │ ${name} │`);
  }

  console.log('└─────────────────────────────────┴─────────────┴────────────────┘');
  console.log(`\n🔑 Senha padrão: ${DEFAULT_PASSWORD}`);
  console.log(`\n👨‍👩‍👧 Famílias:`);
  console.log(`   • Oliveira: Roberto (pai) + Miguel (15) + Beatriz (14)`);
  console.log(`   • Ferreira: Ana (mãe) + Pedro (8) + Sofia (6)`);
  console.log(`\n🏫 Academia: Academia BlackBelt Demo`);
  console.log(`   ID: ${ACADEMY_ID}`);
  console.log('\n' + '═'.repeat(60));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
