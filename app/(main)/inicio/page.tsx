'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import VideoCarousel from '@/components/ui/VideoCarousel';
import { VideoCardEnhanced } from '@/components/video/VideoCardEnhanced';
import { VideoPreviewProvider } from '@/components/video/VideoHoverPreview';
import * as contentService from '@/lib/api/content.service';
import type { Video } from '@/lib/api/content.service';
import { PageError, PageEmpty } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { useServiceCall } from '@/hooks/useServiceCall';
import { useCachedServiceCall, TTL } from '@/hooks/useCachedServiceCall';
import { CacheIndicator } from '@/components/shared/CacheIndicator';
import * as alunoHomeService from '@/lib/api/aluno-home.service';
import type { AlunoHomeData } from '@/lib/api/aluno-home.service';
import { StudentHomeHeader } from '@/components/aluno/StudentHomeHeader';
import { WelcomeCard } from '@/components/shared/WelcomeCard';
import { AlunoCheckinCard } from '@/components/checkin/AlunoCheckinCard';
import { TurmaNotifications } from '@/components/aluno/TurmaNotifications';
import { PostClassFeedback } from '@/components/shared/PostClassFeedback';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';


/**
 * TrailerPreview — Loads YouTube embed on hover, muted autoplay.
 * Renders above the button. Destroyed when mouse leaves.
 * Desktop-only, never blocks initial render.
 */
