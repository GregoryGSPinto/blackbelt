/**
 * Seed: Achievements
 *
 * - Maria: "Primeira Aula", "Semana Perfeita" (streak 7), "Primeira Graduação"
 * - Miguel: "Primeira Aula", "Semana Perfeita" (streak 7) (using classes_10 as fallback)
 * - Ana: "Primeira Aula", "Semana Perfeita", "10 Aulas"
 *
 * Idempotent: uses upsert on (membership_id, achievement_id).
 */
import { getAdminClient, getSeedUserMap, logSection, log } from './seed-helpers';

export async function seedAchievements() {
  const supabase = getAdminClient();
  logSection('--- Seed Achievements ---');

  const userMap = await getSeedUserMap(supabase);
  const adulto = userMap.get('adulto@blackbelt.app');
  const teen = userMap.get('teen@blackbelt.app');
  const kids = userMap.get('kids@blackbelt.app');

  if (!adulto?.membershipId || !teen?.membershipId || !kids?.membershipId) {
    console.error('  Missing memberships. Run seed-users first.');
    return;
  }

  // Get achievement definitions
  const { data: achievements } = await supabase.from('achievements').select('id, key, name');

  if (!achievements || achievements.length === 0) {
    console.error('  No achievements found. Check gamification migration.');
    return;
  }

  const achvMap = new Map(achievements.map((a) => [a.key, a]));

  // Define which user gets which achievements
  const grants: { membershipId: string; label: string; keys: string[] }[] = [
    {
      membershipId: adulto.membershipId,
      label: 'Maria',
      keys: ['first_class', 'streak_7', 'classes_10', 'classes_50', 'first_promotion'],
    },
    {
      membershipId: teen.membershipId,
      label: 'Miguel',
      keys: ['first_class', 'streak_7', 'first_promotion'],
    },
    {
      membershipId: kids.membershipId,
      label: 'Ana',
      keys: ['first_class', 'streak_7', 'classes_10'],
    },
  ];

  for (const grant of grants) {
    for (const key of grant.keys) {
      const achv = achvMap.get(key);
      if (!achv) {
        console.error(`  Achievement '${key}' not found in DB`);
        continue;
      }

      const { data: exists } = await supabase
        .from('member_achievements')
        .select('id')
        .eq('membership_id', grant.membershipId)
        .eq('achievement_id', achv.id)
        .single();

      if (!exists) {
        const { error } = await supabase.from('member_achievements').upsert({
          membership_id: grant.membershipId,
          achievement_id: achv.id,
        }, { onConflict: 'membership_id,achievement_id' });

        if (error) {
          console.error(`  Grant failed (${grant.label}/${key}): ${error.message}`);
        } else {
          log('OK', `${grant.label}: ${achv.name}`);
        }
      } else {
        log('--', `${grant.label}: ${achv.name} (exists)`);
      }
    }
  }

  log('OK', 'Achievements seed complete');
}

if (require.main === module) {
  seedAchievements().catch(console.error);
}
