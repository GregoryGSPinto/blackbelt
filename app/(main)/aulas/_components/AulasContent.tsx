'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Video, RefreshCw } from 'lucide-react';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import { VideoPreviewProvider } from '@/components/video/VideoHoverPreview';
import { Button } from '@/components/ui/Button';
import type { Video as VideoType } from '@/lib/api/content.service';

interface SessõesContentProps {
  videos: VideoType[];
}

export default function SessõesContent({ videos }: SessõesContentProps) {
  const t = useTranslations('athlete');
  const tc = useTranslations('common');
  const router = useRouter();

  const fundamentais = videos.filter((v) => v.level === 'Iniciante');
  const intermediarias = videos.filter((v) => v.level === 'Intermediário');
  const avancadas = videos.filter((v) => v.level === 'Avançado');

  // Estado vazio: nenhum conteúdo disponível
  if (videos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Video className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">
              {tc('empty.noContent')}
            </h2>
            <p className="text-muted-foreground">
              Não foi possível carregar os vídeos no momento. Verifique sua conexão ou tente novamente.
            </p>
          </div>
          <Button 
            onClick={() => router.refresh()} 
            variant="secondary"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

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
