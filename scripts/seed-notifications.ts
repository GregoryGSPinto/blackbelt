/**
 * Seed: Notifications
 *
 * 10 notifications per user (mix of types), 3 unread per user.
 * Idempotent: checks count before inserting.
 */
import { getAdminClient, ACADEMY_ID, getSeedUserMap, SEED_USERS, logSection, log } from './seed-helpers';

const NOTIFICATION_TEMPLATES = [
  { type: 'welcome', title: 'Bem-vindo ao BlackBelt!', body: 'Sua conta foi criada com sucesso. Comece fazendo check-in na sua próxima aula!' },
  { type: 'class', title: 'Aula de Fundamentos hoje', body: 'Sua aula de Fundamentos começa às 07:00. Não esqueça de fazer check-in!' },
  { type: 'streak', title: 'Streak em risco!', body: 'Você não treinou ontem. Treine hoje para manter seu streak!' },
  { type: 'achievement', title: 'Conquista desbloqueada!', body: 'Parabéns! Você desbloqueou a conquista "Primeira Aula".' },
  { type: 'promotion', title: 'Nova graduação disponível', body: 'Seu professor agendou uma avaliação de faixa para você.' },
  { type: 'financial', title: 'Fatura disponível', body: 'Sua fatura de março está disponível. Valor: R$149,90.' },
  { type: 'class', title: 'Aula cancelada', body: 'A aula de Avançado de amanhã foi cancelada. Veja outras opções no app.' },
  { type: 'general', title: 'Novidades no app', body: 'Confira as novas funcionalidades: gamificação, conquistas e muito mais!' },
  { type: 'class', title: 'Horário alterado', body: 'O horário da aula de Open Mat mudou para 10:30 neste sábado.' },
  { type: 'general', title: 'Campeonato se aproxima!', body: 'O Campeonato Interno BlackBelt será dia 15/04. Inscreva-se!' },
];

export async function seedNotifications() {
  const supabase = getAdminClient();
  logSection('--- Seed Notifications ---');

  const userMap = await getSeedUserMap(supabase);

  for (const seedUser of SEED_USERS) {
    const user = userMap.get(seedUser.email);
    if (!user?.authId) continue;

    // Check existing count
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.authId)
      .eq('academy_id', ACADEMY_ID);

    if ((count ?? 0) >= 10) {
      log('--', `Notifications exist for ${seedUser.email} (${count})`);
      continue;
    }

    const toCreate = 10 - (count ?? 0);
    const startIdx = count ?? 0;

    for (let i = startIdx; i < 10; i++) {
      const tmpl = NOTIFICATION_TEMPLATES[i];
      const daysAgo = (10 - i) * 2; // Spread over 20 days
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      // Last 3 are unread
      const isRead = i < 7;

      await supabase.from('notifications').insert({
        profile_id: user.authId,
        academy_id: ACADEMY_ID,
        title: tmpl.title,
        body: tmpl.body,
        type: tmpl.type,
        read: isRead,
        created_at: createdAt.toISOString(),
      });
    }

    log('OK', `${toCreate} notifications created for ${seedUser.email}`);
  }

  log('OK', 'Notifications seed complete');
}

if (require.main === module) {
  seedNotifications().catch(console.error);
}
