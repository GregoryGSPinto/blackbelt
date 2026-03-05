import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';
import { markConversationRead } from '@/lib/db/queries/messages';

export const dynamic = 'force-dynamic';

export const PATCH = createHandler(async (req: NextRequest, { supabase, user }) => {
  const url = new URL(req.url);
  const segments = url.pathname.split('/mensagens/')[1]?.split('/');
  const conversaId = segments?.[0];

  await markConversationRead(supabase, conversaId, user.id);
  return apiOk({ success: true });
});
