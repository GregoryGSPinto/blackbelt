'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
  title: string;
  autoplay?: boolean;
}

export function VideoPlayer({ youtubeId, title, autoplay = false }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);

  // URL segura do YouTube com parâmetros de privacidade
  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?${new URLSearchParams({
    autoplay: isPlaying ? '1' : '0',
    rel: '0', // Não mostrar vídeos relacionados
    modestbranding: '1', // Branding minimalista
    controls: '1', // Mostrar controles
    enablejsapi: '1' // Habilitar API JS
  })}`;

  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

  if (!isPlaying) {
    return (
      <div className="relative w-full aspect-video bg-dark-card rounded-lg overflow-hidden group cursor-pointer">
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay escuro */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors" />
        
        {/* Botão Play */}
        <button
          onClick={() => setIsPlaying(true)}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Reproduzir vídeo"
        >
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play size={32} fill="white" className="ml-1" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-dark-card rounded-lg overflow-hidden">
      <iframe
        src={embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
        loading="lazy"
      />
    </div>
  );
}
