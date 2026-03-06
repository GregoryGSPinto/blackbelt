import type { RoutableNotification } from '../notification-router';

export function messageReceived(params: {
  userId: string;
  senderName: string;
  preview?: string;
}): RoutableNotification {
  return {
    userId: params.userId,
    type: 'MESSAGE_RECEIVED',
    title: `Nova mensagem de ${params.senderName}`,
    body: params.preview || 'Voce recebeu uma nova mensagem.',
    channels: ['push', 'in_app'],
    priority: 'normal',
    data: {
      senderName: params.senderName,
    },
  };
}
