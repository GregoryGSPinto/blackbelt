// ============================================================
// SkeletonLoader — Global Skeleton Screen System
// ============================================================
// Base primitives + page-specific layouts for consistent
// loading states across the entire BlackBelt platform.
//
// Usage:
//   <PageSkeleton variant="dashboard" />
//   <PageSkeleton variant="instrutor" />
//   <PageSkeleton variant="video" />
//   <PageSkeleton variant="parent" />
//
// Or use primitives directly:
//   <Bone w="w-32" h="h-4" />
//   <SkeletonCard />
// ============================================================
'use client';

import { useMemo } from 'react';

// ── CSS for shimmer effect ──
const SKELETON_STYLES = `
  @keyframes skeleton-shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .skeleton-bone {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 0%,
      rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.04) 80%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.8s ease-in-out infinite;
    border-radius: 8px;
  }
  @media (prefers-reduced-motion: reduce) {
    .skeleton-bone {
      animation: none;
      background: rgba(255,255,255,0.06);
    }
  }
`;

// ══════════════════════════════════════════════════════════════
// BASE PRIMITIVES
// ══════════════════════════════════════════════════════════════

/** Basic skeleton bone — a shimmering rectangle */
export function Bone({
  w = 'w-full',
  h = 'h-4',
  rounded = 'rounded-lg',
  className = '',
}: {
  w?: string;
  h?: string;
  rounded?: string;
  className?: string;
}) {
  return <div className={`skeleton-bone ${w} ${h} ${rounded} ${className}`} />;
}

/** Circle bone for avatars */
export function BoneCircle({ size = 'w-12 h-12' }: { size?: string }) {
  return <div className={`skeleton-bone ${size} rounded-full flex-shrink-0`} />;
}

/** Skeleton stat card */
export function SkeletonStatCard() {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex items-start justify-between">
        <Bone w="w-10" h="h-10" rounded="rounded-xl" />
      </div>
      <Bone w="w-16" h="h-8" />
      <Bone w="w-20" h="h-3" />
    </div>
  );
}

/** Skeleton list row */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-3">
      <BoneCircle size="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Bone w="w-32" h="h-4" />
        <Bone w="w-20" h="h-3" />
      </div>
      <Bone w="w-8" h="h-8" rounded="rounded-full" />
    </div>
  );
}

/** Skeleton card (generic glassmorphism card) */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-3">
      <Bone w="w-2/5" h="h-5" />
      {Array.from({ length: lines }).map((_, i) => (
        <Bone key={i} w={i === lines - 1 ? 'w-3/5' : 'w-full'} h="h-3" />
      ))}
    </div>
  );
}

/** Skeleton video card */
export function SkeletonVideoCard() {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px]">
      <Bone w="w-full" h="h-40" rounded="rounded-xl" />
      <div className="mt-3 space-y-2">
        <Bone w="w-4/5" h="h-4" />
        <Bone w="w-2/5" h="h-3" />
      </div>
    </div>
  );
}

/** Skeleton section header */
export function SkeletonSectionHeader() {
  return (
    <div className="flex items-center justify-between mb-4">
      <Bone w="w-36" h="h-6" />
      <Bone w="w-16" h="h-4" />
    </div>
  );
}

