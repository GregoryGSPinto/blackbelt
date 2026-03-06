import type { RoutableNotification } from '../notification-router';

export function checkinConfirmed(params: {
  userId: string;
  sessionName?: string;
}): RoutableNotification {
  return {
    userId: params.userId,
    type: 'CHECKIN_CONFIRMED',
    title: 'Check-in confirmado',
    body: params.sessionName
      ? `Sua presenca na aula "${params.sessionName}" foi registrada.`
      : 'Sua presenca foi registrada com sucesso.',
    channels: ['push', 'in_app'],
    priority: 'low',
  };
}
