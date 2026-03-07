/**
 * OAuth Callback Handler
 * Processes authentication callbacks from Google and Apple
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Handle OAuth errors
  if (error) {
    logger.error('[OAuth Callback]', 'Provider error:', { error, errorDescription });
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription || 'Falha na autenticação')}`
    );
  }

  // Validate code presence
  if (!code) {
    logger.error('[OAuth Callback]', 'No code provided');
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Código de autenticação não encontrado')}`
    );
  }

  try {
    const supabase = await getSupabaseServerClient();
    
    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (exchangeError) {
      logger.error('[OAuth Callback]', 'Exchange error:', exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Falha ao processar login')}`
      );
    }

    // Get user to determine redirect
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error('[OAuth Callback]', 'No user found after exchange');
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent('Usuário não encontrado')}`
      );
    }

    logger.info('[OAuth Callback]', 'User authenticated:', { id: user.id, email: user.email });

    // Get user's profile to determine redirect
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    // Check user's role for redirect
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('role')
      .eq('profile_id', user.id)
      .single();

    let redirectPath = '/dashboard';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (membership as any)?.role as string | undefined;
    if (role) {
      switch (role) {
        case 'owner':
        case 'super_admin':
          redirectPath = '/super-admin/dashboard';
          break;
        case 'admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'professor':
          redirectPath = '/professor/dashboard';
          break;
        case 'student':
        default:
          redirectPath = '/dashboard';
          break;
      }
    }

    // If no profile exists yet, redirect to onboarding
    if (!profile) {
      redirectPath = '/onboarding';
    }

    logger.info('[OAuth Callback]', 'Redirecting to:', redirectPath);
    return NextResponse.redirect(`${origin}${redirectPath}`);
    
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    logger.error('[OAuth Callback]', 'Unexpected error:', err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}`
    );
  }
}
