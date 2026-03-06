import type { RoutableNotification } from '../notification-router';

export function beltPromotion(params: {
  userId: string;
  fromBelt: string;
  toBelt: string;
}): RoutableNotification {
  return {
    userId: params.userId,
    type: 'BELT_PROMOTION',
    title: 'Parabens pela promocao!',
    body: `Voce foi promovido de ${params.fromBelt} para ${params.toBelt}!`,
    channels: ['push', 'in_app', 'email'],
    priority: 'high',
    data: {
      fromBelt: params.fromBelt,
      toBelt: params.toBelt,
    },
  };
}
