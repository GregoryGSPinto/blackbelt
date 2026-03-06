import type { RoutableNotification } from '../notification-router';

export function classReminder(params: {
  userId: string;
  className: string;
  startsIn: string;
}): RoutableNotification {
  return {
    userId: params.userId,
    type: 'CLASS_REMINDER',
    title: `Aula em ${params.startsIn}`,
    body: `Sua aula "${params.className}" comeca em ${params.startsIn}.`,
    channels: ['push'],
    priority: 'normal',
    data: {
      className: params.className,
    },
  };
}
