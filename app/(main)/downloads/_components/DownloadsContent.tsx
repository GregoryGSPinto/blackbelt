'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Trash2, Play, Clock, Signal, CheckCircle, HardDrive } from 'lucide-react';
import * as contentService from '@/lib/api/content.service';
import type { Video } from '@/lib/api/content.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';

interface DownloadItem extends Video {
  downloadStatus: 'available' | 'downloaded' | 'downloading';
  fileSize: string;
}

function addDownloadMeta(videos: Video[]): DownloadItem[] {
  return videos.map((v, i) => ({
    ...v,
    downloadStatus: i < 3 ? 'downloaded' : i === 3 ? 'downloading' : 'available',
    fileSize: `${(Math.random() * 400 + 100).toFixed(0)} MB`,
  }));
}

export default function DownloadsContent() {
  const t = useTranslations('athlete');
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const videos = await contentService.getVideos();
        setItems(addDownloadMeta(videos.slice(0, 10)));
      } catch (err) {
        setError(handleServiceError(err, 'Downloads'));

      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const downloaded = items.filter(i => i.downloadStatus === 'downloaded');
  const available = items.filter(i => i.downloadStatus !== 'downloaded');
  const totalSize = downloaded.reduce((sum, i) => sum + parseInt(i.fileSize), 0);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded-xl w-48" />
          <div className="h-4 bg-white/5 rounded-xl w-72" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  if (items.length === 0) {
    return <PageEmpty title={t('downloads.noDownloads')} message={t('downloads.noDownloadsDesc')} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Storage summary */}
      <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <HardDrive size={22} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'rgb(var(--color-text))' }}>
              {t('downloads.videoCount', { count: downloaded.length })}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
              {t('downloads.storageUsed', { size: totalSize })}
            </p>
          </div>
        </div>
      </div>

      {downloaded.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(var(--color-text))' }}>{t('downloads.downloaded')}</h2>
          <div className="space-y-3">
            {downloaded.map(item => (
              <DownloadRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {available.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(var(--color-text))' }}>{t('downloads.availableForDownload')}</h2>
          <div className="space-y-3">
            {available.map(item => (
              <DownloadRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function DownloadRow({ item }: { item: DownloadItem }) {
  const levelColor =
    item.level === 'Iniciante' ? 'text-emerald-400' :
    item.level === 'Intermediário' ? 'text-amber-400' :
    'text-red-400';

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-dark-elevated/50 rounded-2xl p-4 flex items-center gap-4">
      <div className="relative w-28 h-16 md:w-36 md:h-20 rounded-xl overflow-hidden flex-shrink-0 bg-black/30">
        <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
            <Play size={14} fill="#000" className="ml-0.5 text-black" />
          </div>
        </div>
        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white">
          {item.duration}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: 'rgb(var(--color-text))' }}>
          {item.title}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-[11px]" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
            <Clock size={11} /> {item.duration}
          </span>
          <span className={`flex items-center gap-1 text-[11px] ${levelColor}`}>
            <Signal size={11} /> {item.level}
          </span>
          <span className="text-[11px]" style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }}>
            {item.fileSize}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0">
        {item.downloadStatus === 'downloaded' ? (
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <button className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors">
              <Trash2 size={15} className="text-red-400/60" />
            </button>
          </div>
        ) : item.downloadStatus === 'downloading' ? (
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          </div>
        ) : (
          <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <Download size={16} style={{ color: 'rgb(var(--color-text-body) / var(--text-body-alpha))' }} />
          </button>
        )}
      </div>
    </div>
  );
}
