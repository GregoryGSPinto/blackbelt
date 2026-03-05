'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';

export function VerTudoButton() {
  const tCommon = useTranslations('common');
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/historico/detalhes')}
      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}
    >
      {tCommon('actions.seeAll')} <ChevronRight size={14} />
    </button>
  );
}
