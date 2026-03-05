/**
 * Seed: 5 turmas com horários recorrentes
 *
 * - "Fundamentos" — Seg/Qua/Sex 07:00
 * - "Avançado" — Seg/Qua/Sex 19:00
 * - "Kids" — Ter/Qui 15:00
 * - "Teen" — Ter/Qui 17:00
 * - "Open Mat" — Sáb 10:00
 *
 * Idempotent: checks by name + academy before inserting.
 */
import { getAdminClient, ACADEMY_ID, getSeedUserMap, logSection, log } from './seed-helpers';

interface ScheduleDef {
  name: string;
  martialArt: string;
  level: string;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  startTime: string;
  endTime: string;
}

const SCHEDULE_DEFS: ScheduleDef[] = [
  { name: 'Fundamentos', martialArt: 'bjj', level: 'beginner', daysOfWeek: [1, 3, 5], startTime: '07:00', endTime: '08:30' },
  { name: 'Avançado', martialArt: 'bjj', level: 'advanced', daysOfWeek: [1, 3, 5], startTime: '19:00', endTime: '20:30' },
  { name: 'Kids', martialArt: 'bjj', level: 'kids', daysOfWeek: [2, 4], startTime: '15:00', endTime: '16:00' },
  { name: 'Teen', martialArt: 'bjj', level: 'teens', daysOfWeek: [2, 4], startTime: '17:00', endTime: '18:00' },
  { name: 'Open Mat', martialArt: 'bjj', level: 'all_levels', daysOfWeek: [6], startTime: '10:00', endTime: '11:30' },
];

export async function seedClasses() {
  const supabase = getAdminClient();
  logSection('--- Seed Classes ---');

  const userMap = await getSeedUserMap(supabase);
  const professor = userMap.get('professor@blackbelt.app');
  if (!professor?.membershipId) {
    console.error('  Professor membership not found. Run seed-users first.');
    return;
  }

  const createdScheduleIds: string[] = [];

  for (const def of SCHEDULE_DEFS) {
    for (const dow of def.daysOfWeek) {
      const scheduleName = def.daysOfWeek.length > 1
        ? `${def.name} (${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dow]})`
        : def.name;

      // Check existing
      const { data: existing } = await supabase
        .from('class_schedules')
        .select('id')
        .eq('academy_id', ACADEMY_ID)
        .eq('name', scheduleName)
        .eq('day_of_week', dow)
        .single();

      if (existing) {
        log('--', `Schedule exists: ${scheduleName}`);
        createdScheduleIds.push(existing.id);
        continue;
      }

      const { data, error } = await supabase
        .from('class_schedules')
        .insert({
          academy_id: ACADEMY_ID,
          name: scheduleName,
          martial_art: def.martialArt,
          level: def.level,
          instructor_id: professor.membershipId,
          day_of_week: dow,
          start_time: def.startTime,
          end_time: def.endTime,
          max_capacity: 30,
          active: true,
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Failed ${scheduleName}: ${error.message}`);
      } else {
        log('OK', `Schedule: ${scheduleName}`);
        createdScheduleIds.push(data.id);
      }
    }
  }

  // Enroll students in appropriate classes
  const adulto = userMap.get('adulto@blackbelt.app');
  const teen = userMap.get('teen@blackbelt.app');
  const kids = userMap.get('kids@blackbelt.app');

  // Get all schedules for enrollment
  const { data: allSchedules } = await supabase
    .from('class_schedules')
    .select('id, name, level')
    .eq('academy_id', ACADEMY_ID);

  if (allSchedules) {
    for (const schedule of allSchedules) {
      const enrollments: { scheduleId: string; membershipId: string }[] = [];
      const name = schedule.name.toLowerCase();

      // Adults in Fundamentos + Avançado + Open Mat
      if (adulto?.membershipId && (name.includes('fundamentos') || name.includes('avançado') || name.includes('open mat'))) {
        enrollments.push({ scheduleId: schedule.id, membershipId: adulto.membershipId });
      }
      // Teen in Teen classes
      if (teen?.membershipId && name.includes('teen')) {
        enrollments.push({ scheduleId: schedule.id, membershipId: teen.membershipId });
      }
      // Kids in Kids classes
      if (kids?.membershipId && name.includes('kids')) {
        enrollments.push({ scheduleId: schedule.id, membershipId: kids.membershipId });
      }

      for (const enr of enrollments) {
        const { data: existEnr } = await supabase
          .from('class_enrollments')
          .select('id')
          .eq('schedule_id', enr.scheduleId)
          .eq('membership_id', enr.membershipId)
          .single();

        if (!existEnr) {
          await supabase.from('class_enrollments').insert({
            schedule_id: enr.scheduleId,
            membership_id: enr.membershipId,
            status: 'active',
          });
        }
      }
    }
    log('OK', 'Student enrollments processed');
  }

  log('OK', `${createdScheduleIds.length} schedule slots created/verified`);
}

if (require.main === module) {
  seedClasses().catch(console.error);
}
