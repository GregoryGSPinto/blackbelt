'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import type { Video } from '@/lib/api/content.service';

interface NovidadesContentProps {
  videos: Video[];
}

export default function NovidadesContent({ videos }: NovidadesContentProps) {
  const t = useTranslations('athlete');
  const router = useRouter();

  const recentes = videos.slice(0, 4);
  const estaSemana = videos.slice(2);
  const esteMes = [...videos];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-600 to-green-800 flex items-center px-4 md:px-8 mb-8">
        <div className="max-w-4xl">
          <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-5xl font-bold mb-4">{t('news.title')}</h1>
          <p className="text-lg text-green-100">
            {t('news.subtitle')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8 px-4 md:px-8">
        <VideoCarousel title={t('news.recentlyAdded')}>
          {recentes.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title={t('news.thisWeek')}>
          {estaSemana.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title={t('news.thisMonth')}>
          {esteMes.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
            />
          ))}
        </VideoCarousel>
      </div>

      <div className="h-8" />
    </div>
  );
}
