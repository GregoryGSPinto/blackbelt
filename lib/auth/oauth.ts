/**
 * OAuth Authentication - Google & Apple Sign-In
 * BlackBelt - Social Login Integration
 */

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { logger } from '@/lib/logger';

const supabase = getSupabaseBrowserClient();

interface OAuthProvider {
  provider: 'google' | 'apple';
  redirectTo: string;
}

/**
 * Sign in with OAuth provider (Google or Apple)
 * Redirects to provider's OAuth page
 */
export async function signInWithOAuth({ provider }: Omit<OAuthProvider, 'redirectTo'>): Promise<void> {
  try {
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    logger.info('[OAuth]', `Initiating ${provider} sign-in...`);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent',
        } : undefined,
      },
    });

    if (error) {
      logger.error('[OAuth]', `${provider} sign-in error:`, error);
      throw error;
    }
    
    // Redirect happens automatically by Supabase
  } catch (err) {
    logger.error('[OAuth]', `Failed to initiate ${provider} sign-in:`, err);
    throw err;
  }
}

/**
 * Handle OAuth callback - exchange code for session
 * Call this in the callback route
 */
export async function handleOAuthCallback(code: string): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('[OAuth]', 'Processing callback...');
    
    // The session is automatically set by Supabase in the callback
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.error('[OAuth]', 'Session error:', error);
      return { success: false, error: error.message };
    }
    
    if (!session) {
      logger.error('[OAuth]', 'No session found');
      return { success: false, error: 'Sessão não encontrada' };
    }
    
    logger.info('[OAuth]', 'Session established successfully');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    logger.error('[OAuth]', 'Callback error:', err);
    return { success: false, error: message };
  }
}

/**
 * Get user profile after OAuth login
 */
export async function getOAuthUserProfile() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      logger.error('[OAuth]', 'Get user error:', error);
      return null;
    }
    
    return user;
  } catch (err) {
    logger.error('[OAuth]', 'Failed to get user profile:', err);
    return null;
  }
}

/**
 * Sign in with Google
 */
export function signInWithGoogle(): Promise<void> {
  return signInWithOAuth({ provider: 'google' });
}

/**
 * Sign in with Apple
 */
export function signInWithApple(): Promise<void> {
  return signInWithOAuth({ provider: 'apple' });
}
