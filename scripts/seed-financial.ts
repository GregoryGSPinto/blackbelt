/**
 * Seed: Financial data
 *
 * - 3 plans: Mensal R$149,90 / Trimestral R$399,90 / Anual R$1.499,00
 * - Maria: assinatura mensal ativa, 3 faturas pagas
 * - Roberto (parent): assinatura mensal ativa, 2 faturas pagas
 *
 * Idempotent: checks existence before inserting.
 */
import { getAdminClient, ACADEMY_ID, getSeedUserMap, logSection, log } from './seed-helpers';

const PLANS = [
  { name: 'Mensal', description: 'Acesso completo, cobrança mensal', priceCents: 14990, intervalMonths: 1 },
  { name: 'Trimestral', description: 'Acesso completo, cobrança trimestral', priceCents: 39990, intervalMonths: 3 },
  { name: 'Anual', description: 'Acesso completo, cobrança anual com desconto', priceCents: 149900, intervalMonths: 12 },
];

export async function seedFinancial() {
  const supabase = getAdminClient();
  logSection('--- Seed Financial ---');

  const userMap = await getSeedUserMap(supabase);
  const adulto = userMap.get('adulto@blackbelt.app');
  const parent = userMap.get('parent@blackbelt.app');

  if (!adulto?.membershipId || !parent?.membershipId) {
    console.error('  Missing memberships. Run seed-users first.');
    return;
  }

  // Create plans
  const planIds: Map<string, string> = new Map();

  for (const plan of PLANS) {
    const { data: existing } = await supabase
      .from('plans')
      .select('id')
      .eq('academy_id', ACADEMY_ID)
      .eq('name', plan.name)
      .single();

    if (existing) {
      planIds.set(plan.name, existing.id);
      log('--', `Plan exists: ${plan.name}`);
      continue;
    }

    const { data, error } = await supabase
      .from('plans')
      .insert({
        academy_id: ACADEMY_ID,
        name: plan.name,
        description: plan.description,
        price_cents: plan.priceCents,
        interval_months: plan.intervalMonths,
        active: true,
        features: ['checkin', 'progression', 'gamification', 'notifications'],
      })
      .select('id')
      .single();

    if (error) {
      console.error(`  Plan failed (${plan.name}): ${error.message}`);
    } else {
      planIds.set(plan.name, data.id);
      log('OK', `Plan: ${plan.name} - R$${(plan.priceCents / 100).toFixed(2)}`);
    }
  }

  const mensalPlanId = planIds.get('Mensal');
  if (!mensalPlanId) {
    console.error('  Mensal plan not found.');
    return;
  }

  // Create subscriptions and invoices
  const subscribers = [
    { membershipId: adulto.membershipId, label: 'Maria (adulto)', invoiceCount: 3 },
    { membershipId: parent.membershipId, label: 'Roberto (parent)', invoiceCount: 2 },
  ];

  for (const sub of subscribers) {
    // Check existing subscription
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('membership_id', sub.membershipId)
      .eq('plan_id', mensalPlanId)
      .single();

    let subId: string;

    if (existingSub) {
      subId = existingSub.id;
      log('--', `Subscription exists: ${sub.label}`);
    } else {
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          membership_id: sub.membershipId,
          plan_id: mensalPlanId,
          academy_id: ACADEMY_ID,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error(`  Subscription failed (${sub.label}): ${error.message}`);
        continue;
      }
      subId = data.id;
      log('OK', `Subscription: ${sub.label}`);
    }

    // Create past invoices (paid)
    const { data: existingInvoices } = await supabase
      .from('invoices')
      .select('id')
      .eq('subscription_id', subId);

    const existingCount = existingInvoices?.length ?? 0;
    const toCreate = sub.invoiceCount - existingCount;

    for (let i = 0; i < toCreate; i++) {
      const monthsAgo = sub.invoiceCount - existingCount - i;
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() - monthsAgo);
      const paidDate = new Date(dueDate);
      paidDate.setDate(paidDate.getDate() + 2); // Paid 2 days after due

      const { data: invoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
          subscription_id: subId,
          academy_id: ACADEMY_ID,
          amount_cents: 14990,
          status: 'paid',
          due_date: dueDate.toISOString().split('T')[0],
          paid_at: paidDate.toISOString(),
        })
        .select('id')
        .single();

      if (invErr) {
        console.error(`  Invoice failed: ${invErr.message}`);
        continue;
      }

      // Create payment record
      await supabase.from('payments').insert({
        invoice_id: invoice.id,
        academy_id: ACADEMY_ID,
        amount_cents: 14990,
        method: 'pix',
        paid_at: paidDate.toISOString(),
      });
    }

    if (toCreate > 0) {
      log('OK', `${toCreate} invoices + payments created for ${sub.label}`);
    }
  }

  log('OK', 'Financial seed complete');
}

if (require.main === module) {
  seedFinancial().catch(console.error);
}
