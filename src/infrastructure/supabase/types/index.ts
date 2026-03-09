import type { Tables } from '@/lib/supabase/types';

export type MessageRow = Tables<'messages'>;
export type ConversationRow = Tables<'conversations'>;
export type MembershipRow = Tables<'memberships'>;
