import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, _ctx) => {
  return apiOk({
    BJJ: { label: 'Jiu-Jitsu Brasileiro', emoji: '🥋' },
    JUDO: { label: 'Judô', emoji: '🥋' },
    WRESTLING: { label: 'Luta Olímpica', emoji: '🤼' },
    MUAY_THAI: { label: 'Muay Thai', emoji: '🥊' },
    BOXING: { label: 'Boxe', emoji: '🥊' },
    MMA: { label: 'MMA', emoji: '👊' },
    KARATE: { label: 'Karatê', emoji: '🥋' },
    TAEKWONDO: { label: 'Taekwondo', emoji: '🦶' },
  });
});
