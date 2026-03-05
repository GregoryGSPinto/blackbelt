'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import { VideoPreviewProvider } from '@/components/video/VideoHoverPreview';
import type { Video } from '@/lib/api/content.service';

interface SessõesContentProps {
  videos: Video[];
}

export default function SessõesContent({ videos }: SessõesContentProps) {
  const t = useTranslations('athlete');
  const router = useRouter();

  const fundamentais = videos.filter((v) => v.level === 'Iniciante');
  const intermediarias = videos.filter((v) => v.level === 'Intermediário');
  const avancadas = videos.filter((v) => v.level === 'Avançado');

  return (
    <div className="min-h-screen">
      <VideoPreviewProvider>
        <div className="space-y-8 px-4 md:px-8">
          {fundamentais.length > 0 && (
            <VideoCarousel title={t('sessions.fundamental')}>
              {fundamentais.map((video) => (
                <VideoCardEnhanced
                  key={video.id}
                  video={video}
                  onClick={() => router.push(`/aulas/${video.id}`)}
                  showInstructor
                />
              ))}
            </VideoCarousel>
          )}

          {intermediarias.length > 0 && (
            <VideoCarousel title={t('sessions.intermediate')}>
              {intermediarias.map((video) => (
                <VideoCardEnhanced
                  key={video.id}
                  video={video}
                  onClick={() => router.push(`/aulas/${video.id}`)}
                  showInstructor
                />
              ))}
            </VideoCarousel>
          )}

          {avancadas.length > 0 && (
            <VideoCarousel title={t('sessions.advanced')}>
              {avancadas.map((video) => (
                <VideoCardEnhanced
                  key={video.id}
                  video={video}
                  onClick={() => router.push(`/aulas/${video.id}`)}
                  showInstructor
                />
              ))}
            </VideoCarousel>
          )}

          <VideoCarousel title={t('sessions.allSessions')}>
            {videos.map((video) => (
              <VideoCardEnhanced
                key={video.id}
                video={video}
                onClick={() => router.push(`/aulas/${video.id}`)}
              />
            ))}
          </VideoCarousel>
        </div>
      </VideoPreviewProvider>

      <div className="h-8" />
    </div>
  );
}
