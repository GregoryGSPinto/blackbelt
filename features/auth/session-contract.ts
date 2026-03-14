import type { User } from '@/lib/api/contracts';

export interface AuthSessionData {
  mode: 'mock' | 'supabase';
  user: User;
  profiles: User[];
  loginEmail?: string | null;
}

export interface AuthSessionResponse {
  session: AuthSessionData | null;
  error?: string;
  code?: string;
}
