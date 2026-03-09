/**
 * Lead Automation Module - BlackBelt
 * Gerencia automação de emails e sequências para leads
 */

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  trigger_event: 'welcome' | 'presentation' | 'case_study' | 'proposal' | 'follow_up' | 'custom';
  delay_days: number;
}

export interface LeadSequence {
  lead_id: string;
  email: string;
  responsible_name: string;
  academy_name: string;
}

/**
 * Substitui variáveis no template
 */
export function processTemplate(
  template: string,
  variables: Record<string, string>
): string {
  let processed = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value);
  }
  
  return processed;
}

/**
 * Agenda a sequência de emails para um lead
 */
export async function scheduleLeadSequence(
  leadId: string,
  customPrice?: string
): Promise<boolean> {
  try {
    // Buscar dados do lead
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (!lead) {
      console.error('[Lead Automation] Lead not found:', leadId);
      return false;
    }

    // Buscar templates ativos
    const { data: templates } = await supabaseAdmin
      .from('lead_email_templates')
      .select('*')
      .eq('is_active', true)
      .order('delay_days', { ascending: true });

    if (!templates || templates.length === 0) {
      console.error('[Lead Automation] No active templates found');
      return false;
    }

    // Agendar cada email
    const now = new Date();
    
    for (const template of templates) {
      const scheduledAt = new Date(now);
      scheduledAt.setDate(scheduledAt.getDate() + template.delay_days);

      await supabaseAdmin
        .from('lead_automation_sequences')
        .insert({
          lead_id: leadId,
          template_id: template.id,
          scheduled_at: scheduledAt.toISOString(),
          status: 'pending',
        });
    }

    // Criar interação de registro
    await supabaseAdmin
      .from('lead_interactions')
      .insert({
        lead_id: leadId,
        type: 'email',
        content: `Sequência de ${templates.length} emails agendada`,
        sent_by: null,
      });

    return true;
  } catch (error) {
    console.error('[Lead Automation] Error scheduling sequence:', error);
    return false;
  }
}

/**
 * Envia email imediato (bypass da automação)
 */
export async function sendImmediateEmail(
  leadId: string,
  templateId: string,
  customVariables?: Record<string, string>
): Promise<boolean> {
  try {
    // Buscar dados
    const [{ data: lead }, { data: template }] = await Promise.all([
      supabaseAdmin.from('leads').select('*').eq('id', leadId).single(),
      supabaseAdmin.from('lead_email_templates').select('*').eq('id', templateId).single(),
    ]);

    if (!lead || !template) {
      console.error('[Lead Automation] Lead or template not found');
      return false;
    }

    // Processar template
    const variables = {
      responsible_name: lead.responsible_name,
      academy_name: lead.academy_name,
      custom_price: customVariables?.custom_price || '299',
      proposal_link: `${process.env.NEXT_PUBLIC_APP_URL}/proposta/${leadId}`,
      ...customVariables,
    };

    const subject = processTemplate(template.subject, variables);
    const body = processTemplate(template.body, variables);

    // Aqui integraria com SendGrid/Resend
    // await sendEmail({ to: lead.email, subject, body });
    
    console.log('[Lead Automation] Email would be sent:', {
      to: lead.email,
      subject,
      body: body.substring(0, 100) + '...',
    });

    // Registrar interação
    await supabaseAdmin
      .from('lead_interactions')
      .insert({
        lead_id: leadId,
        type: 'email',
        content: `Email "${template.name}" enviado: ${subject}`,
        sent_by: null,
      });

    return true;
  } catch (error) {
    console.error('[Lead Automation] Error sending immediate email:', error);
    return false;
  }
}

/**
 * Cancela sequência de emails pendentes
 */
export async function cancelPendingSequence(leadId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('lead_automation_sequences')
      .update({ status: 'cancelled' })
      .eq('lead_id', leadId)
      .eq('status', 'pending');

    if (error) {
      console.error('[Lead Automation] Error cancelling sequence:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Lead Automation] Error cancelling sequence:', error);
    return false;
  }
}

/**
 * Processa emails agendados (chamado por cron job)
 */
export async function processScheduledEmails(): Promise<number> {
  try {
    const now = new Date().toISOString();

    // Buscar emails pendentes que devem ser enviados
    const { data: pendingEmails } = await supabaseAdmin
      .from('lead_automation_sequences')
      .select(`
        *,
        leads:lead_id (*),
        templates:template_id (*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', now);

    if (!pendingEmails || pendingEmails.length === 0) {
      return 0;
    }

    let sentCount = 0;

    for (const email of pendingEmails) {
      try {
        const lead = email.leads;
        const template = email.templates;

        if (!lead || !template) continue;

        // Processar e enviar
        const variables = {
          responsible_name: lead.responsible_name,
          academy_name: lead.academy_name,
          custom_price: lead.custom_price?.toString() || '299',
          proposal_link: `${process.env.NEXT_PUBLIC_APP_URL}/proposta/${lead.id}`,
        };

        const subject = processTemplate(template.subject, variables);
        const body = processTemplate(template.body, variables);

        // Integração com serviço de email aqui
        // await sendEmail({ to: lead.email, subject, body });

        // Marcar como enviado
        await supabaseAdmin
          .from('lead_automation_sequences')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', email.id);

        // Registrar interação
        await supabaseAdmin
          .from('lead_interactions')
          .insert({
            lead_id: lead.id,
            type: 'email',
            content: `Email automático "${template.name}" enviado`,
            sent_by: null,
          });

        sentCount++;
      } catch (err) {
        console.error('[Lead Automation] Error processing email:', err);
        
        // Marcar como falha
        await supabaseAdmin
          .from('lead_automation_sequences')
          .update({ status: 'failed' })
          .eq('id', email.id);
      }
    }

    return sentCount;
  } catch (error) {
    console.error('[Lead Automation] Error processing scheduled emails:', error);
    return 0;
  }
}

/**
 * Retorna estatísticas de automação
 */
export async function getAutomationStats(): Promise<{
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
}> {
  try {
    const { data } = await supabaseAdmin
      .from('lead_automation_sequences')
      .select('status');

    if (!data) {
      return { pending: 0, sent: 0, failed: 0, cancelled: 0 };
    }

    return {
      pending: data.filter(d => d.status === 'pending').length,
      sent: data.filter(d => d.status === 'sent').length,
      failed: data.filter(d => d.status === 'failed').length,
      cancelled: data.filter(d => d.status === 'cancelled').length,
    };
  } catch (error) {
    console.error('[Lead Automation] Error getting stats:', error);
    return { pending: 0, sent: 0, failed: 0, cancelled: 0 };
  }
}
