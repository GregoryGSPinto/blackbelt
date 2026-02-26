import { memo } from 'react';

interface VideoCardProps {
  title: string;
  duration: string;
  thumbnail: string;
  category?: string;
}

/**
 * VideoCard — Componente otimizado para listas
 * 
 * React.memo previne re-renders desnecessários quando props não mudam.
 * Ideal para grids/listas de vídeos.
 */
const VideoCard = memo(function VideoCard({ title, duration, thumbnail, category }: VideoCardProps) {
  return (
    <div className="group relative flex-shrink-0 cursor-pointer">
      <div className="card w-64 h-36 relative overflow-hidden">
        {/* Thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary-light opacity-80" />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Category Badge */}
        {category && (
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
            {category}
          </div>
        )}

        {/* Duration */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold">
          {duration}
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-medium line-clamp-2 px-1">
        {title}
      </h3>
    </div>
  );
});

export default VideoCard;
