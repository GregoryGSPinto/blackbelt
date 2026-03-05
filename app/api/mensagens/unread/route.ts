import { NextRequest } from 'next/server';
import { createHandler, apiOk } from '@/lib/api/supabase-helpers';

export const dynamic = 'force-dynamic';

export const GET = createHandler(async (_req: NextRequest, { supabase, user }) => {
  // Count messages newer than last_read_at for each conversation
  const { data: memberships } = await supabase
    .from('conversation_members')
    .select('conversation_id, last_read_at')
    .eq('profile_id', user.id);

  let totalUnread = 0;

  if (memberships && memberships.length > 0) {
    for (const mem of memberships) {
      let query = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', mem.conversation_id)
        .neq('sender_id', user.id);

      if (mem.last_read_at) {
        query = query.gt('created_at', mem.last_read_at);
      }

      const { count } = await query;
      totalUnread += count || 0;
    }
  }

  return apiOk({ count: totalUnread });
});
