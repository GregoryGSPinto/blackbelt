/**
 * Seed: 60 days of attendance history
 *
 * - Maria (adulto): ~80% attendance (streak atual: 5)
 * - Miguel (teen): ~70% attendance (streak atual: 3)
 * - Ana (kids): ~90% attendance (streak atual: 8)
 * - Realistic variation (holidays, weeks with more/less)
 *
 * Idempotent: uses upsert on (session_id, membership_id).
 * NOTE: The gamification trigger on attendances auto-creates points/streaks,
 * so we create sessions first, then attendance.
 */
import { getAdminClient, ACADEMY_ID, getSeedUserMap, logSection, log } from './seed-helpers';

// Simple seeded PRNG for deterministic results
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export async function seedAttendance() {
  const supabase = getAdminClient();
  logSection('--- Seed Attendance ---');

  const userMap = await getSeedUserMap(supabase);
  const adulto = userMap.get('adulto@blackbelt.app');
  const teen = userMap.get('teen@blackbelt.app');
  const kids = userMap.get('kids@blackbelt.app');
  const professor = userMap.get('professor@blackbelt.app');

  if (!adulto?.membershipId || !teen?.membershipId || !kids?.membershipId || !professor?.membershipId) {
    console.error('  Missing user memberships. Run seed-users first.');
    return;
  }

  // Get all schedules
  const { data: schedules } = await supabase
    .from('class_schedules')
    .select('id, name, day_of_week, level')
    .eq('academy_id', ACADEMY_ID)
    .eq('active', true);

  if (!schedules || schedules.length === 0) {
    console.error('  No schedules found. Run seed-classes first.');
    return;
  }

  const today = new Date();
  const rand = seededRandom(42);
  let sessionsCreated = 0;
  let attendancesCreated = 0;

  // Brazilian holidays (approximate) to skip
  const holidays = new Set(['2026-01-01', '2026-02-16', '2026-02-17', '2026-04-03', '2026-04-21']);

  for (let dayOffset = -60; dayOffset <= 0; dayOffset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    const dateStr = d.toISOString().split('T')[0];
    const dayOfWeek = d.getDay();

    // Skip holidays
    if (holidays.has(dateStr)) continue;

    // Find schedules for this day of week
    const daySchedules = schedules.filter((s) => s.day_of_week === dayOfWeek);

    for (const schedule of daySchedules) {
      // Create session (upsert)
      const sessionStatus = dayOffset < 0 ? 'completed' : 'scheduled';
      const { data: session, error: sessErr } = await supabase
        .from('class_sessions')
        .upsert({
          schedule_id: schedule.id,
          academy_id: ACADEMY_ID,
          date: dateStr,
          status: sessionStatus,
          instructor_id: professor.membershipId,
        }, { onConflict: 'schedule_id,date' })
        .select('id')
        .single();

      if (sessErr || !session) continue;
      sessionsCreated++;

      // Only create attendance for completed sessions
      if (sessionStatus !== 'completed') continue;

      const scheduleName = schedule.name.toLowerCase();

      // Determine which students attend this class type
      const attendees: { membershipId: string; rate: number }[] = [];

      if (scheduleName.includes('fundamentos') || scheduleName.includes('avançado') || scheduleName.includes('open mat')) {
        attendees.push({ membershipId: adulto.membershipId, rate: 0.80 });
      }
      if (scheduleName.includes('teen')) {
        attendees.push({ membershipId: teen.membershipId, rate: 0.70 });
      }
      if (scheduleName.includes('kids')) {
        attendees.push({ membershipId: kids.membershipId, rate: 0.90 });
      }

      for (const att of attendees) {
        // Use deterministic random for attendance
        if (rand() < att.rate) {
          const { data: existAtt } = await supabase
            .from('attendances')
            .select('id')
            .eq('session_id', session.id)
            .eq('membership_id', att.membershipId)
            .single();

          if (!existAtt) {
            const methods: Array<'qr' | 'manual' | 'app'> = ['qr', 'manual', 'app'];
            const { error: attErr } = await supabase.from('attendances').insert({
              session_id: session.id,
              membership_id: att.membershipId,
              academy_id: ACADEMY_ID,
              checkin_method: methods[Math.floor(rand() * methods.length)],
            });
            if (!attErr) attendancesCreated++;
          }
        }
      }
    }
  }

  // Manually set streaks to desired values (override trigger-calculated ones)
  const streakUpdates = [
    { membershipId: adulto.membershipId, current: 5, longest: 12 },
    { membershipId: teen.membershipId, current: 3, longest: 7 },
    { membershipId: kids.membershipId, current: 8, longest: 15 },
  ];

  for (const su of streakUpdates) {
    await supabase.from('streaks').upsert({
      membership_id: su.membershipId,
      academy_id: ACADEMY_ID,
      current_streak: su.current,
      longest_streak: su.longest,
      last_activity_date: today.toISOString().split('T')[0],
    }, { onConflict: 'membership_id,academy_id' });
  }

  log('OK', `${sessionsCreated} sessions created/verified`);
  log('OK', `${attendancesCreated} attendance records created`);
  log('OK', 'Streaks set (Maria:5, Miguel:3, Ana:8)');
}

if (require.main === module) {
  seedAttendance().catch(console.error);
}
