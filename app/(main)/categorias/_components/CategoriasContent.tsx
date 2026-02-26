'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import type { Video } from '@/lib/api/content.service';

interface CategoriasContentProps {
  videos: Video[];
}

const categorias = [
  { name: 'Guarda', color: 'from-blue-500 to-blue-700', count: '6 vídeos' },
  { name: 'Passagem', color: 'from-green-500 to-green-700', count: '6 vídeos' },
  { name: 'Finalização', color: 'from-red-500 to-red-700', count: '6 vídeos' },
  { name: 'Raspagem', color: 'from-yellow-500 to-yellow-700', count: '6 vídeos' },
  { name: 'Defesa', color: 'from-purple-500 to-purple-700', count: '6 vídeos' },
  { name: 'Montada', color: 'from-pink-500 to-pink-700', count: '6 vídeos' },
];

export default function CategoriasContent({ videos }: CategoriasContentProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredVideos = selectedCategory
    ? videos.filter((v) => v.category === selectedCategory)
    : videos;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-bold mb-4">Categorias</h1>
        <p className="text-lg text-white/40">
          Explore nosso conteúdo por categoria técnica
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {categorias.map((categoria) => (
          <div
            key={categoria.name}
            onClick={() => setSelectedCategory(categoria.name)}
            className="group relative card h-48 cursor-pointer overflow-hidden hover:scale-105 transition-transform"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${categoria.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">{categoria.name}</h3>
              <p className="text-sm opacity-90">{categoria.count}</p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Videos Section */}
      {selectedCategory && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Categoria: {selectedCategory}
            </h2>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-primary hover:underline text-sm"
            >
              Ver todas
            </button>
          </div>
          <VideoCarousel title="">
            {filteredVideos.map((video) => (
              <VideoCardEnhanced
                key={video.id}
                video={video}
                onClick={() => router.push(`/sessões/${video.id}`)}
                showInstructor
              />
            ))}
          </VideoCarousel>
        </div>
      )}

      {!selectedCategory && (
        <VideoCarousel title="Todas as Técnicas">
          {videos.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/sessões/${video.id}`)}
            />
          ))}
        </VideoCarousel>
      )}

      <div className="h-8" />
    </div>
  );
}
