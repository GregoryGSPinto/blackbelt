// ============================================================
// CacheIndicator — Subtle cache age indicator
// ============================================================
// Shows "Atualizado agora" / "Atualizado há 2min" + refresh btn
// Appears at the bottom of cards or sections.
// ============================================================
'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import type { CacheInfo } from '@/hooks/useCachedServiceCall';

interface CacheIndicatorProps {
  cacheInfo: CacheInfo | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  className?: string;
}

export function CacheIndicator({ cacheInfo, refreshing, onRefresh, className = '' }: CacheIndicatorProps) {
  const t = useTranslations('common.cache');
  if (!cacheInfo) return null;

  return (
    <div className={`flex items-center justify-end gap-2 text-[10px] text-white/20 ${className}`}>
      <span>
        {t('updated', { age: cacheInfo.ageLabel })}
        {cacheInfo.fromCache && cacheInfo.ageMs > 60_000 && (
          <span className="text-white/10"> · cache</span>
        )}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1 rounded hover:bg-white/[0.06] transition-colors disabled:opacity-30"
          title={t('refreshData')}
        >
          <RefreshCw
            size={10}
            className={refreshing ? 'animate-spin text-white/30' : 'text-white/20'}
          />
        </button>
      )}
    </div>
  );
}
