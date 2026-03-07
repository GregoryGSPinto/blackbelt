/**
 * Next.js Middleware — Proteção de Rotas (Server-Side)
 *
 * PRINCÍPIO: Fail-open. Se algo der errado, permite acesso e deixa
 * a API route / page lidar com auth. O middleware NUNCA deve crashar.
 *
 * Edge Runtime: Não usar Node.js APIs (fs, crypto.createHash, etc.)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ============================================================
// i18n — LOCALE DETECTION (cookie-based, no URL prefix)
// ============================================================

const SUPPORTED_LOCALES = ['pt-BR', 'en-US'] as const;
const DEFAULT_LOCALE = 'pt-BR';

function detectLocale(request: NextRequest): string {
  // 1. Cookie 'locale' has highest priority
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Accept-Language header
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    // Parse Accept-Language: "en-US,en;q=0.9,pt-BR;q=0.8"
    const preferred = acceptLang
      .split(',')
      .map(part => {
        const [lang, q] = part.trim().split(';q=');
        return { lang: lang.trim(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of preferred) {
      // Exact match
      if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
        return lang;
      }
      // Prefix match (e.g., "en" matches "en-US", "pt" matches "pt-BR")
      const prefix = lang.split('-')[0].toLowerCase();
      const match = SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(prefix));
      if (match) {
        return match;
      }
    }
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

/** Rotas que NÃO requerem autenticação */
const PUBLIC_ROUTES = [
  '/landing',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/alterar-senha',
  '/esqueci-email',
  '/selecionar-perfil',
  '/atleta',
  '/excluir-conta',
  '/politica-privacidade',
  '/termos-de-uso',
  '/_next',
  '/api',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
  '/manifest.json',
];

// ============================================================
// SECURITY HEADERS
// ============================================================

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');

  const isDev = process.env.NODE_ENV === 'development';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    isDev
      ? "connect-src 'self' https: ws: wss:"
      : `connect-src 'self' ${supabaseUrl} https://*.sentry.io https://*.ingest.sentry.io`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join('; '));

  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
}

// ============================================================
// SUPABASE SESSION REFRESH (inline — avoid extra import)
// ============================================================

async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Se env vars não existem, fail-open
  if (!url || !anonKey) {
    return response;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    await supabase.auth.getUser();
  } catch {
    // Fail-open: se Supabase falhar, não crashar o middleware
  }

  return response;
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // ─── i18n: detect locale and propagate ───
    const locale = detectLocale(request);
    request.headers.set('x-locale', locale);

    // ─── CSRF: Verify X-Requested-With for state-changing API requests ───
    const method = request.method;
    if (
      pathname.startsWith('/api/') &&
      ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method) &&
      !pathname.startsWith('/api/webhooks/')
    ) {
      const xRequestedWith = request.headers.get('x-requested-with');
      if (xRequestedWith !== 'XMLHttpRequest') {
        return NextResponse.json({ error: 'Forbidden — missing CSRF header' }, { status: 403 });
      }
    }

    // ─── Rotas públicas: permitir acesso livre ───
    if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
      const response = NextResponse.next({
        request: { headers: request.headers },
      });
      applySecurityHeaders(response);
      if (!request.cookies.get('locale')?.value) {
        response.cookies.set('locale', locale, {
          path: '/',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
      }
      return response;
    }

    // ─── Assets estáticos: permitir sem check ───
    if (pathname.includes('.') || pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // ─── Mock mode: pular verificação de cookie ───
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
    if (isMock) {
      const response = NextResponse.next();
      applySecurityHeaders(response);
      return response;
    }

    // ─── Supabase session refresh ───
    let response = NextResponse.next({
      request: { headers: request.headers },
    });
    response = await refreshSupabaseSession(request, response);

    // ─── i18n: set locale cookie if not present ───
    if (!request.cookies.get('locale')?.value) {
      response.cookies.set('locale', locale, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }

    // ─── Produção: Verificar autenticação via cookie ───
    const hasSupabaseSession = request.cookies.getAll().some(
      c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'),
    );
    const refreshToken = request.cookies.get('blackbelt_refresh')?.value;
    const hasAuth = hasSupabaseSession || Boolean(refreshToken);

    if (!hasAuth) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      applySecurityHeaders(redirectResponse);
      return redirectResponse;
    }

    applySecurityHeaders(response);
    return response;
  } catch {
    // ─── FAIL-OPEN: Middleware NUNCA deve crashar ───
    // Se qualquer coisa falhar, permite acesso e deixa a
    // API route / page handler lidar com auth.
    return NextResponse.next();
  }
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
