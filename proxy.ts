import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

const SUPPORTED_LOCALES = ['pt-BR', 'en-US'] as const;
const DEFAULT_LOCALE = 'pt-BR';

function detectLocale(request: NextRequest): string {
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && (SUPPORTED_LOCALES as readonly string[]).includes(cookieLocale)) {
    return cookieLocale;
  }

  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferred = acceptLang
      .split(',')
      .map(part => {
        const [lang, q] = part.trim().split(';q=');
        return { lang: lang.trim(), q: q ? parseFloat(q) : 1 };
      })
      .sort((a, b) => b.q - a.q);

    for (const { lang } of preferred) {
      if ((SUPPORTED_LOCALES as readonly string[]).includes(lang)) {
        return lang;
      }

      const prefix = lang.split('-')[0].toLowerCase();
      const match = SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(prefix));
      if (match) {
        return match;
      }
    }
  }

  return DEFAULT_LOCALE;
}

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
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
  '/manifest.json',
];

const PUBLIC_API_ROUTES = [
  '/api/health',
  '/api/health/db',
  '/api/health/full',
  '/api/auth/check-email',
  '/api/auth/session',
  '/api/feedback/nps',
  '/api/webhooks/stripe',
];

function applySecurityHeaders(response: NextResponse): void {
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');

  const isDev = process.env.NODE_ENV === 'development';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const csp = [
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
  ]
    .filter(Boolean)
    .join('; ')
    .replace(/\n/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  response.headers.set('Content-Security-Policy', csp);

  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = detectLocale(request);
  request.headers.set('x-locale', locale);

  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

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

  const isPublicPage = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isPublicApi = PUBLIC_API_ROUTES.some(route => pathname.startsWith(route));

  let response = NextResponse.next({
    request: { headers: request.headers },
  });
  response = await updateSupabaseSession(request, response);

  if (!request.cookies.get('locale')?.value) {
    response.cookies.set('locale', locale, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  if (isPublicPage || isPublicApi) {
    applySecurityHeaders(response);
    return response;
  }

  const hasSupabaseSession = request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'),
  );
  const refreshToken = request.cookies.get('blackbelt_refresh')?.value;
  const hasAuth = hasSupabaseSession || Boolean(refreshToken);

  if (!hasAuth) {
    if (pathname.startsWith('/api/')) {
      const denied = NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
      applySecurityHeaders(denied);
      return denied;
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