/** Skeleton chart area */
export function SkeletonChart({ height = 'h-48' }: { height?: string }) {
  const barHeights = [40, 65, 50, 80, 55, 70, 45, 75];
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
      <Bone w="w-40" h="h-5" className="mb-4" />
      <div className={`${height} flex items-end gap-2 px-4`}>
        {barHeights.map((pct, i) => (
          <div key={i} className="flex-1 flex items-end h-full">
            <div className="skeleton-bone w-full rounded-t-md" style={{ height: `${pct}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE-SPECIFIC SKELETONS
// ══════════════════════════════════════════════════════════════

/** Admin Dashboard skeleton */
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Bone w="w-56" h="h-7" />
          <Bone w="w-40" h="h-4" />
        </div>
        <Bone w="w-32" h="h-4" />
      </div>

      {/* Alert banner */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-5">
        <div className="flex items-start gap-4">
          <Bone w="w-12" h="h-12" rounded="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Bone w="w-48" h="h-5" />
            <Bone w="w-32" h="h-3" />
            <Bone w="w-36" h="h-9" rounded="rounded-lg" className="mt-3" />
          </div>
        </div>
      </div>

      {/* Critical Status Grid */}
      <div>
        <SkeletonSectionHeader />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <SkeletonSectionHeader />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
      </div>

      {/* Chart */}
      <SkeletonChart />
    </div>
  );
}

/** Instrutor Dashboard skeleton */
function InstrutorSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Hero Greeting */}
      <section className="pt-6 md:pt-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-3">
            <Bone w="w-20" h="h-3" />
            <Bone w="w-48" h="h-9" />
            <Bone w="w-64" h="h-4" className="mt-2" />
          </div>
          <Bone w="w-40" h="h-10" rounded="rounded-xl" />
        </div>
        <div className="h-px bg-white/[0.06] mt-7" />
      </section>

      {/* Stats Grid (2x2 mobile, 4 cols desktop) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </section>

      {/* Pedagogical Analysis */}
      <section className="space-y-4">
        <SkeletonSectionHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonChart height="h-40" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="space-y-4">
        <SkeletonSectionHeader />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Video / Streaming home skeleton */
function VideoSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Hero (mobile) */}
      <div className="md:hidden pt-6 pb-8 px-4 mb-4 space-y-3">
        <Bone w="w-28" h="h-6" rounded="rounded-full" />
        <Bone w="w-full" h="h-8" />
        <Bone w="w-4/5" h="h-4" />
        <Bone w="w-32" h="h-3" />
        <div className="flex gap-3 mt-4">
          <Bone w="w-28" h="h-10" rounded="rounded-lg" />
          <Bone w="w-28" h="h-10" rounded="rounded-lg" />
        </div>
      </div>

      {/* Hero (desktop) */}
      <div className="hidden md:block pt-8 pb-6 px-8 mb-8 space-y-4">
        <Bone w="w-28" h="h-6" rounded="rounded-full" />
        <Bone w="w-[500px]" h="h-12" />
        <Bone w="w-[400px]" h="h-5" />
        <Bone w="w-48" h="h-4" />
        <div className="flex gap-4 mt-6">
          <Bone w="w-36" h="h-12" rounded="rounded-xl" />
          <Bone w="w-36" h="h-12" rounded="rounded-xl" />
        </div>
      </div>

      {/* Video Carousels (3 rows) */}
      {Array.from({ length: 3 }).map((_, row) => (
        <section key={row} className="mb-8 px-4 md:px-8">
          <SkeletonSectionHeader />
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonVideoCard key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Parent panel skeleton */
function ParentSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Bone w="w-52" h="h-8" />
        <Bone w="w-64" h="h-5" />
      </div>

      {/* Child Card */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <BoneCircle size="w-16 h-16" />
            <div className="space-y-2">
              <Bone w="w-36" h="h-6" />
              <Bone w="w-28" h="h-4" />
            </div>
          </div>
          <Bone w="w-8" h="h-8" rounded="rounded-full" />
        </div>

        {/* Info rows */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Bone w="w-20" h="h-4" />
              <Bone w="w-28" h="h-4" />
            </div>
          ))}
        </div>

        {/* Frequency bar */}
        <div className="space-y-2">
          <Bone w="w-32" h="h-4" />
          <Bone w="w-full" h="h-3" rounded="rounded-full" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* Action Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} lines={1} />
        ))}
      </div>
    </div>
  );
}

/** Generic list skeleton */
function ListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Bone w="w-48" h="h-7" />
        <Bone w="w-32" h="h-4" />
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl divide-y divide-white/[0.06]">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

/** Generic detail page skeleton */
function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <BoneCircle size="w-20 h-20" />
        <div className="space-y-2 flex-1">
          <Bone w="w-48" h="h-7" />
          <Bone w="w-32" h="h-4" />
          <Bone w="w-24" h="h-3" />
        </div>
      </div>
      <div className="h-px bg-white/[0.06]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={4} />
      </div>
      <SkeletonChart />
    </div>
  );
}

/** Grid skeleton (for pages like turmas, eventos, etc) */
function GridSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Bone w="w-48" h="h-7" />
        <Bone w="w-28" h="h-9" rounded="rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PAGE SKELETON — Main Export
// ══════════════════════════════════════════════════════════════

export type SkeletonVariant =
  | 'dashboard'
  | 'instrutor'
  | 'video'
  | 'parent'
  | 'list'
  | 'detail'
  | 'grid';

const VARIANT_MAP: Record<SkeletonVariant, () => JSX.Element> = {
  dashboard: DashboardSkeleton,
  instrutor: InstrutorSkeleton,
  video: VideoSkeleton,
  parent: ParentSkeleton,
  list: ListSkeleton,
  detail: DetailSkeleton,
  grid: GridSkeleton,
};

/**
 * PageSkeleton — Drop-in loading state that mirrors page layout.
 *
 * @example
 * if (loading) return <PageSkeleton variant="dashboard" />;
 */
export function PageSkeleton({
  variant = 'dashboard',
  className = '',
}: {
  variant?: SkeletonVariant;
  className?: string;
}) {
  const Component = useMemo(() => VARIANT_MAP[variant], [variant]);

  return (
    <div className={`animate-pulse ${className}`} role="status" aria-label="Carregando conteúdo">
      <style dangerouslySetInnerHTML={{ __html: SKELETON_STYLES }} />
      <Component />
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
