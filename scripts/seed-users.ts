/**
 * Seed: 6 users (Admin, Professor, Adulto, Teen, Kids, Parent)
 *
 * Creates auth users, profiles, memberships, and parent_child_link.
 * Idempotent: checks existence before creating.
 */
import { getAdminClient, ACADEMY_ID, SEED_PASSWORD, SEED_USERS, logSection, log } from './seed-helpers';

export async function seedUsers() {
  const supabase = getAdminClient();
  logSection('--- Seed Users ---');

  const createdUsers: { email: string; authId: string; role: string }[] = [];

  for (const user of SEED_USERS) {
    // Check if auth user exists
    const { data: authList } = await supabase.auth.admin.listUsers();
    const existing = authList?.users?.find((u) => u.email === user.email);

    let authId: string;
    if (existing) {
      authId = existing.id;
      log('--', `Auth exists: ${user.email} (${authId})`);
    } else {
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: SEED_PASSWORD,
        email_confirm: true,
      });
      if (error) {
        console.error(`  Failed to create ${user.email}: ${error.message}`);
        continue;
      }
      authId = data.user.id;
      log('OK', `Auth created: ${user.email} (${authId})`);
    }

    // Upsert profile
    const profileData: Record<string, unknown> = {
      id: authId,
      full_name: user.fullName,
      display_name: user.displayName,
    };
    // Teen gets a birth_date indicating teen age
    if (user.email === 'teen@blackbelt.app') {
      profileData.birth_date = '2012-06-15';
    }
    if (user.email === 'kids@blackbelt.app') {
      profileData.birth_date = '2017-03-20';
    }

    const { error: profErr } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
    if (profErr) console.error(`  Profile error (${user.email}): ${profErr.message}`);

    // Upsert membership
    const { data: existingMem } = await supabase
      .from('memberships')
      .select('id')
      .eq('profile_id', authId)
      .eq('academy_id', ACADEMY_ID)
      .eq('role', user.role)
      .single();

    if (!existingMem) {
      const memData: Record<string, unknown> = {
        profile_id: authId,
        academy_id: ACADEMY_ID,
        role: user.role,
        status: 'active',
      };
      if (user.beltRank) memData.belt_rank = user.beltRank;

      const { error: memErr } = await supabase.from('memberships').insert(memData);
      if (memErr) {
        console.error(`  Membership error (${user.email}): ${memErr.message}`);
      } else {
        log('OK', `Membership: ${user.email} -> ${user.role}`);
      }
    } else {
      log('--', `Membership exists: ${user.email} -> ${user.role}`);
    }

    createdUsers.push({ email: user.email, authId, role: user.role });
  }

  // Update academy owner_id to point to admin
  const admin = createdUsers.find((u) => u.role === 'owner');
  if (admin) {
    await supabase.from('academies').update({ owner_id: admin.authId }).eq('id', ACADEMY_ID);
    log('OK', `Academy owner set to ${admin.email}`);
  }

  // Create parent_child_link: Roberto (parent) -> Miguel (teen)
  const parent = createdUsers.find((u) => u.email === 'parent@blackbelt.app');
  const teen = createdUsers.find((u) => u.email === 'teen@blackbelt.app');

  if (parent && teen) {
    const { data: existingLink } = await supabase
      .from('parent_child_links')
      .select('id')
      .eq('parent_id', parent.authId)
      .eq('child_id', teen.authId)
      .single();

    if (!existingLink) {
      const { error: linkErr } = await supabase.from('parent_child_links').insert({
        parent_id: parent.authId,
        child_id: teen.authId,
        relationship: 'parent',
      });
      if (linkErr) {
        console.error(`  Parent-child link error: ${linkErr.message}`);
      } else {
        log('OK', 'Parent-child link: Roberto -> Miguel');
      }
    } else {
      log('--', 'Parent-child link exists');
    }
  }

  log('OK', `${createdUsers.length} users processed`);
}

if (require.main === module) {
  seedUsers().catch(console.error);
}
