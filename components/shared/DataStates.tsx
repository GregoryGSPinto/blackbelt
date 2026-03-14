'use client';

import { AlertTriangle, RefreshCw, Inbox, WifiOff, ShieldX, ServerCrash } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
 */
export function PageLoading({ message }: { message?: string }) {
  const t = useTranslations('common.dataStates');
  return <PremiumLoader text={message || t('loadingDefault')} />;
}

/**
 * PageError — Estado de erro com retry.
 * Trata 401, 403, 500 com mensagens específicas via i18n.
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
  const t = useTranslations('common.dataStates');
  const tActions = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const status = getHttpStatus(error);

  const friendlyMsg = (() => {
    switch (status) {
      case 401: return t('error401');
      case 403: return t('error403');
      case 404: return t('error404');
      case 429: return t('error429');
      case 500: case 502: case 503: return t('error5xx');
      default: return error instanceof Error ? error.message : t('errorDefault');
    }
  })();
  const displayMessage = message || friendlyMsg;

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
            {status ? t('errorWithCode', { code: status }) : t('errorPrefix')}
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
            {tActions('tryAgain')}
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

  const t = useTranslations('common.dataStates');
  const defaultTitle = title || t('emptyTitle');
  const defaultMessage = message || t('emptyMessage');
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div
        className="text-center max-w-sm px-8 py-10 rounded-2xl"
        style={{ ...tokens.glass }}
      >
        <div
          className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${tokens.cardBorder}` }}
        >
          <Icon className="w-7 h-7" style={{ color: tokens.textMuted }} />
        </div>
        <p className="font-medium mb-2" style={{ color: tokens.text }}>{defaultTitle}</p>
        <p className="text-sm leading-relaxed" style={{ color: tokens.textMuted }}>{defaultMessage}</p>
      </div>
    </div>
  );
}

// ============================================================
// HELPERS DE TRATAMENTO DE ERRO PARA SERVICES
// ============================================================

/** Mensagem fallback por status HTTP (non-React, para uso em services) */
function friendlyMessage(status: number | null, fallback: string): string {
  switch (status) {
    case 401: return 'Sessão expirada';
    case 403: return 'Sem permissão';
    case 404: return 'Não encontrado';
    case 429: return 'Limite de requisições';
    case 500: case 502: case 503: return 'Servidor indisponível';
    default: return fallback;
  }
}

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
