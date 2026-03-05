'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TeenCard } from '@/components/teen';
import { TEEN_SESSÕES } from '@/lib/api/teen.service';
import type { TeenAula } from '@/lib/api/teen.service';
import { Download, Trash2, Play, Clock, CheckCircle, HardDrive, WifiOff } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { PageError, PageEmpty } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { getDesignTokens } from '@/lib/design-tokens';

/**
 * Teen Downloads — Conteúdo salvo para assistir offline
 * Usa TEEN_SESSÕES como base demonstrativa.
 * TODO(FE-026): Integrar GET /teen/downloads com status de cache local
 */

interface DownloadItem extends TeenAula {
  downloadStatus: 'available' | 'downloaded' | 'downloading';
  fileSize: string;
}

function buildDownloadList(sessões: TeenAula[]): DownloadItem[] {
  return sessões.map((a, i) => ({
    ...a,
    downloadStatus: i < 2 ? 'downloaded' : i === 2 ? 'downloading' : 'available',
    fileSize: `${(Math.random() * 300 + 80).toFixed(0)} MB`,
  }));
}

export default function TeenDownloadsPage() {
  const t = useTranslations('teen.downloads');
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { isDark } = useTheme();

  const tokens = getDesignTokens(isDark);
  useEffect(() => {
    const timer = setTimeout(() => {
      setItems(buildDownloadList(TEEN_SESSÕES));
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [retryCount]);

  const downloaded = items.filter(i => i.downloadStatus === 'downloaded');
  const others = items.filter(i => i.downloadStatus !== 'downloaded');
  const totalSize = downloaded.reduce((sum, i) => sum + parseInt(i.fileSize), 0);

  if (loading) {
    return <PremiumLoader text={t('loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  if (items.length === 0) {
    return <PageEmpty title={t('noDownloads')} message={t('noDownloadsDesc')} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="teen-enter-1">
        <h2 className="text-xl sm:text-2xl font-bold teen-text-heading font-teen">{t('title')}</h2>
        <p className="teen-text-muted text-sm font-teen mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Storage summary */}
      <div className="teen-enter-2">
        <TeenCard>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 teen-accent-icon-ocean">
              <HardDrive size={22} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold font-teen teen-text-heading">
                {t('downloadedCount', { count: downloaded.length })}
              </p>
              <p className="text-xs font-teen teen-text-muted mt-0.5">
                {totalSize} {t('storageUsed')}
              </p>
            </div>
            <div className="flex items-center gap-1.5"
              style={{ color: isDark ? 'rgba(46,204,113,0.7)' : '#27AE60' }}>
              <WifiOff size={14} />
              <span className="text-[11px] font-teen font-semibold">{t('offlineLabel')}</span>
            </div>
          </div>
        </TeenCard>
      </div>

      {/* Downloaded */}
      {downloaded.length > 0 && (
        <div className="teen-enter-3 space-y-3">
          <h3 className="text-base font-bold font-teen teen-text-heading">{t('downloadedTab')}</h3>
          {downloaded.map(item => (
            <DownloadRow key={item.id} item={item} isDark={isDark} />
          ))}
        </div>
      )}

      {/* Available */}
      {others.length > 0 && (
        <div className="teen-enter-4 space-y-3">
          <h3 className="text-base font-bold font-teen teen-text-heading">{t('availableTab')}</h3>
          {others.map(item => (
            <DownloadRow key={item.id} item={item} isDark={isDark} />
          ))}
        </div>
      )}
    </div>
  );
}

function DownloadRow({ item, isDark }: { item: DownloadItem; isDark: boolean }) {
  return (
    <TeenCard>
      <div className="flex items-center gap-3">
        {/* Thumbnail placeholder */}
        <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${isDark ? 'rgba(0,107,143,0.2)' : 'rgba(0,107,143,0.1)'}, ${isDark ? 'rgba(123,104,238,0.15)' : 'rgba(123,104,238,0.07)'})`,
          }}>
          <Play size={18} className={isDark ? 'text-white/60' : 'text-teen-ocean/60'} />
          <div className="absolute bottom-0.5 right-1 px-1 py-px rounded text-[9px] font-bold"
            style={{
              background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
              color: '#FFFFFF',
            }}>
            {item.duracao}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold font-teen teen-text-heading truncate">
            {item.titulo}
          </p>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[11px] teen-text-muted">
              <Clock size={10} /> {item.duracao}
            </span>
            <span className="text-[11px] teen-text-muted">{item.fileSize}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex-shrink-0">
          {item.downloadStatus === 'downloaded' ? (
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-teen-emerald" />
              <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.06)' }}>
                <Trash2 size={14} className="text-red-400/70" />
              </button>
            </div>
          ) : item.downloadStatus === 'downloading' ? (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: isDark ? 'rgba(0,107,143,0.15)' : 'rgba(0,107,143,0.08)' }}>
              <div className="w-4 h-4 border-2 border-teen-ocean/30 border-t-teen-ocean rounded-full animate-spin" />
            </div>
          ) : (
            <button className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}>
              <Download size={15} className="teen-text-muted" />
            </button>
          )}
        </div>
      </div>
    </TeenCard>
  );
}
