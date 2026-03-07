// ============================================================
// ProfileSwipeIndicator — Profile dots + swipe navigation
// ============================================================
// Shows dot indicators for available profiles and enables
// horizontal swipe to switch between them (mobile only).
//
// Usage: Wrap the main content area in layout files.
//   <ProfileSwipeWrapper>
//     {children}
//   </ProfileSwipeWrapper>
// ============================================================
'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type TipoPerfil, getRedirectForProfile } from '@/contexts/AuthContext';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';

// ── Profile metadata ──

interface ProfileMeta {
  tipo: TipoPerfil;
  label: string;
  color: string;
  emoji: string;
}

const SWIPEABLE_PROFILES: ProfileMeta[] = [
  { tipo: 'ALUNO_ADULTO', label: 'Adulto', color: '#EF4444', emoji: '🥋' },
  { tipo: 'ALUNO_TEEN', label: 'Teen', color: '#3B82F6', emoji: '⚡' },
  { tipo: 'ALUNO_KIDS', label: 'Kids', color: '#F59E0B', emoji: '🌟' },
];

// ── Transition animation keyframes ──

const STYLES = `
  @keyframes swipe-dot-pop {
    0% { transform: scale(1); }
    50% { transform: scale(1.4); }
    100% { transform: scale(1); }
  }
  @keyframes swipe-label-in {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// ── Dots component ──

function ProfileDots({
  profiles,
  activeIndex,
}: {
  profiles: ProfileMeta[];
  activeIndex: number;
}) {
  if (profiles.length <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2 md:hidden">
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      {profiles.map((p, i) => {
        const isActive = i === activeIndex;
        return (
          <div key={p.tipo} className="flex flex-col items-center gap-1">
            <div
              className="rounded-full transition-all duration-300"
              style={{
                width: isActive ? 24 : 8,
                height: 8,
                background: isActive ? p.color : 'rgba(255,255,255,0.15)',
                animation: isActive ? 'swipe-dot-pop 300ms ease' : undefined,
              }}
            />
            {isActive && (
              <span
                className="text-[9px] font-medium tracking-wider uppercase"
                style={{ color: p.color, animation: 'swipe-label-in 200ms ease both' }}
              >
                {p.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main wrapper ──

interface ProfileSwipeWrapperProps {
  children: React.ReactNode;
}

export function ProfileSwipeWrapper({ children }: ProfileSwipeWrapperProps) {
  const { user, availableProfiles, setPerfil } = useAuth();
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);

  // Filter to only swipeable profile types the user has access to
  const swipeableUserProfiles = useMemo(() => {
    const availableTipos = new Set(availableProfiles.map(p => p.tipo));
    return SWIPEABLE_PROFILES.filter(sp => availableTipos.has(sp.tipo));
  }, [availableProfiles]);

  // Current active index
  const activeIndex = useMemo(() => {
    if (!user) return 0;
    return swipeableUserProfiles.findIndex(sp => sp.tipo === user.tipo);
  }, [user, swipeableUserProfiles]);

  // Only enable swipe if user has 2+ swipeable profiles
  const swipeEnabled = swipeableUserProfiles.length >= 2 && activeIndex >= 0;

  const switchToIndex = useCallback((newIndex: number) => {
    if (transitioning || !swipeEnabled) return;
    const targetMeta = swipeableUserProfiles[newIndex];
    if (!targetMeta) return;

    const targetUser = availableProfiles.find(p => p.tipo === targetMeta.tipo);
    if (!targetUser) return;

    setTransitioning(true);
    setPerfil(targetUser);

    // Navigate to the target profile's home
    const route = getRedirectForProfile(targetMeta.tipo);
    router.push(route);

    // Reset transition lock after navigation
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning, swipeEnabled, swipeableUserProfiles, availableProfiles, setPerfil, router]);

  const handleSwipeLeft = useCallback(() => {
    // Swipe left = next profile
    if (activeIndex < swipeableUserProfiles.length - 1) {
      switchToIndex(activeIndex + 1);
    }
  }, [activeIndex, swipeableUserProfiles.length, switchToIndex]);

  const handleSwipeRight = useCallback(() => {
    // Swipe right = previous profile
    if (activeIndex > 0) {
      switchToIndex(activeIndex - 1);
    }
  }, [activeIndex, switchToIndex]);

  const swipeRef = useSwipeNavigation<HTMLDivElement>({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 100,
    minVelocity: 0.3,
    maxVertical: 60,
    disabled: !swipeEnabled || transitioning,
  });

  // Don't render dots for non-swipeable profiles (professor, admin, etc.)
  const showDots = swipeEnabled && activeIndex >= 0;

  return (
    <div ref={swipeRef} className="min-h-0">
      {showDots && (
        <ProfileDots profiles={swipeableUserProfiles} activeIndex={activeIndex} />
      )}
      <div
        style={{
          transition: transitioning ? 'opacity 200ms ease, transform 200ms ease' : undefined,
          opacity: transitioning ? 0.6 : 1,
          transform: transitioning ? 'scale(0.98)' : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
