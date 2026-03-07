'use client';

import { memo, useRef, useCallback } from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import type { Video } from '@/lib/api/content.service';
import { useVideoPreview } from './VideoHoverPreview';

interface VideoCardEnhancedProps {
  video: Video;
  onClick?: () => void;
  showViews?: boolean;
  showInstructor?: boolean;
}

/**
 * VideoCardEnhanced — Memoized card with hover preview integration (desktop)
 * Mobile: pure card with tap → onClick
 * Desktop: hover → floating preview panel via portal
 */
export const VideoCardEnhanced = memo(function VideoCardEnhanced({
  video,
  onClick,
  showViews = true,
  showInstructor = false,
}: VideoCardEnhancedProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Optional preview context — returns null if no provider wrapping
  const preview = useVideoPreview();

  const isActive = preview?.activeCardId === video.id;

  const handleMouseEnter = useCallback(() => {
    if (!preview || !cardRef.current) return;
    // Desktop only
    if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    preview.show(video, rect, video.id);
  }, [preview, video]);

  const handleMouseLeave = useCallback(() => {
    if (!preview) return;
    preview.hide(video.id);
  }, [preview, video.id]);

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group/card cursor-pointer flex-shrink-0 w-full snap-start"
      style={{
        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1), z-index 0ms',
        transform: isActive ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        zIndex: isActive ? 30 : 1,
        position: 'relative',
      }}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-2" style={{ maxHeight: '10rem', border: '1px solid black' }}>
        {/* Thumbnail */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
          loading="lazy"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />

        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-75 group-hover/card:scale-100">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform group-hover/card:scale-110 transition-transform duration-300">
            <Play size={24} fill="black" className="ml-1 text-black" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 shadow-lg">
          <Clock size={12} />
          {video.duration}
        </div>

        {/* Level Badge */}
        <div
          className={`absolute top-2 left-2 px-2.5 py-1 rounded-md text-xs font-bold shadow-lg ${
            video.level === 'Iniciante'
              ? 'bg-green-500/90'
              : video.level === 'Intermediário'
              ? 'bg-yellow-500/90'
              : 'bg-red-500/90'
          }`}
        >
          {video.level}
        </div>

        {/* 4K HDR + PREMIUM badges (desktop hover) */}
        <div
          className="absolute top-2 right-2 flex flex-col items-end gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
        >
          <div className="flex gap-1">
            <span
              className="px-1 py-0.5 text-[8px] font-black rounded"
              style={{
                background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                color: '#1a1a1a',
                letterSpacing: '0.5px',
              }}
            >
              4K
            </span>
            <span
              className="px-1 py-0.5 text-[8px] font-black rounded"
              style={{
                background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                color: '#1a1a1a',
                letterSpacing: '0.5px',
              }}
            >
              HDR
            </span>
          </div>
          <span
            className="px-1.5 py-0.5 text-[7px] font-bold tracking-widest rounded"
            style={{
              background: 'linear-gradient(135deg, rgba(197,164,78,0.85), rgba(245,230,163,0.85))',
              color: '#1a1a1a',
            }}
          >
            PREMIUM
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-0.5 px-0.5">
        <h3 className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {video.title}
        </h3>

        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          {showInstructor && (
            <>
              <span>{video.instructor}</span>
              <span>•</span>
            </>
          )}
          <span>{video.category}</span>
          {showViews && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye size={12} />
                {video.views}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});
