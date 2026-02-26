/**
 * BlackBelt — Full Seed Script
 *
 * Seeds the database with comprehensive test data after create-test-user.ts.
 * Requires: academy + users already created.
 *
 * Usage: npx tsx scripts/seed-full.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || SUPABASE_URL.includes('your-')) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not configured');
  process.exit(1);
}
if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('your-')) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not configured');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ACADEMY_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('🥋 BlackBelt — Full Seed\n');

  // 1. Get existing memberships
  const { data: memberships } = await supabase
    .from('memberships')
    .select('id, profile_id, role')
    .eq('academy_id', ACADEMY_ID);

  if (!memberships || memberships.length === 0) {
    console.error('❌ No memberships found. Run create-test-user.ts first.');
    process.exit(1);
  }

  const owner = memberships.find((m: any) => m.role === 'owner');
  const professor = memberships.find((m: any) => m.role === 'professor');
  const student = memberships.find((m: any) => m.role === 'student');

  if (!owner || !professor || !student) {
    console.error('❌ Missing required roles. Need owner, professor, student.');
    process.exit(1);
  }

  console.log(`  Owner:     ${owner.id}`);
  console.log(`  Professor: ${professor.id}`);
  console.log(`  Student:   ${student.id}\n`);

  // 2. Create class schedules
  console.log('📅 Creating class schedules...');
  const schedules = [
    { name: 'BJJ Fundamentos', martial_art: 'bjj', level: 'beginner', day_of_week: 1, start_time: '07:00', end_time: '08:30' },
    { name: 'BJJ Avançado', martial_art: 'bjj', level: 'advanced', day_of_week: 1, start_time: '19:00', end_time: '20:30' },
    { name: 'BJJ Todos os Níveis', martial_art: 'bjj', level: 'all_levels', day_of_week: 3, start_time: '07:00', end_time: '08:30' },
    { name: 'Judô Adulto', martial_art: 'judo', level: 'all_levels', day_of_week: 2, start_time: '18:00', end_time: '19:30' },
    { name: 'Muay Thai', martial_art: 'muay_thai', level: 'all_levels', day_of_week: 4, start_time: '19:00', end_time: '20:30' },
    { name: 'BJJ Kids', martial_art: 'bjj', level: 'kids', day_of_week: 6, start_time: '10:00', end_time: '11:00' },
  ];

  const createdSchedules: any[] = [];
  for (const s of schedules) {
    const { data, error } = await supabase
      .from('class_schedules')
      .upsert({
        academy_id: ACADEMY_ID,
        instructor_id: professor.id,
        max_capacity: 30,
        active: true,
        ...s,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ ${s.name}: ${error.message}`);
    } else {
      createdSchedules.push(data);
      console.log(`  ✅ ${s.name} (${data.id})`);
    }
  }

  // 3. Create class sessions for past 7 days + today
  console.log('\n📋 Creating class sessions...');
  const today = new Date();
  const createdSessions: any[] = [];

  for (let dayOffset = -7; dayOffset <= 0; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    const matchingSchedules = createdSchedules.filter((s: any) => s.day_of_week === dayOfWeek);
    for (const schedule of matchingSchedules) {
      const { data, error } = await supabase
        .from('class_sessions')
        .upsert({
          schedule_id: schedule.id,
          academy_id: ACADEMY_ID,
          date: dateStr,
          status: dayOffset < 0 ? 'completed' : 'scheduled',
          instructor_id: professor.id,
        }, { onConflict: 'schedule_id,date' })
        .select()
        .single();

      if (error) {
        if (!error.message.includes('duplicate')) {
          console.error(`  ❌ Session ${dateStr}: ${error.message}`);
        }
      } else {
        createdSessions.push(data);
        console.log(`  ✅ ${schedule.name} - ${dateStr}`);
      }
    }
  }

  // 4. Create attendance records for completed sessions
  console.log('\n✋ Creating attendance records...');
  const completedSessions = createdSessions.filter((s: any) => s.status === 'completed');
  let attendanceCount = 0;

  for (const session of completedSessions) {
    // Student attends ~70% of classes
    if (Math.random() < 0.7) {
      const { error } = await supabase
        .from('attendances')
        .upsert({
          session_id: session.id,
          membership_id: student.id,
          academy_id: ACADEMY_ID,
          checkin_method: Math.random() > 0.5 ? 'qr' : 'manual',
        }, { onConflict: 'session_id,membership_id' });

      if (!error) attendanceCount++;
    }
  }
  console.log(`  ✅ ${attendanceCount} attendance records created`);

  // 5. Create plans
  console.log('\n💳 Creating plans...');
  const plans = [
    { name: 'Básico', description: 'Acesso a 1 modalidade, 3x/semana', price_cents: 12900, interval_months: 1 },
    { name: 'Intermediário', description: 'Acesso a 2 modalidades, ilimitado', price_cents: 19900, interval_months: 1 },
    { name: 'Premium', description: 'Acesso total + personal', price_cents: 29900, interval_months: 1 },
    { name: 'Anual Básico', description: 'Plano básico com desconto anual', price_cents: 129900, interval_months: 12 },
    { name: 'Kids', description: 'Plano infantil (até 12 anos)', price_cents: 9900, interval_months: 1 },
  ];

  const createdPlans: any[] = [];
  for (const p of plans) {
    const { data, error } = await supabase
      .from('plans')
      .insert({
        academy_id: ACADEMY_ID,
        active: true,
        features: ['checkin', 'progression'],
        ...p,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ ${p.name}: ${error.message}`);
    } else {
      createdPlans.push(data);
      console.log(`  ✅ ${p.name} - R$${(p.price_cents / 100).toFixed(2)}`);
    }
  }

  // 6. Create subscription for student
  if (createdPlans.length > 0) {
    console.log('\n📄 Creating subscription...');
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: sub, error } = await supabase
      .from('subscriptions')
      .insert({
        membership_id: student.id,
        plan_id: createdPlans[0].id,
        academy_id: ACADEMY_ID,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Subscription: ${error.message}`);
    } else {
      console.log(`  ✅ Subscription ${sub.id}`);

      // Create invoice
      const { error: invErr } = await supabase
        .from('invoices')
        .insert({
          subscription_id: sub.id,
          academy_id: ACADEMY_ID,
          amount_cents: createdPlans[0].price_cents,
          status: 'paid',
          due_date: now.toISOString().split('T')[0],
          paid_at: now.toISOString(),
        });

      if (!invErr) console.log('  ✅ Invoice created (paid)');
    }
  }

  // 7. Create streak for student
  console.log('\n🔥 Creating streak...');
  const { error: streakErr } = await supabase
    .from('streaks')
    .upsert({
      membership_id: student.id,
      academy_id: ACADEMY_ID,
      current_streak: attendanceCount,
      longest_streak: attendanceCount,
      last_activity_date: today.toISOString().split('T')[0],
    }, { onConflict: 'membership_id,academy_id' });

  if (!streakErr) console.log(`  ✅ Streak: ${attendanceCount} days`);

  // 8. Award some points
  console.log('\n⭐ Creating points...');
  const { error: pointsErr } = await supabase
    .from('points_ledger')
    .insert({
      membership_id: student.id,
      academy_id: ACADEMY_ID,
      points: attendanceCount * 10,
      reason: 'Check-ins realizados (seed)',
      reference_type: 'seed',
    });

  if (!pointsErr) console.log(`  ✅ ${attendanceCount * 10} points awarded`);

  // 9. Unlock first achievement
  console.log('\n🏅 Unlocking achievements...');
  const { data: firstCheckinAchv } = await supabase
    .from('achievements')
    .select('id')
    .eq('key', 'first_checkin')
    .single();

  if (firstCheckinAchv && attendanceCount > 0) {
    const { error } = await supabase
      .from('member_achievements')
      .upsert({
        membership_id: student.id,
        achievement_id: firstCheckinAchv.id,
      }, { onConflict: 'membership_id,achievement_id' });

    if (!error) console.log('  ✅ "Primeiro Passo" unlocked');
  }

  if (attendanceCount >= 10) {
    const { data: checkin10 } = await supabase
      .from('achievements')
      .select('id')
      .eq('key', 'checkin_10')
      .single();

    if (checkin10) {
      const { error } = await supabase
        .from('member_achievements')
        .upsert({
          membership_id: student.id,
          achievement_id: checkin10.id,
        }, { onConflict: 'membership_id,achievement_id' });

      if (!error) console.log('  ✅ "Dedicado" unlocked');
    }
  }

  // 10. Create a notification
  console.log('\n🔔 Creating notifications...');
  await supabase.from('notifications').insert({
    profile_id: student.profile_id,
    academy_id: ACADEMY_ID,
    title: 'Bem-vindo ao BlackBelt!',
    body: 'Sua conta foi criada com sucesso. Comece fazendo check-in na sua próxima aula!',
    type: 'welcome',
    read: false,
  });
  console.log('  ✅ Welcome notification created');

  // 11. Create skill track
  console.log('\n📊 Creating skill track...');
  const { data: skillTrack } = await supabase
    .from('skill_tracks')
    .insert({
      academy_id: ACADEMY_ID,
      martial_art: 'bjj',
      name: 'BJJ Fundamentals',
      description: 'Habilidades fundamentais do Jiu-Jitsu',
      skills: [
        { key: 'guard_pass', name: 'Passagem de Guarda', category: 'top' },
        { key: 'sweep', name: 'Raspagem', category: 'bottom' },
        { key: 'submission', name: 'Finalização', category: 'attack' },
        { key: 'escape', name: 'Fuga', category: 'defense' },
        { key: 'takedown', name: 'Queda', category: 'standing' },
      ],
    })
    .select()
    .single();

  if (skillTrack) {
    console.log(`  ✅ Skill track: ${skillTrack.name}`);

    // Create assessment for student
    await supabase.from('skill_assessments').insert({
      membership_id: student.id,
      skill_track_id: skillTrack.id,
      skill_key: 'guard_pass',
      score: 65,
      assessed_by: professor.id,
      notes: 'Boa base, precisa melhorar transições',
    });
    console.log('  ✅ Skill assessment created');
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('🎉 Full seed complete!\n');
  console.log(`  Schedules:   ${createdSchedules.length}`);
  console.log(`  Sessions:    ${createdSessions.length}`);
  console.log(`  Attendances: ${attendanceCount}`);
  console.log(`  Plans:       ${createdPlans.length}`);
  console.log('  Subscription: 1');
  console.log('  Skill Track:  1');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
