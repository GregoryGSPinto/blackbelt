'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Plus,
  Clock,
  Signal,
  User,
  Tag,
  Target,
  ChevronLeft,
  Download,
  Share2,
  Heart,
  CheckCircle2,
  ChevronRight,
  VideoOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';
import * as contentService from '@/lib/api/content.service';
import type { Video } from '@/lib/api/content.service';
import { PremiumPlayer } from '@/components/video/PremiumPlayer';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

/* ─── Objectives mock (enriches Video data) ─── */
/* OBJECTIVES mock — keys reference i18n paths under athlete.sessions.objectivesMock */
const OBJECTIVE_KEYS: Record<string, [string, string, string]> = {
  '1': ['closedGuardPosture', 'distanceHipControl', 'attackAngles'],
  '2': ['toreantoOverUnder', 'hipControlPassing', 'sideControlTransitions'],
  '3': ['omoplataSetup', 'escapeBeforeLock', 'counterFromDefense'],
  '4': ['crossChokeClosedGuard', 'armbarPostureControl', 'attackCombinations'],
  '5': ['halfGuardUnderhook', 'sweepToMount', 'variationsAgainstBases'],
  '6': ['highLowMountPressure', 'balanceUnderBridging', 'submissionTransitions'],
};

function getLevelStyle(level: string) {
  switch (level) {
    case 'Iniciante':
      return { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' };
    case 'Intermediário':
      return { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400' };
    case 'Avançado':
      return { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400' };
    default:
      return { bg: 'bg-white/10', text: 'text-white/60', dot: 'bg-white/40' };
  }
}

export default function AulaDetailPage() {
  const t = useTranslations('athlete');
  const tCommon = useTranslations('common');
  const tVideo = useTranslations('video');
  const { formatNumber } = useFormatting();
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [video, setVideo] = useState<Video | null>(null);
  const [related, setRelated] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [inList, setInList] = useState(false);
  const [liked, setLiked] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPageReady(false);
    setError(null);

    async function load() {
      try {
        const v = await contentService.getVideoById(id);
        if (cancelled) return;
        if (!v) {
          router.replace('/aulas');
          return;
        }
        setVideo(v);
        const rel = await contentService.getRelatedVideos(v);
        if (cancelled) return;
        setRelated(rel);
      } catch (err) {
        if (!cancelled) {
          setError(handleServiceError(err, 'AulaDetalhe'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          requestAnimationFrame(() => requestAnimationFrame(() => setPageReady(true)));
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, router, retryCount]);

  const scrollRelated = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' });
  };

  // ─── Loading skeleton ───
  if (loading) {
    return <PremiumLoader text={t('sessions.loadingSession')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!video) {
    return <PageEmpty icon={VideoOff} title={t('sessions.sessionNotFound')} message={t('sessions.contentUnavailable')} />;
  }


  const level = getLevelStyle(video.level);
  const objectiveKeys = OBJECTIVE_KEYS[video.id];
  const objectives = objectiveKeys
    ? objectiveKeys.map(k => t(`sessions.objectivesMock.${k}`))
    : [
        t('sessions.objectives.technique'),
        t('sessions.objectives.bodyAwareness'),
        t('sessions.objectives.apply'),
      ];

  return (
    <div
      className="min-h-screen transition-all duration-500"
      style={{
        opacity: pageReady ? 1 : 0,
        transform: pageReady ? 'translateY(0)' : 'translateY(12px)',
      }}
    >
      {/* ═══════════════════════════════════════════════════════
          HERO CINEMATOGRÁFICO
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background thumbnail — blurred, zoomed */}
        <div className="absolute inset-0">
          <img
            src={video.thumbnail}
            alt=""
            className="w-full h-full object-cover scale-110 blur-sm"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/40" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-6 pb-16 md:pt-8 md:pb-24">
          {/* Back link */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm mb-8 group/back"
          >
            <ChevronLeft
              size={16}
              className="group-hover/back:-translate-x-0.5 transition-transform"
            />
            {tCommon('actions.goBack')}
          </button>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Left: text content */}
            <div className="flex-1 max-w-2xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${level.bg} ${level.text}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
                  {video.level}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] text-white/50">
                  {video.category}
                </span>
                <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] text-white/40">
                  {video.duration}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5">
                {video.title}
              </h1>

              {/* Description */}
              <p className="text-base md:text-lg text-white/45 leading-relaxed mb-4 max-w-xl">
                {video.description}
              </p>

              {/* Instructor line */}
              <p className="text-sm text-white/30 mb-8">
                {t('sessions.instructorLabel')}:{' '}
                <span className="text-white/60 font-medium">{video.instructor}</span>
                <span className="mx-2 text-white/10">|</span>
                {formatNumber(video.views)} {tVideo('views')}
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#player"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-[15px] transition-all duration-200 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-primary-dark)))',
                    boxShadow: '0 4px 20px rgba(140,98,57,0.3)',
                  }}
                >
                  <Play size={18} fill="white" className="ml-0.5" />
                  {tCommon('actions.watchNow')}
                </a>

                <button
                  onClick={() => setInList(!inList)}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-medium text-sm transition-all duration-200 active:scale-95 border ${
                    inList
                      ? 'bg-white/10 border-white/15 text-white'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08]'
                  }`}
                >
                  {inList ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  {inList ? t('sessions.inList') : tCommon('menu.myList')}
                </button>

                <button
                  onClick={() => setLiked(!liked)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                    liked
                      ? 'bg-red-500/15 border-red-500/20 text-red-400'
                      : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08]'
                  }`}
                  aria-label={tCommon('actions.like')}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                </button>

                <button className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-200">
                  <Share2 size={16} />
                </button>

                <button className="w-11 h-11 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-200">
                  <Download size={16} />
                </button>
              </div>
            </div>

            {/* Right: thumbnail preview (desktop) */}
            <div className="hidden lg:block w-[380px] flex-shrink-0">
              <div
                className="rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(140,98,57,0.05)',
                }}
              >
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* 4K HDR badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span
                      className="px-1.5 py-0.5 text-[9px] font-black rounded"
                      style={{
                        background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                        color: '#1a1a1a',
                      }}
                    >
                      4K
                    </span>
                    <span
                      className="px-1.5 py-0.5 text-[9px] font-black rounded"
                      style={{
                        background: 'linear-gradient(135deg, #c5a44e 0%, #f5e6a3 50%, #c5a44e 100%)',
                        color: '#1a1a1a',
                      }}
                    >
                      HDR
                    </span>
                  </div>
                  <div
                    className="absolute top-3 right-3 px-2 py-0.5 text-[8px] font-bold tracking-widest rounded"
                    style={{
                      background: 'linear-gradient(135deg, rgba(197,164,78,0.9), rgba(245,230,163,0.9))',
                      color: '#1a1a1a',
                    }}
                  >
                    PREMIUM
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          INFO SECTION — Details about the lesson
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
          {/* Left: description + objectives */}
          <div className="lg:col-span-2 space-y-10">
            {/* Full description */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-white/90">{t('sessions.aboutSession')}</h2>
              <p className="text-[15px] text-white/45 leading-[1.8] max-w-2xl">
                {video.description} {t('sessions.extendedDescription')}
              </p>
            </div>

            {/* Objectives */}
            <div>
              <h2 className="text-xl font-bold mb-5 text-white/90">
                {t('sessions.sessionObjectives')}
              </h2>
              <div className="space-y-3">
                {objectives.map((obj, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3.5 px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover-card"
                  >
                    <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Target size={14} className="text-primary-light" />
                    </div>
                    <p className="text-[14px] text-white/55 leading-relaxed">{obj}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: metadata cards */}
          <div className="space-y-4">
            {/* Instructor card */}
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background: 'rgb(var(--color-border) / 0.03)',
                border: '1px solid rgb(var(--color-border) / 0.05)',
              }}
            >
              <div className="flex items-center gap-2 text-white/30 text-xs font-medium uppercase tracking-wider">
                <User size={13} />
                {t('sessions.instructorLabel')}
              </div>
              <p className="text-white font-semibold">{video.instructor}</p>
              <p className="text-xs text-white/30">{t('sessions.instructorExperience')}</p>
            </div>

            {/* Category card */}
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background: 'rgb(var(--color-border) / 0.03)',
                border: '1px solid rgb(var(--color-border) / 0.05)',
              }}
            >
              <div className="flex items-center gap-2 text-white/30 text-xs font-medium uppercase tracking-wider">
                <Tag size={13} />
                {t('sessions.category')}
              </div>
              <p className="text-white font-semibold">{video.category}</p>
            </div>

            {/* Duration card */}
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background: 'rgb(var(--color-border) / 0.03)',
                border: '1px solid rgb(var(--color-border) / 0.05)',
              }}
            >
              <div className="flex items-center gap-2 text-white/30 text-xs font-medium uppercase tracking-wider">
                <Clock size={13} />
                {t('sessions.durationLabel')}
              </div>
              <p className="text-white font-semibold">{video.duration}</p>
            </div>

            {/* Level card */}
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background: 'rgb(var(--color-border) / 0.03)',
                border: '1px solid rgb(var(--color-border) / 0.05)',
              }}
            >
              <div className="flex items-center gap-2 text-white/30 text-xs font-medium uppercase tracking-wider">
                <Signal size={13} />
                {t('sessions.levelLabel')}
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${level.bg} ${level.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
                {video.level}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PLAYER SECTION
          ═══════════════════════════════════════════════════════ */}
      <section id="player" className="max-w-6xl mx-auto px-6 md:px-10 pb-16 md:pb-20">
        <h2 className="text-xl font-bold mb-6 text-white/90">{t('sessions.player')}</h2>
        <PremiumPlayer
          youtubeId={video.youtubeId}
          title={video.title}
          thumbnail={video.thumbnail}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          RELATED LESSONS
          ═══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-10 pb-16 md:pb-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white/90">{t('sessions.relatedSessions')}</h2>
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => scrollRelated('left')}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
              >
                <ChevronLeft size={16} style={{ color: tokens.textMuted }} />
              </button>
              <button
                onClick={() => scrollRelated('right')}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-colors"
              >
                <ChevronRight size={16} style={{ color: tokens.textMuted }} />
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: 'none' }}
          >
            {related.map((r) => {
              const rl = getLevelStyle(r.level);
              return (
                <Link
                  key={r.id}
                  href={`/aulas/${r.id}`}
                  className="flex-shrink-0 w-[280px] group/rcard cursor-pointer"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg">
                    <img
                      src={r.thumbnail}
                      alt={r.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/rcard:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover/rcard:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/rcard:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                        <Play size={18} fill="#000" className="ml-0.5 text-black" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {r.duration}
                    </div>
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold ${rl.bg} ${rl.text}`}
                    >
                      {r.level}
                    </span>
                  </div>
                  {/* Info */}
                  <h3 className="text-sm font-semibold text-white/80 group-hover/rcard:text-white line-clamp-2 leading-snug transition-colors mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-white/30">
                    {r.instructor} · {r.category}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Bottom spacing */}
      <div className="h-8" />
    </div>
  );
}