function TrailerPreview({ youtubeId, onClose }: { youtubeId: string; onClose: () => void }) {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
      className="absolute bottom-full left-0 mb-3 w-[420px] overflow-hidden shadow-2xl z-50"
      style={{
        background: tokens.cardBg,
        border: '1px solid ' + tokens.cardBorder,
        backdropFilter: 'blur(12px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
        borderRadius: '4px',
        animation: 'trailer-fade-in 200ms cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <div className="relative aspect-video bg-black">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: tokens.textMuted }} />
          </div>
        )}
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${youtubeId}`}
          className="w-full h-full"
          allow="autoplay; encrypted-media"
          allowFullScreen={false}
          onLoad={() => setLoaded(true)}
          style={{ opacity: loaded ? 1 : 0, transition: 'opacity 300ms ease' }}
        />
      </div>
      <div className="px-3 py-2 text-center" style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted }}>
        Previa silenciosa · Passe o mouse para continuar
      </div>
    </div>
  );
}

export default function InicioPage() {
  const router = useRouter();
  const [showTrailer, setShowTrailer] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);
  const trailerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  type ContentData = [Video[], Video[]];
  const { data: result, loading, error, retry, cacheInfo, refreshing, refresh } = useCachedServiceCall<ContentData>(
    'aluno:content',
    () => Promise.all([
      contentService.getVideos(),
      contentService.getTop10(),
    ]),
    { label: 'Inicio', maxRetries: 3, ttl: TTL.STATIC }
  );

  const videos = result?.[0] ?? [];
  const top10 = result?.[1] ?? [];

  // ── Student Dashboard Data (next class, frequency, achievements) ──
  const { data: homeData, loading: homeLoading } = useServiceCall<AlunoHomeData>(
    () => alunoHomeService.getAlunoHomeData(),
    { label: 'AlunoHome', maxRetries: 2 }
  );

  // Trailer hover — desktop only, debounced 500ms
  const handleAssistirEnter = useCallback(() => {
    if (window.matchMedia('(hover: none)').matches || window.innerWidth < 768) return;
    trailerTimer.current = setTimeout(() => setShowTrailer(true), 500);
  }, []);

  const handleAssistirLeave = useCallback(() => {
    if (trailerTimer.current) { clearTimeout(trailerTimer.current); trailerTimer.current = null; }
    // Don't close trailer immediately — TrailerPreview handles its own mouseleave
  }, []);

  const closeTrailer = useCallback(() => setShowTrailer(false), []);

  // Cleanup timers
  useEffect(() => () => {
    if (trailerTimer.current) clearTimeout(trailerTimer.current);
  }, []);

  if (loading) {
    return <PageSkeleton variant="video" />;
  }

  if (error) {
    return <PageError error={error} onRetry={retry} />;
  }
  if (videos.length === 0) {
    return <PageEmpty title="Nenhum conteudo disponivel" message="Novos videos e series serao adicionados em breve." />;
  }


  // Video em destaque (primeiro da lista)
  const featuredVideo = videos[3] || videos[0];
  if (!featuredVideo) return <PageSkeleton variant="detail" />;

  // Videos recentes (todos menos o destaque)
  const recentVideos = videos.filter(v => v.id !== featuredVideo.id);

  // Top 10
  const topWeek = top10.slice(0, 4);

  // Videos avancados
  const advancedVideos = videos.filter(v => v.level === 'Avançado');

  // Ultimos videos
  const latestVideos = [...videos].reverse();

  return (
    <div className="min-h-screen">
      {/* Post-class feedback (obrigatorio se pendente) */}
      {!feedbackDone && <PostClassFeedback onComplete={() => setFeedbackDone(true)} />}
      {/* Cache indicator */}
      <CacheIndicator cacheInfo={cacheInfo} refreshing={refreshing} onRefresh={refresh} className="px-4 md:px-8" />
      {/* ═══════════════════════════════════════════ */}
      {/* HERO — Mobile: texto sobre papel de parede  */}
      {/* ═══════════════════════════════════════════ */}
      <div className="md:hidden relative pt-6 pb-8 px-4 mb-4">
        <div className="max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-3"
            style={{
              background: tokens.cardBg,
              border: '1px solid ' + tokens.cardBorder,
              backdropFilter: 'blur(12px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
              borderRadius: '2px',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            <span style={{ color: tokens.text }}>{featuredVideo.level}</span>
            <span style={{ color: tokens.textMuted }}>•</span>
            <span style={{ color: tokens.text }}>{featuredVideo.category}</span>
          </div>
          <h1 className="text-2xl mb-3 leading-tight" style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{featuredVideo.title}</h1>
          <p className="text-sm mb-2 leading-relaxed line-clamp-2" style={{ fontWeight: 300, color: tokens.text }}>{featuredVideo.description}</p>
          <p className="text-xs mb-5" style={{ color: tokens.textMuted }}>
            {featuredVideo.duration} · {featuredVideo.instructor}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/aulas/${featuredVideo.id}`)}
              className="flex items-center gap-2"
              style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Assistir
            </button>
            <button
              style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }}
            >
              Minha Lista
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* HERO — Desktop: SEM imagem, apenas texto   */}
      {/* ═══════════════════════════════════════════ */}
      <div className="hidden md:block pt-8 tv:pt-12 pb-6 px-8 tv:px-16 mb-8">
        <div className="max-w-3xl">
          {/* Badge de nivel */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4"
            style={{
              background: tokens.cardBg,
              border: '1px solid ' + tokens.cardBorder,
              backdropFilter: 'blur(12px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.2)',
              borderRadius: '2px',
              fontSize: '0.6rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase' as const,
            }}
          >
            <span style={{ color: tokens.text }}>{featuredVideo.level}</span>
            <span style={{ color: tokens.textMuted }}>•</span>
            <span style={{ color: tokens.text }}>{featuredVideo.category}</span>
          </div>

          {/* Titulo */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tv:text-7xl mb-4 leading-tight" style={{ fontWeight: 200, letterSpacing: '-0.02em', color: tokens.text }}>
            {featuredVideo.title}
          </h1>

          {/* Descricao */}
          <p className="text-base tv:text-lg mb-2 leading-relaxed max-w-xl" style={{ fontWeight: 300, color: tokens.textMuted }}>
            {featuredVideo.description}
          </p>

          {/* Duracao + Instrutor */}
          <p className="text-sm mb-8" style={{ color: tokens.textMuted }}>
            Duracao: <span style={{ color: tokens.text, fontWeight: 300 }}>{featuredVideo.duration}</span>
            <span className="mx-2" style={{ color: tokens.divider }}>|</span>
            Instrutor: <span style={{ color: tokens.text, fontWeight: 300 }}>{featuredVideo.instructor}</span>
          </p>

          {/* Botoes */}
          <div className="flex flex-wrap gap-4">
            {/* Assistir — com trailer hover */}
            <div
              className="relative"
              onMouseEnter={handleAssistirEnter}
              onMouseLeave={handleAssistirLeave}
            >
              {/* Trailer Preview (aparece acima do botao) */}
              {showTrailer && (
                <TrailerPreview
                  youtubeId={featuredVideo.youtubeId}
                  onClose={closeTrailer}
                />
              )}
              <button
                onClick={() => router.push(`/aulas/${featuredVideo.id}`)}
                className="flex items-center gap-2 relative z-10"
                style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Assistir
              </button>
            </div>
            <button
              style={{ background: 'transparent', border: '1px solid ' + tokens.cardBorder, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem' }}
            >
              Adicionar a Minha Lista
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* WELCOME CARD — First visit only */}
      {/* ═══════════════════════════════════════════ */}
      <WelcomeCard profileKey="aluno" />

      {/* ═══════════════════════════════════════════ */}
      {/* CHECK-IN CARD — Contextual, 1-tap confirmation */}
      {/* ═══════════════════════════════════════════ */}
      <AlunoCheckinCard />

      {/* ═══════════════════════════════════════════ */}
      {/* TURMA NOTIFICATIONS — Broadcast from professor */}
      {/* ═══════════════════════════════════════════ */}
      <TurmaNotifications />

      {/* ═══════════════════════════════════════════ */}
      {/* STUDENT DASHBOARD — Next class, frequency, achievements */}
      {/* ═══════════════════════════════════════════ */}
      <StudentHomeHeader data={homeData} loading={homeLoading} />

      {/* Carousels — wrapped with hover preview system */}
      <VideoPreviewProvider>
      <div className="space-y-8" data-tour="videos">
        <VideoCarousel title="Recomendado para Voce">
          {recentVideos.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title="Top 10 da Semana">
          {topWeek.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title="Series para Voce">
          {advancedVideos.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
              showInstructor
            />
          ))}
        </VideoCarousel>

        <VideoCarousel title="Novos Videos">
          {latestVideos.map((video) => (
            <VideoCardEnhanced
              key={video.id}
              video={video}
              onClick={() => router.push(`/aulas/${video.id}`)}
            />
          ))}
        </VideoCarousel>
      </div>
      </VideoPreviewProvider>


      {/* Bottom Spacing for Mobile Nav */}
      <div className="h-8" />

      {/* Trailer animation keyframe */}
      <style>{`
        @keyframes trailer-fade-in {
          from { opacity: 0; transform: translateY(6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
