/**
 * Seed: Academia BlackBelt Demo
 *
 * Creates 1 complete academy with BJJ, pro plan, pt-BR locale.
 * Idempotent: uses upsert on fixed ID.
 */
import { getAdminClient, ACADEMY_ID, logSection, log } from './seed-helpers';

export async function seedAcademy() {
  const supabase = getAdminClient();
  logSection('--- Seed Academy ---');

  // We need at least a placeholder owner_id. This will be updated by seed-users.
  // Check if academy already exists
  const { data: existing } = await supabase
    .from('academies')
    .select('id, owner_id')
    .eq('id', ACADEMY_ID)
    .single();

  if (existing) {
    log('OK', `Academy already exists: ${ACADEMY_ID}`);
    return;
  }

  // Academy needs an owner_id (FK to auth.users).
  // We'll create a temporary auth user or find existing admin.
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  let ownerId = authUsers?.users?.find((u) => u.email === 'admin@blackbelt.app')?.id;

  if (!ownerId) {
    // Create admin user first so we can reference it as owner
    const { data: newUser, error: authErr } = await supabase.auth.admin.createUser({
      email: 'admin@blackbelt.app',
      password: 'BlackBelt@2026!',
      email_confirm: true,
    });
    if (authErr) {
      console.error(`  Failed to create admin user: ${authErr.message}`);
      process.exit(1);
    }
    ownerId = newUser.user.id;

    // Create profile for the admin
    await supabase.from('profiles').upsert({
      id: ownerId,
      full_name: 'Carlos Silva',
      display_name: 'Carlos',
    }, { onConflict: 'id' });
  }

  const { error } = await supabase.from('academies').upsert({
    id: ACADEMY_ID,
    name: 'Academia BlackBelt Demo',
    slug: 'blackbelt-demo',
    owner_id: ownerId,
    status: 'active',
    phone: '(11) 99999-0001',
    email: 'contato@blackbelt.app',
    logo_url: null,
    address: {
      street: 'Rua das Artes Marciais, 100',
      city: 'São Paulo',
      state: 'SP',
      zip: '01310-100',
      country: 'BR',
    },
    settings: {
      plan: 'pro',
      timezone: 'America/Sao_Paulo',
      locale: 'pt-BR',
      martial_art: 'bjj',
      features: ['checkin', 'gamification', 'financial', 'progression', 'notifications', 'messaging'],
    },
  }, { onConflict: 'id' });

  if (error) {
    console.error(`  Failed: ${error.message}`);
    process.exit(1);
  }

  log('OK', 'Academia BlackBelt Demo created');
}

// Allow direct execution
if (require.main === module) {
  seedAcademy().catch(console.error);
}
