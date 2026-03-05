/**
 * Seed: Progression data
 *
 * - Maria: faixa azul, 2 stripes, 18 meses de treino
 * - Miguel: faixa amarela, 1 stripe, 8 meses
 * - Ana: faixa branca, 3 stripes, 6 meses
 * - Histórico de promoções
 *
 * Idempotent: checks before inserting.
 */
import { getAdminClient, ACADEMY_ID, getSeedUserMap, logSection, log } from './seed-helpers';

export async function seedProgression() {
  const supabase = getAdminClient();
  logSection('--- Seed Progression ---');

  const userMap = await getSeedUserMap(supabase);
  const professor = userMap.get('professor@blackbelt.app');
  const adulto = userMap.get('adulto@blackbelt.app');
  const teen = userMap.get('teen@blackbelt.app');
  const kids = userMap.get('kids@blackbelt.app');

  if (!professor?.membershipId || !adulto?.membershipId || !teen?.membershipId || !kids?.membershipId) {
    console.error('  Missing memberships. Run seed-users first.');
    return;
  }

  // Get BJJ belt system
  const { data: bjjBeltSystem } = await supabase
    .from('belt_systems')
    .select('id')
    .eq('martial_art', 'bjj')
    .eq('name', 'IBJJF Adult')
    .single();

  if (!bjjBeltSystem) {
    console.error('  BJJ belt system not found. Check migrations.');
    return;
  }

  // Update belt_rank on memberships
  await supabase.from('memberships').update({ belt_rank: 'Azul' }).eq('id', adulto.membershipId);
  await supabase.from('memberships').update({ belt_rank: 'Amarela' }).eq('id', teen.membershipId);
  await supabase.from('memberships').update({ belt_rank: 'Branca' }).eq('id', kids.membershipId);
  log('OK', 'Belt ranks updated on memberships');

  // Promotions history
  const promotions = [
    // Maria: Branca -> Azul (18 meses atrás)
    {
      membership_id: adulto.membershipId,
      academy_id: ACADEMY_ID,
      belt_system_id: bjjBeltSystem.id,
      from_rank: 'Branca',
      to_rank: 'Azul',
      promoted_by: professor.membershipId,
      promoted_at: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Excelente evolução técnica. Domina posições básicas.',
    },
    // Maria: Azul 1 stripe (12 meses atrás)
    {
      membership_id: adulto.membershipId,
      academy_id: ACADEMY_ID,
      belt_system_id: bjjBeltSystem.id,
      from_rank: 'Azul',
      to_rank: 'Azul 1 grau',
      promoted_by: professor.membershipId,
      promoted_at: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Boa consistência de treino.',
    },
    // Maria: Azul 2 stripes (6 meses atrás)
    {
      membership_id: adulto.membershipId,
      academy_id: ACADEMY_ID,
      belt_system_id: bjjBeltSystem.id,
      from_rank: 'Azul 1 grau',
      to_rank: 'Azul 2 graus',
      promoted_by: professor.membershipId,
      promoted_at: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Competiu e ganhou medalha de ouro.',
    },
    // Miguel: Branca -> Amarela (8 meses atrás) - kids/teen belt system
    {
      membership_id: teen.membershipId,
      academy_id: ACADEMY_ID,
      belt_system_id: bjjBeltSystem.id,
      from_rank: 'Branca',
      to_rank: 'Amarela',
      promoted_by: professor.membershipId,
      promoted_at: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Bom comportamento e dedicação.',
    },
    // Miguel: Amarela 1 stripe (3 meses atrás)
    {
      membership_id: teen.membershipId,
      academy_id: ACADEMY_ID,
      belt_system_id: bjjBeltSystem.id,
      from_rank: 'Amarela',
      to_rank: 'Amarela 1 grau',
      promoted_by: professor.membershipId,
      promoted_at: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Melhorou muito na guarda.',
    },
  ];

  for (const promo of promotions) {
    // Check if exists
    const { data: exists } = await supabase
      .from('promotions')
      .select('id')
      .eq('membership_id', promo.membership_id)
      .eq('to_rank', promo.to_rank)
      .single();

    if (!exists) {
      const { error } = await supabase.from('promotions').insert(promo);
      if (error) {
        console.error(`  Promotion failed: ${error.message}`);
      } else {
        log('OK', `Promotion: ${promo.from_rank} -> ${promo.to_rank}`);
      }
    } else {
      log('--', `Promotion exists: ${promo.to_rank}`);
    }
  }

  // Milestones
  const milestones = [
    {
      membership_id: adulto.membershipId,
      academy_id: ACADEMY_ID,
      type: 'belt_promotion' as const,
      title: 'Faixa Azul',
      description: 'Promovida para faixa azul de BJJ',
      achieved_at: new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { belt: 'blue', martial_art: 'bjj' },
    },
    {
      membership_id: adulto.membershipId,
      academy_id: ACADEMY_ID,
      type: 'attendance_streak' as const,
      title: 'Streak de 10 dias',
      description: 'Treinou 10 dias consecutivos',
      achieved_at: new Date(Date.now() - 10 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { streak: 10 },
    },
    {
      membership_id: teen.membershipId,
      academy_id: ACADEMY_ID,
      type: 'belt_promotion' as const,
      title: 'Faixa Amarela',
      description: 'Promovido para faixa amarela',
      achieved_at: new Date(Date.now() - 8 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      metadata: { belt: 'yellow', martial_art: 'bjj' },
    },
  ];

  for (const ms of milestones) {
    const { data: exists } = await supabase
      .from('milestones')
      .select('id')
      .eq('membership_id', ms.membership_id)
      .eq('title', ms.title)
      .single();

    if (!exists) {
      const { error } = await supabase.from('milestones').insert(ms);
      if (error) console.error(`  Milestone failed: ${error.message}`);
      else log('OK', `Milestone: ${ms.title}`);
    } else {
      log('--', `Milestone exists: ${ms.title}`);
    }
  }

  // Create skill track and assessments
  const { data: existingTrack } = await supabase
    .from('skill_tracks')
    .select('id')
    .eq('academy_id', ACADEMY_ID)
    .eq('name', 'BJJ Fundamentals')
    .single();

  let trackId = existingTrack?.id;

  if (!trackId) {
    const { data: newTrack } = await supabase
      .from('skill_tracks')
      .insert({
        academy_id: ACADEMY_ID,
        martial_art: 'bjj',
        name: 'BJJ Fundamentals',
        description: 'Habilidades fundamentais do Jiu-Jitsu Brasileiro',
        skills: [
          { key: 'guard_pass', name: 'Passagem de Guarda', category: 'top' },
          { key: 'sweep', name: 'Raspagem', category: 'bottom' },
          { key: 'submission', name: 'Finalização', category: 'attack' },
          { key: 'escape', name: 'Fuga', category: 'defense' },
          { key: 'takedown', name: 'Queda', category: 'standing' },
        ],
      })
      .select('id')
      .single();
    trackId = newTrack?.id;
    if (trackId) log('OK', 'Skill track created: BJJ Fundamentals');
  }

  if (trackId) {
    const assessments = [
      { membership_id: adulto.membershipId, skill_key: 'guard_pass', score: 72 },
      { membership_id: adulto.membershipId, skill_key: 'sweep', score: 65 },
      { membership_id: adulto.membershipId, skill_key: 'submission', score: 58 },
      { membership_id: adulto.membershipId, skill_key: 'escape', score: 70 },
      { membership_id: teen.membershipId, skill_key: 'guard_pass', score: 45 },
      { membership_id: teen.membershipId, skill_key: 'escape', score: 50 },
    ];

    for (const a of assessments) {
      const { data: existA } = await supabase
        .from('skill_assessments')
        .select('id')
        .eq('membership_id', a.membership_id)
        .eq('skill_track_id', trackId)
        .eq('skill_key', a.skill_key)
        .limit(1)
        .single();

      if (!existA) {
        await supabase.from('skill_assessments').insert({
          membership_id: a.membership_id,
          skill_track_id: trackId,
          skill_key: a.skill_key,
          score: a.score,
          assessed_by: professor.membershipId,
          notes: 'Avaliação de seed',
        });
      }
    }
    log('OK', 'Skill assessments created');
  }

  log('OK', 'Progression seed complete');
}

if (require.main === module) {
  seedProgression().catch(console.error);
}
