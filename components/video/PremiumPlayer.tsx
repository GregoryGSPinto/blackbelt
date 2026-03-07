'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  Volume2,
  VolumeX,
  Gauge,
} from 'lucide-react';

interface PremiumPlayerProps {
  youtubeId: string;
  title: string;
  thumbnail?: string;
}

/**
 * PremiumPlayer — Cinematic YouTube wrapper with custom overlay controls
 *
 * Strategy: We embed YouTube with controls=0 and overlay our own UI.
 * Since YouTube iframe API has cross-origin limits, we use a hybrid:
 * - Thumbnail + custom play button initially
 * - On play: load iframe with autoplay, minimal YouTube chrome
 * - Overlay fades on inactivity, shows on mouse move
 */
export function PremiumPlayer({ youtubeId, title, thumbnail }: PremiumPlayerProps) {
  const t = useTranslations('video');
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showRateMenu, setShowRateMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const thumbUrl = thumbnail || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?${new URLSearchParams({
    autoplay: '1',
    rel: '0',
    modestbranding: '1',
    controls: '0',
    showinfo: '0',
    iv_load_policy: '3',
    enablejsapi: '1',
    mute: isMuted ? '1' : '0',
  })}`;

  // Auto-hide controls after 3s of inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (isPlaying) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    resetHideTimer();
  }, [resetHideTimer]);

  const handleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  }, []);

  const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  // ─── Pre-play: cinematic thumbnail ───
  if (!isPlaying) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-pointer group/player"
        onClick={handlePlay}
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
        }}
      >
        {/* Thumbnail with slow zoom */}
        <img
          src={thumbUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-[8000ms] ease-out group-hover/player:scale-105"
        />

        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30" />

        {/* Center play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 group-hover/player:scale-110"
            style={{
              background: 'rgba(255,255,255,0.12)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <Play size={36} fill="white" className="ml-1.5 text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
          <div>
            <p className="text-white/40 text-xs font-medium tracking-wider uppercase mb-1">
              {t('play')}
            </p>
            <p className="text-white text-lg font-semibold line-clamp-1">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 text-[9px] font-medium rounded"
              style={{
                background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                color: '#1a1a1a',
              }}
            >
              4K
            </span>
            <span
              className="px-2 py-0.5 text-[9px] font-medium rounded"
              style={{
                background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                color: '#1a1a1a',
              }}
            >
              HDR
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ─── Playing: iframe + custom overlay ───
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video rounded-2xl overflow-hidden"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* YouTube iframe */}
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        onLoad={() => setIframeLoaded(true)}
        style={{ opacity: iframeLoaded ? 1 : 0, transition: 'opacity 400ms ease' }}
      />

      {/* Loading state */}
      {!iframeLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="flex flex-col items-center gap-3">
            <div className="w-32 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
              <div
                className="absolute inset-0 h-full w-1/2 bg-white/60 rounded-full"
                style={{ animation: 'player-bar-slide 1.2s ease-in-out infinite' }}
              />
            </div>
            <p className="text-white/30 text-sm">{t('loading')}</p>
          </div>
          <style>{`
            @keyframes player-bar-slide {
              0% { transform: translateX(-100%); }
              50% { transform: translateX(100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </div>
      )}

      {/* Custom overlay controls — fade on inactivity */}
      <div
        className="absolute inset-0 flex flex-col justify-end transition-opacity duration-300 pointer-events-none"
        style={{ opacity: showControls ? 1 : 0 }}
      >
        {/* Bottom gradient */}
        <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent pt-20 pb-5 px-6 pointer-events-auto">
          {/* Simulated progress bar */}
          <div className="w-full h-1 bg-white/10 rounded-full mb-4 cursor-pointer group/bar">
            <div
              className="h-full bg-white rounded-full relative group-hover/bar:h-1.5 transition-all"
              style={{ width: '0%' }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/bar:opacity-100 transition-opacity shadow-lg" />
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('pause')}
              >
                <Pause size={20} className="text-white" />
              </button>

              {/* -10s */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('rewind')}
              >
                <RotateCcw size={17} className="text-white/70" />
              </button>

              {/* +10s */}
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('forward')}
              >
                <RotateCw size={17} className="text-white/70" />
              </button>

              {/* Volume */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={isMuted ? t('unmute') : t('mute')}
              >
                {isMuted ? (
                  <VolumeX size={17} className="text-white/70" />
                ) : (
                  <Volume2 size={17} className="text-white/70" />
                )}
              </button>

              {/* Timestamp placeholder */}
              <span className="text-xs text-white/40 font-mono ml-2">
                0:00 / --:--
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed */}
              <div className="relative">
                <button
                  onClick={() => setShowRateMenu(!showRateMenu)}
                  className="h-9 px-3 flex items-center gap-1.5 rounded-full hover:bg-white/10 transition-colors text-xs text-white/60 font-medium"
                >
                  <Gauge size={14} />
                  {playbackRate}×
                </button>
                {showRateMenu && (
                  <div
                    className="absolute bottom-full right-0 mb-2 rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      background: 'rgb(var(--glass-bg) / 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    {rates.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setPlaybackRate(r);
                          setShowRateMenu(false);
                        }}
                        className={`block w-full px-5 py-2.5 text-sm text-left transition-colors ${
                          r === playbackRate
                            ? 'text-white bg-white/10'
                            : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {r}×
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={handleFullscreen}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                aria-label={t('fullscreen')}
              >
                <Maximize size={18} className="text-white/70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
