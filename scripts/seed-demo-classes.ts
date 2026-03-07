#!/usr/bin/env tsx
/**
 * BlackBelt — Seed Demo Classes
 *
 * Creates class schedules and sessions for the demo academy:
 * - BJJ Fundamentals (Mon/Wed/Fri)
 * - BJJ Advanced (Tue/Thu)
 * - Muay Thai (Mon/Wed)
 * - Kids BJJ (Tue/Thu/Sat)
 * - Teen BJJ (Mon/Wed/Fri)
 *
 * Usage: npx tsx scripts/seed-demo-classes.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('placeholder')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACADEMY_ID = '00000000-0000-0000-0000-000000000001';

interface ClassSchedule {
  id: string;
  name: string;
  martialArt: string;
  level: string;
  instructorEmail: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  location: string;
}

// Schedule definitions
const SCHEDULES: ClassSchedule[] = [
  // BJJ Fundamentals - Morning
  {
    id: 'sch-bjj-fund-morning',
    name: 'BJJ Fundamentos - Manhã',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 1, // Monday
    startTime: '07:00',
    endTime: '08:30',
    maxCapacity: 20,
    location: 'Mat Principal',
  },
  {
    id: 'sch-bjj-fund-morning-wed',
    name: 'BJJ Fundamentos - Manhã',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 3, // Wednesday
    startTime: '07:00',
    endTime: '08:30',
    maxCapacity: 20,
    location: 'Mat Principal',
  },
  {
    id: 'sch-bjj-fund-morning-fri',
    name: 'BJJ Fundamentos - Manhã',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 5, // Friday
    startTime: '07:00',
    endTime: '08:30',
    maxCapacity: 20,
    location: 'Mat Principal',
  },

  // BJJ Fundamentals - Evening
  {
    id: 'sch-bjj-fund-evening',
    name: 'BJJ Fundamentos - Noite',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 1,
    startTime: '19:00',
    endTime: '20:30',
    maxCapacity: 25,
    location: 'Mat Principal',
  },
  {
    id: 'sch-bjj-fund-evening-wed',
    name: 'BJJ Fundamentos - Noite',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 3,
    startTime: '19:00',
    endTime: '20:30',
    maxCapacity: 25,
    location: 'Mat Principal',
  },
  {
    id: 'sch-bjj-fund-evening-fri',
    name: 'BJJ Fundamentos - Noite',
    martialArt: 'bjj',
    level: 'beginner',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 5,
    startTime: '19:00',
    endTime: '20:30',
    maxCapacity: 25,
    location: 'Mat Principal',
  },

  // BJJ Advanced
  {
    id: 'sch-bjj-adv-tue',
    name: 'BJJ Avançado',
    martialArt: 'bjj',
    level: 'advanced',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 2, // Tuesday
    startTime: '19:00',
    endTime: '20:30',
    maxCapacity: 20,
    location: 'Mat Principal',
  },
  {
    id: 'sch-bjj-adv-thu',
    name: 'BJJ Avançado',
    martialArt: 'bjj',
    level: 'advanced',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 4, // Thursday
    startTime: '19:00',
    endTime: '20:30',
    maxCapacity: 20,
    location: 'Mat Principal',
  },

  // Muay Thai
  {
    id: 'sch-muay-mon',
    name: 'Muay Thai',
    martialArt: 'muay_thai',
    level: 'all_levels',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 1,
    startTime: '18:00',
    endTime: '19:30',
    maxCapacity: 20,
    location: 'Ringue',
  },
  {
    id: 'sch-muay-wed',
    name: 'Muay Thai',
    martialArt: 'muay_thai',
    level: 'all_levels',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 3,
    startTime: '18:00',
    endTime: '19:30',
    maxCapacity: 20,
    location: 'Ringue',
  },

  // Kids BJJ (ages 4-11)
  {
    id: 'sch-kids-tue',
    name: 'BJJ Kids (4-11 anos)',
    martialArt: 'bjj',
    level: 'kids',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 2,
    startTime: '16:00',
    endTime: '17:00',
    maxCapacity: 15,
    location: 'Mat Kids',
  },
  {
    id: 'sch-kids-thu',
    name: 'BJJ Kids (4-11 anos)',
    martialArt: 'bjj',
    level: 'kids',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 4,
    startTime: '16:00',
    endTime: '17:00',
    maxCapacity: 15,
    location: 'Mat Kids',
  },
  {
    id: 'sch-kids-sat',
    name: 'BJJ Kids (4-11 anos)',
    martialArt: 'bjj',
    level: 'kids',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 6, // Saturday
    startTime: '10:00',
    endTime: '11:00',
    maxCapacity: 15,
    location: 'Mat Kids',
  },

  // Teen BJJ (ages 12-17)
  {
    id: 'sch-teen-mon',
    name: 'BJJ Teen (12-17 anos)',
    martialArt: 'bjj',
    level: 'teens',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 1,
    startTime: '16:00',
    endTime: '17:30',
    maxCapacity: 18,
    location: 'Mat Principal',
  },
  {
    id: 'sch-teen-wed',
    name: 'BJJ Teen (12-17 anos)',
    martialArt: 'bjj',
    level: 'teens',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 3,
    startTime: '16:00',
    endTime: '17:30',
    maxCapacity: 18,
    location: 'Mat Principal',
  },
  {
    id: 'sch-teen-fri',
    name: 'BJJ Teen (12-17 anos)',
    martialArt: 'bjj',
    level: 'teens',
    instructorEmail: 'professor@blackbelt.com',
    dayOfWeek: 5,
    startTime: '16:00',
    endTime: '17:30',
    maxCapacity: 18,
    location: 'Mat Principal',
  },
];

async function main() {
  console.log('🥋 BlackBelt — Seeding Demo Classes\n');

  // Get instructor membership
  console.log('1️⃣  Finding instructor...');
  const { data: professorUsers } = await supabase.auth.admin.listUsers();
  const professorUser = professorUsers?.users?.find(
    (u) => u.email === 'professor@blackbelt.com'
  );

  if (!professorUser) {
    console.error('   ❌ Professor user not found. Run seed-demo-users.ts first.');
    process.exit(1);
  }

  // Get professor's membership
  const { data: professorMembership } = await supabase
    .from('memberships')
    .select('id')
    .eq('profile_id', professorUser.id)
    .eq('role', 'professor')
    .single();

  if (!professorMembership) {
    console.error('   ❌ Professor membership not found.');
    process.exit(1);
  }

  const instructorId = professorMembership.id;
  console.log(`   ✅ Instructor ID: ${instructorId}\n`);

  // Create schedules
  console.log('2️⃣  Creating class schedules...\n');
  let created = 0;
  let skipped = 0;

  for (const schedule of SCHEDULES) {
    const { data: existing } = await supabase
      .from('class_schedules')
      .select('id')
      .eq('id', schedule.id)
      .single();

    if (existing) {
      console.log(`   ⏭️  ${schedule.name} (${getDayName(schedule.dayOfWeek)}) - exists`);
      skipped++;
      continue;
    }

    const { error } = await supabase.from('class_schedules').insert({
      id: schedule.id,
      academy_id: ACADEMY_ID,
      name: schedule.name,
      martial_art: schedule.martialArt,
      level: schedule.level,
      instructor_id: instructorId,
      day_of_week: schedule.dayOfWeek,
      start_time: schedule.startTime,
      end_time: schedule.endTime,
      max_capacity: schedule.maxCapacity,
      location: schedule.location,
      active: true,
    });

    if (error) {
      console.error(`   ❌ ${schedule.name}: ${error.message}`);
    } else {
      console.log(`   ✅ ${schedule.name} (${getDayName(schedule.dayOfWeek)}) ${schedule.startTime}-${schedule.endTime}`);
      created++;
    }
  }

  console.log(`\n   📊 Created: ${created}, Skipped: ${skipped}`);

  // Create sessions for the next 7 days
  console.log('\n3️⃣  Creating class sessions for next 7 days...\n');
  let sessionsCreated = 0;

  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();

    const daySchedules = SCHEDULES.filter((s) => s.dayOfWeek === dayOfWeek);

    for (const schedule of daySchedules) {
      const dateStr = date.toISOString().split('T')[0];

      // Check if session exists
      const { data: existing } = await supabase
        .from('class_sessions')
        .select('id')
        .eq('schedule_id', schedule.id)
        .eq('date', dateStr)
        .single();

      if (existing) {
        continue;
      }

      const { error } = await supabase.from('class_sessions').insert({
        schedule_id: schedule.id,
        academy_id: ACADEMY_ID,
        date: dateStr,
        status: 'scheduled',
        instructor_id: instructorId,
      });

      if (!error) {
        sessionsCreated++;
      }
    }
  }

  console.log(`   ✅ Created ${sessionsCreated} sessions\n`);

  // Summary
  console.log('═'.repeat(60));
  console.log('🎉 Demo Classes Ready!\n');
  console.log('Horários criados:');
  console.log('  • BJJ Fundamentos: Seg/Qua/Sex (Manhã e Noite)');
  console.log('  • BJJ Avançado: Ter/Qui (Noite)');
  console.log('  • Muay Thai: Seg/Qua');
  console.log('  • BJJ Kids (4-11): Ter/Qui/Sáb');
  console.log('  • BJJ Teen (12-17): Seg/Qua/Sex');
  console.log('\n' + '═'.repeat(60));
}

function getDayName(day: number): string {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return days[day];
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
