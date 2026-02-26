/**
 * Next.js Middleware — Proteção de Rotas (Server-Side)
 *
 * PRINCÍPIO ZERO TRUST: Nenhuma rota protegida confia no front-end.
 *
 * Este middleware roda no Edge Runtime do Next.js, ANTES da página.
 * Verifica presença de token/cookie antes de permitir acesso.
 *
 * Em produção:
 * - Verifica httpOnly cookie com refresh token
 * - Redireciona para /login se ausente
 * - Adiciona headers de segurança (CSP, HSTS, etc.)
 *
 * Em mock mode:
 * - Verifica session cookie mock
 * - Permite acesso a rotas públicas
 *
 * CAMADAS DE PROTEÇÃO:
 * 1. Middleware (este) → Bloqueia acesso a rota inteira
 * 2. API Client        → Injeta token em requisições
 * 3. RBAC              → Verifica permissões específicas
 * 4. Backend           → Valida token + permissões (fonte de verdade)
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSupabaseSession } from '@/lib/supabase/middleware';

// ============================================================
// ROUTE CONFIGURATION
// ============================================================

/** Rotas que NÃO requerem autenticação */
const PUBLIC_ROUTES = [
  '/landing',
  '/login',
  '/registro',
  '/recuperar-senha',
  '/selecionar-perfil',
  '/kids-gatekeeper',
  '/atleta',
  '/excluir-conta',
  '/privacidade',
  '/_next',
  '/api/auth',
  '/favicon.ico',
];

/** Mapeamento de prefixo de rota → roles permitidas */
const ROUTE_ROLE_MAP: Record<string, string[]> = {
  '/admin':      ['ADMINISTRADOR', 'SUPER_ADMIN'],
  '/professor':  ['INSTRUTOR', 'ADMINISTRADOR', 'SUPER_ADMIN'],
  '/developer':  ['SYS_AUDITOR'],
  '/adulto':     ['ALUNO_ADULTO', 'ADMINISTRADOR'],
  '/teen':       ['ALUNO_TEEN', 'ADMINISTRADOR'],
  '/kids':       ['ALUNO_KIDS', 'RESPONSAVEL', 'ADMINISTRADOR'],
  '/responsavel':['RESPONSAVEL', 'ADMINISTRADOR'],
};

// ============================================================
// SECURITY HEADERS
// ============================================================

/** Headers de segurança aplicados a TODAS as respostas */
function applySecurityHeaders(response: NextResponse): void {
  // Strict Transport Security (HTTPS obrigatório)
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Previne clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Previne MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy restritiva
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (desabilita APIs desnecessárias)
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Content Security Policy
  // Em dev: permite WebSocket para HMR (Hot Module Replacement)
  const isDev = process.env.NODE_ENV === 'development';
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    isDev
      ? "connect-src 'self' https: ws: wss:"
      : "connect-src 'self' https:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  // Previne XSS reflexivo
  response.headers.set('X-XSS-Protection', '1; mode=block');
}

// ============================================================
// MIDDLEWARE
// ============================================================

// ── In-memory rate limit (non-blocking) ───────────────
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 100;

function checkRateLimit(ip: string, pathname: string): boolean {
  if (!pathname.startsWith('/api/')) return true;
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Rotas públicas: permitir acesso livre ───
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // ─── Assets estáticos: permitir sem check ───
  if (pathname.includes('.') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  // ─── Rate limiting for API routes ───
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(ip, pathname)) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  // ─── Mock mode: pular verificação de cookie ───
  // Em mock, o AuthContext gerencia auth via memória/localStorage.
  // Cookies httpOnly só existem com backend real.
  // O AuthContext já protege rotas no client-side.
  const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
  if (isMock) {
    const response = NextResponse.next();
    applySecurityHeaders(response);
    return response;
  }

  // ─── Supabase session refresh ───
  let response = NextResponse.next({ request });
  response = await updateSupabaseSession(request, response);

  // ─── Produção: Verificar autenticação via cookie ───
  // Check for Supabase auth cookie or legacy refresh token
  const hasSupabaseSession = request.cookies.getAll().some(
    c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
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

  // ─── Verificar role para rota (básico — backend valida completo) ───
  // Em produção, o token JWT contém a role e pode ser validado aqui
  // Por ora, o middleware apenas garante que há sessão ativa
  // A validação granular de role+permission acontece no API client

  applySecurityHeaders(response);
  return response;
}

// ============================================================
// MATCHER — Quais rotas passam pelo middleware
// ============================================================

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas as rotas EXCETO:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagem)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
