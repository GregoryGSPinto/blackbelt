'use client';

import { logger } from '@/lib/logger';
import { useTranslations } from 'next-intl';

/**
 * AlunoActions — Botões interativos de ação financeira
 * Client Component isolado para manter a página pai como Server Component.
 *
 * TODO(FE-020): Conectar handlers financeiros a endpoints:
 *   validarPagamento → apiClient.post('/admin/financeiro/validar', { alunoId })
 *   bloquearAluno    → apiClient.post('/admin/financeiro/bloquear', { alunoId })
 *   desbloquearAluno → apiClient.post('/admin/financeiro/desbloquear', { alunoId })
 */

interface AlunoEmAtrasoActionsProps {
  alunoId: string;
}

export function AlunoEmAtrasoActions({ alunoId }: AlunoEmAtrasoActionsProps) {
  const t = useTranslations('admin');
  const handleValidar = () => {
    // TODO(FE-020): Chamar POST /admin/financeiro/validar
    logger.info('[Financeiro]', `Validar pagamento: ${alunoId}`);
  };

  const handleBloquear = () => {
    // TODO(FE-020): Chamar POST /admin/financeiro/bloquear
    logger.info('[Financeiro]', `Bloquear aluno: ${alunoId}`);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <button
        onClick={handleValidar}
        className="px-2 py-1 sm:px-4 sm:py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
      >
        {t('financial.validatePayment')}
      </button>
      <button
        onClick={handleBloquear}
        className="px-2 py-1 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
      >
        {t('financial.blockAccess')}
      </button>
    </div>
  );
}

interface AlunoBloqueadoActionsProps {
  alunoId: string;
}

export function AlunoBloqueadoActions({ alunoId }: AlunoBloqueadoActionsProps) {
  const t = useTranslations('admin');
  const handleDesbloquear = () => {
    // TODO(FE-020): Chamar POST /admin/financeiro/desbloquear
    logger.info('[Financeiro]', `Desbloquear aluno: ${alunoId}`);
  };

  return (
    <button
      onClick={handleDesbloquear}
      className="px-2 py-1 sm:px-4 sm:py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium whitespace-nowrap"
    >
      {t('financial.unblockActivate')}
    </button>
  );
}
