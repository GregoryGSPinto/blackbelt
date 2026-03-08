import { structuredLog } from '@/lib/monitoring/structured-logger';
import { welcomeEmail } from '@/lib/emails/welcome';
import { paymentReminderEmail } from '@/lib/emails/payment-reminder';

export async function sendWelcomeEmailJob(params: { nome: string; academyName: string }) {
  structuredLog.business.info('Sending welcome email', { ...params });
  return welcomeEmail(params);
}

export async function sendPaymentReminderJob(params: { nome: string; amount: string; dueDate: string; planName: string }) {
  structuredLog.business.info('Sending payment reminder email', { ...params });
  return paymentReminderEmail(params);
}
