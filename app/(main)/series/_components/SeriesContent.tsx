'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import type { Video, Serie } from '@/lib/api/content.service';

interface SeriesContentProps {
  videos: Video[];
  series: Serie[];
}

export default function SeriesContent({ videos, series }: SeriesContentProps) {
  const t = useTranslations('athlete');
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <div className="space-y-8 px-4 md:px-8">
        {series.map((serie) => (
          <div key={serie.id}>
            <div className="mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{serie.title}</h2>
              <p className="text-white/40">{serie.description}</p>
              <p className="text-sm text-white/35 mt-1">
                {serie.videos.length} vídeos • {serie.totalDuration}
              </p>
            </div>
            <VideoCarousel title="">
              {serie.videos.map((video) => (
                <VideoCardEnhanced
                  key={video.id}
                  video={video}
                  onClick={() => router.push(`/aulas/${video.id}`)}
                  showInstructor
                />
              ))}
            </VideoCarousel>
          </div>
        ))}

        <VideoCarousel title={t('series.allTechniques')}>
          {videos.map((video) => (
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
