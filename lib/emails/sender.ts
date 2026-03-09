/**
 * Email Transacional — BlackBelt
 * Usa Resend para envio de emails transacionais.
 * Se RESEND_API_KEY nao esta configurada, loga no console e nao crashar.
 */
import { Resend } from 'resend';
import { welcomeEmail } from './welcome';
import { newStudentEmail } from './new-student';
import { paymentReminderEmail } from './payment-reminder';
import { logger } from '@/lib/logger';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'BlackBelt <noreply@blackbelt.app>';

export type EmailTemplate = 'welcome' | 'new-student' | 'payment-reminder';

interface TemplateData {
  welcome: { nome: string; email: string };
  'new-student': { studentName: string; studentEmail: string; plan: string; enrolledAt: string };
  'payment-reminder': { nome: string; amount: string; dueDate: string; planName: string };
}

const SUBJECTS: Record<EmailTemplate, string> = {
  'welcome': 'Bem-vindo ao BlackBelt!',
  'new-student': 'Novo aluno matriculado',
  'payment-reminder': 'Lembrete de pagamento',
};

function getHtml<T extends EmailTemplate>(template: T, data: TemplateData[T]): string {
  switch (template) {
    case 'welcome': {
      const d = data as TemplateData['welcome'];
      return welcomeEmail({ nome: d.nome, academyName: 'BlackBelt' });
    }
    case 'new-student': {
      const d = data as TemplateData['new-student'];
      return newStudentEmail({ studentName: d.studentName, studentEmail: d.studentEmail, plan: d.plan, enrolledAt: d.enrolledAt });
    }
    case 'payment-reminder': {
      const d = data as TemplateData['payment-reminder'];
      return paymentReminderEmail({ nome: d.nome, amount: d.amount, dueDate: d.dueDate, planName: d.planName });
    }
    default:
      return '<p>Template not found.</p>';
  }
}

export async function sendEmail<T extends EmailTemplate>(
  to: string,
  template: T,
  data: TemplateData[T],
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    logger.info('[Email]', `RESEND_API_KEY not configured. Would send "${template}" to ${to}`);
    return { success: true, id: 'mock-' + Date.now() };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: SUBJECTS[template],
      html: getHtml(template, data),
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error('[Email] Failed to send:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
