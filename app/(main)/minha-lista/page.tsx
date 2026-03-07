'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import * as contentService from '@/lib/api/content.service';
import type { Video } from '@/lib/api/content.service';
import { useTranslations } from 'next-intl';
import { Bookmark, Play, Trash2, Clock, Signal, ListX } from 'lucide-react';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

/**
 * Minha Lista — Vídeos favoritados
 * Dados do usuário (nome, graduação, professor etc.) continuam disponíveis
 * via useAuth() para uso em outras telas.
 */

export default function MinhaListaPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [favorites, setFavorites] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        const data = await contentService.getVideos();
        // Mock: primeiros 6 como favoritos
        setFavorites(data.slice(0, 6));
      } catch (err) {
        setError(handleServiceError(err, 'MeuBlackBelt'));

      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(v => v.id !== id));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-white/5 rounded-xl w-48" />
            <div className="h-4 bg-white/5 rounded-xl w-72" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-56 bg-white/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  return (
    <div className="min-h-screen px-4 md:px-8 tv:px-16 py-8 md:py-12">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Bookmark size={24} className="text-primary-light" />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold" style={{ color: 'rgb(var(--color-text))' }}>
              {t('myList.title')}
            </h1>
          </div>
          <p style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            {t('myList.videoCount', { count: favorites.length })}
          </p>
        </div>

        {/* Empty state */}
        {favorites.length === 0 ? (
          <div className="rounded-2xl p-12 md:p-16 text-center"
            style={{
              background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgb(var(--color-border) / 0.06)',
            }}>
            <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgb(var(--color-border) / 0.06)' }}>
              <ListX size={36} style={{ color: 'rgb(var(--color-text-subtle) / 0.3)' }} />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'rgb(var(--color-text))' }}>
              {t('myList.emptyTitle')}
            </h2>
            <p className="text-sm max-w-sm mx-auto mb-8"
              style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
              {t('myList.emptyDesc')}
            </p>
            <button
              onClick={() => router.push('/aulas')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6B4423, #8C6239)',
                boxShadow: '0 4px 16px rgba(107,68,35,0.3)',
              }}>
              {t('myList.exploreSessions')}
            </button>
          </div>
        ) : (
          /* Video grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {favorites.map(video => (
              <FavoriteCard
                key={video.id}
                video={video}
                onPlay={() => router.push(`/aulas/${video.id}`)}
                onRemove={() => removeFavorite(video.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Favorite video card ─── */
function FavoriteCard({ video, onPlay, onRemove }: {
  video: Video;
  onPlay: () => void;
  onRemove: () => void;
}) {
  const levelColor =
    video.level === 'Iniciante' ? 'text-emerald-400 bg-emerald-500/15' :
    video.level === 'Intermediário' ? 'text-amber-400 bg-amber-500/15' :
    'text-red-400 bg-red-500/15';

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] group hover-card"
      style={{
        background: 'rgb(var(--glass-bg) / var(--glass-alpha))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgb(var(--color-border) / 0.06)',
      }}>
      {/* Thumbnail */}
      <div className="relative aspect-video cursor-pointer" onClick={onPlay}>
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play size={22} fill="#000" className="ml-1 text-black" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[11px] font-semibold text-white">
          {video.duration}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug mb-2 line-clamp-2 cursor-pointer"
          style={{ color: 'rgb(var(--color-text))' }}
          onClick={onPlay}>
          {video.title}
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1 text-[11px]"
            style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            <Clock size={11} /> {video.duration}
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${levelColor}`}>
            <Signal size={10} /> {video.level}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px]"
            style={{ color: 'rgb(var(--color-text-subtle) / var(--text-subtle-alpha))' }}>
            {video.instructor}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: 'rgb(var(--color-border) / 0.05)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgb(var(--color-border) / 0.05)'; }}
            title="Remover da lista"
          >
            <Trash2 size={14} className="text-red-400/50 hover:text-red-400 transition-colors" />
          </button>
        </div>
      </div>
    </div>
  );
}
