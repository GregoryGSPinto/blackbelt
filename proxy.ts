import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getOptionalEnv } from '@/lib/env';
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
  '/',
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
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/sw.js',
  '/manifest.json',
];

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/app',
  '/admin',
  '/professor',
  '/kids',
  '/parent',
  '/teen',
  '/inicio',
  '/minha-evolucao',
  '/aulas',
  '/buscar-academia',
  '/academia',
  '/matricula',
  '/conteudo',
];

// Role-based route mapping
const ROLE_ROUTES: Record<string, string> = {
  student: '/inicio',
  kids: '/kids-inicio',
  teen: '/teen-inicio',
  professor: '/professor-dashboard',
  admin: '/dashboard',
  owner: '/dashboard',
  super_admin: '/super-admin',
  parent: '/painel-responsavel',
};

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
  const supabaseUrl = getOptionalEnv('NEXT_PUBLIC_SUPABASE_URL') || '';
  const connectSources = [
    "'self'",
    isDev ? 'https:' : supabaseUrl,
    isDev ? 'ws:' : null,
    isDev ? 'wss:' : "wss://*.supabase.co",
    'https://*.sentry.io',
    'https://*.ingest.sentry.io',
  ]
    .filter(Boolean)
    .join(' ');

  const cspDirectives = [
    "default-src 'self'",
    isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  const csp = cspDirectives.join('; ');

  response.headers.set('Content-Security-Policy', csp);

  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const locale = detectLocale(request);
  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    route === '/' ? pathname === '/' : pathname.startsWith(route),
  );
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  request.headers.set('x-locale', locale);

  if (isPublicRoute) {
    const publicResponse = NextResponse.next({
      request: { headers: request.headers },
    });

    if (!request.cookies.get('locale')?.value) {
      publicResponse.cookies.set('locale', locale, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    applySecurityHeaders(publicResponse);
    return publicResponse;
  }

  if (searchParams.get('fromMiddleware') === '1') {
    const loopResponse = NextResponse.next({
      request: { headers: request.headers },
    });

    if (!request.cookies.get('locale')?.value) {
      loopResponse.cookies.set('locale', locale, {
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    applySecurityHeaders(loopResponse);
    return loopResponse;
  }

  if (pathname.startsWith('/_next/static') || pathname.startsWith('/_next/image')) {
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

  if (isPublicApi) {
    applySecurityHeaders(response);
    return response;
  }

  if (!isProtected) {
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
    loginUrl.searchParams.set('fromMiddleware', '1');
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
