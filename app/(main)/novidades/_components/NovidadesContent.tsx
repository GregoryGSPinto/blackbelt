'use client';

import { useRouter } from 'next/navigation';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import type { Video } from '@/lib/api/content.service';

interface NovidadesContentProps {
  videos: Video[];
}

export default function NovidadesContent({ videos }: NovidadesContentProps) {
  const router = useRouter();

  const recentes = videos.slice(0, 4);
  const estaSemana = videos.slice(2);
  const esteMes = [...videos];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-600 to-green-800 flex items-center px-4 md:px-8 mb-8">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Novidades</h1>
          <p className="text-lg text-green-100">
            Conteúdo recém-adicionado e atualizações da plataforma
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 px-4 md:px-8">
        <VideoCarousel title="Adicionado Recentemente">
          {recentes.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/sessões/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title="Esta Semana">
          {estaSemana.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/sessões/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title="Este Mês">
          {esteMes.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/sessões/${video.id}`)}
            />
          ))}
        </VideoCarousel>
      </div>

      <div className="h-8" />
    </div>
  );
}
