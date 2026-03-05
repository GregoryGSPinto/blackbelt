'use client';

import { AlertTriangle, RefreshCw, Inbox, WifiOff, ShieldX, ServerCrash } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { PremiumLoader } from './PremiumLoader';
import { Button } from '@/components/ui/Button';

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
function StatusIcon({ status, color }: { status: number | null; color: string }) {
  const style = { color };
  const cls = 'w-12 h-12 mx-auto mb-4';
  switch (status) {
    case 401: return <ShieldX className={cls} style={style} />;
    case 403: return <ShieldX className={cls} style={style} />;
    case 500:
    case 502:
    case 503: return <ServerCrash className={cls} style={style} />;
    default: return <WifiOff className={cls} style={style} />;
  }
}

// ============================================================
// COMPONENTES
// ============================================================

/**
 * PageLoading — Spinner centralizado full-height.
 * Réplica exata do padrão existente no projeto.
 */
export function PageLoading({ message }: { message?: string }) {
  return <PremiumLoader text={message || 'Carregando...'} />;
}

/**
 * PageError — Estado de erro com retry.
 * Usa design tokens para visual premium.
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
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const status = getHttpStatus(error);
  const displayMessage = message || friendlyMessage(
    status,
    error instanceof Error ? error.message : 'Erro ao carregar dados',
  );

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div
        className="text-center max-w-sm px-6 py-8 rounded-2xl"
        style={{
          ...tokens.glass,
        }}
      >
        <StatusIcon status={status} color={tokens.error} />
        <div className="flex items-center justify-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4" style={{ color: tokens.error }} />
          <p className="font-medium" style={{ color: tokens.text }}>
            {status ? `Erro ${status}` : 'Erro'}
          </p>
        </div>
        <p className="text-sm mb-6" style={{ color: tokens.textMuted }}>{displayMessage}</p>
        {onRetry && (
          <Button
            variant="secondary"
            size="md"
            onClick={onRetry}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Tentar novamente
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * PageEmpty — Estado vazio quando dados retornam array vazio.
 * Visual consistente com design tokens premium.
 */
export function PageEmpty({
  icon: Icon = Inbox,
  title,
  message,
}: {
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title?: string;
  message?: string;
}) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const defaultTitle = title || 'Nenhum dado encontrado';
  const defaultMessage = message || 'Não há registros para exibir no momento.';
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="text-center max-w-sm px-6">
        <Icon className="w-12 h-12 mx-auto mb-4" style={{ color: tokens.textMuted }} />
        <p className="font-medium mb-1" style={{ color: tokens.text }}>{defaultTitle}</p>
        <p className="text-sm" style={{ color: tokens.textMuted }}>{defaultMessage}</p>
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
