'use client';

import { AlertTriangle, RefreshCw, Inbox, WifiOff, ShieldX, ServerCrash } from 'lucide-react';
import { logger } from '@/lib/logger';

// ============================================================
// HELPERS
// ============================================================

/** Extrai código HTTP de um erro (ApiError ou genérico) */
export function getHttpStatus(err: unknown): number | null {
  if (!err || typeof err !== 'object') return null;
  const obj = err as Record<string, unknown>;
  if (typeof obj.status === 'number') return obj.status;
  if (typeof obj.statusCode === 'number') return obj.statusCode;
  return null;
}

/** Mensagem amigável por status HTTP */
function friendlyMessage(status: number | null, fallback: string): string {
  switch (status) {
    case 401: return 'Sua sessão expirou. Faça login novamente.';
    case 403: return 'Você não tem permissão para acessar este conteúdo.';
    case 404: return 'O conteúdo solicitado não foi encontrado.';
    case 429: return 'Muitas requisições. Aguarde um momento e tente novamente.';
    case 500:
    case 502:
    case 503: return 'O servidor está temporariamente indisponível. Tente novamente em instantes.';
    default: return fallback;
  }
}

/** Ícone por status HTTP */
function StatusIcon({ status }: { status: number | null }) {
  const cls = 'w-12 h-12 mx-auto mb-4';
  switch (status) {
    case 401: return <ShieldX className={`${cls} text-yellow-400`} />;
    case 403: return <ShieldX className={`${cls} text-orange-400`} />;
    case 500:
    case 502:
    case 503: return <ServerCrash className={`${cls} text-red-400`} />;
    default: return <WifiOff className={`${cls} text-red-400/80`} />;
  }
}

// ============================================================
// COMPONENTES
// ============================================================

/**
 * PageLoading — Spinner centralizado full-height.
 * Réplica exata do padrão existente no projeto.
 */
export function PageLoading({ message = 'Carregando...' }: { message?: string }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <img
        src="/images/logo-blackbelt.png"
        alt="BlackBelt"
        style={{ width: 64, height: 64, marginBottom: '3rem', opacity: 0.9 }}
      />
      <div
        style={{
          width: 200,
          height: 1,
          background: 'rgba(255,255,255,0.15)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '60%',
            background: 'rgba(255,255,255,0.85)',
            animation: 'bar-slide 1.2s ease-in-out infinite',
          }}
        />
      </div>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '1.5rem' }}>
        {message}
      </p>
      <style>{`
        @keyframes bar-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(80%); }
          100% { transform: translateX(240%); }
        }
      `}</style>
    </div>
  );
}

/**
 * PageError — Estado de erro com retry.
 * Usa o mesmo padrão visual das páginas existentes.
 * Trata 401, 403, 500 com mensagens específicas.
 */
export function PageError({
  error,
  onRetry,
  message,
}: {
  error: unknown;
  onRetry?: () => void;
  message?: string;
}) {
  const status = getHttpStatus(error);
  const displayMessage = message || friendlyMessage(
    status,
    error instanceof Error ? error.message : 'Erro ao carregar dados',
  );

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm px-6">
        <StatusIcon status={status} />
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-400/80" />
          <p className="text-white/80 font-medium">
            {status ? `Erro ${status}` : 'Erro'}
          </p>
        </div>
        <p className="text-white/50 text-sm mb-6">{displayMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-sm font-medium rounded-lg transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * PageEmpty — Estado vazio quando dados retornam array vazio.
 * Visual consistente, ícone e mensagem configuráveis.
 */
export function PageEmpty({
  icon: Icon = Inbox,
  title = 'Nenhum dado encontrado',
  message = 'Não há registros para exibir no momento.',
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center max-w-sm px-6">
        <Icon className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <p className="text-white/60 font-medium mb-1">{title}</p>
        <p className="text-white/40 text-sm">{message}</p>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS DE TRATAMENTO DE ERRO PARA SERVICES
// ============================================================

/**
 * Captura erro de service, faz log e retorna mensagem.
 * Uso: catch (err) { setError(handleServiceError(err, 'dashboard')); }
 */
export function handleServiceError(err: unknown, context: string): string {
  const status = getHttpStatus(err);
  const raw = err instanceof Error ? err.message : 'Erro desconhecido';
  logger.error(`[${context}]`, `Erro HTTP ${status ?? '?'}: ${raw}`, err);
  return friendlyMessage(status, raw);
}
