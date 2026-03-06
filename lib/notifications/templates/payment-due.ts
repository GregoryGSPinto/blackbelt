import type { RoutableNotification } from '../notification-router';

export function paymentDue(params: {
  userId: string;
  amount?: string;
  dueDate?: string;
}): RoutableNotification {
  const bodyParts = ['Voce tem um pagamento pendente.'];
  if (params.amount) bodyParts.push(`Valor: ${params.amount}.`);
  if (params.dueDate) bodyParts.push(`Vencimento: ${params.dueDate}.`);

  return {
    userId: params.userId,
    type: 'PAYMENT_DUE',
    title: 'Pagamento pendente',
    body: bodyParts.join(' '),
    channels: ['push', 'in_app', 'email'],
    priority: 'high',
    data: {
      amount: params.amount || '',
      dueDate: params.dueDate || '',
    },
  };
}
