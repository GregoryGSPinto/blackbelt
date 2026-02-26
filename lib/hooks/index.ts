/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  HOOKS — React interface for the Domain Engine                 ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  REGRA ABSOLUTA:                                                ║
 * ║  Componentes React só importam de lib/hooks.                   ║
 * ║  Nunca de lib/domain. Nunca de lib/acl.                        ║
 * ║                                                                 ║
 * ║  Todos os hooks de progressão:                                  ║
 * ║  1. Constroem snapshot UMA vez                                  ║
 * ║  2. Projetam para o ViewModel da tela específica               ║
 * ║  3. Retornam { data, loading, error }                          ║
 * ║                                                                 ║
 * ║  Zero duplicação. Zero recálculo.                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

'use client';

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  SegmentDefinition, SegmentVocabulary, SegmentModuleConfig,
} from '@/lib/domain';

// ════════════════════════════════════════════════════════════════════
// Re-export ViewModels (UI imports ONLY from here)
// ════════════════════════════════════════════════════════════════════

export type {
  StudentProgressVM,
  StudentRequirementVM,
  StudentTimelineEntryVM,
} from '@/lib/application/progression/projectors/student-progress.projector';

export type {
  InstructorProgressVM,
  InstructorAlert,
} from '@/lib/application/progression/projectors/instructor-progress.projector';

export type {
  AdminParticipantRowVM,
  RankingParticipantVM,
  EligibilityVM,
  ProgressNotificationVM,
  DigitalCardVM,
  DashboardProgressCardVM,
} from '@/lib/application/progression/projectors/index';

export type {
  ParticipantDevelopmentSnapshot,
} from '@/lib/application/progression/state/snapshot';

// ════════════════════════════════════════════════════════════════════
// INTERNAL: Shared snapshot fetcher
// ════════════════════════════════════════════════════════════════════

function useSnapshot(participantId?: string) {
  const pid = participantId ?? 'me';
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trigger, setTrigger] = useState(0);
  const refetch = useCallback(() => setTrigger(t => t + 1), []);

  // Subscribe to cache invalidation → auto-refetch when events fire
  useEffect(() => {
    let unsub: (() => void) | undefined;
    import('@/lib/application/events/snapshot-cache').then(mod => {
      unsub = mod.snapshotCache.onChange(pid, () => {
        setTrigger(t => t + 1); // trigger re-fetch
      });
    });
    return () => { unsub?.(); };
  }, [pid]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Use cache: getOrBuild avoids redundant builds
    Promise.all([
      import('@/lib/application/events/snapshot-cache'),
      import('@/lib/application/progression/state/build-snapshot'),
    ]).then(([cacheMod, buildMod]) =>
      cacheMod.snapshotCache.getOrBuild(pid, () =>
        buildMod.buildDevelopmentSnapshot(pid)
      )
    ).then(snapshot => {
      if (!cancelled) { setData(snapshot); setLoading(false); }
    }).catch(err => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar progressão');
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [pid, trigger]);

  return { data, loading, error, refetch };
}

// ════════════════════════════════════════════════════════════════════
// PROGRESSION HOOKS — Each projects the shared snapshot differently
// ════════════════════════════════════════════════════════════════════

/** Tela do aluno — progresso simplificado + motivação */
export function useStudentProgress(participantId?: string) {
  const { data: snapshot, loading, error, refetch } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/student-progress.projector')
      .then(mod => setProjected(mod.projectStudentProgress(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/student-progress.projector').StudentProgressVM | null, loading, error, refetch };
}

/** Ficha do aluno vista pelo professor — detalhes + alertas pedagógicos */
export function useInstructorProgress(participantId: string) {
  const { data: snapshot, loading, error, refetch } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/instructor-progress.projector')
      .then(mod => setProjected(mod.projectInstructorProgress(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/instructor-progress.projector').InstructorProgressVM | null, loading, error, refetch };
}

/** Listagem administrativa — dados tabulares */
export function useAdminParticipantRow(participantId: string) {
  const { data: snapshot, loading, error } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/index')
      .then(mod => setProjected(mod.projectAdminRow(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/index').AdminParticipantRowVM | null, loading, error };
}

/** Mini widget de progresso no dashboard */
export function useDashboardProgressCard(participantId?: string) {
  const { data: snapshot, loading, error } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/index')
      .then(mod => setProjected(mod.projectDashboardCard(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/index').DashboardProgressCardVM | null, loading, error };
}

/** Carteirinha digital — dados de identificação + QR */
export function useDigitalCard(participantId?: string) {
  const { data: snapshot, loading, error } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/index')
      .then(mod => setProjected(mod.projectDigitalCard(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/index').DigitalCardVM | null, loading, error };
}

/** Elegibilidade para eventos — pode participar de evento nível X? */
export function useEventEligibility(participantId?: string) {
  const { data: snapshot, loading, error } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any>(null);

  useEffect(() => {
    if (!snapshot) { setProjected(null); return; }
    import('@/lib/application/progression/projectors/index')
      .then(mod => setProjected(mod.projectEligibility(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/index').EligibilityVM | null, loading, error };
}

/** Notificações automáticas derivadas do progresso */
export function useProgressNotifications(participantId?: string) {
  const { data: snapshot, loading, error } = useSnapshot(participantId);
  const [projected, setProjected] = useState<any[]>([]);

  useEffect(() => {
    if (!snapshot) { setProjected([]); return; }
    import('@/lib/application/progression/projectors/index')
      .then(mod => setProjected(mod.projectNotifications(snapshot)));
  }, [snapshot]);

  return { data: projected as import('@/lib/application/progression/projectors/index').ProgressNotificationVM[], loading, error };
}

/** Snapshot cru — para debug ou instrutor avançado */
export function useRawSnapshot(participantId?: string) {
  return useSnapshot(participantId);
}

// ════════════════════════════════════════════════════════════════════
// BACKWARD COMPAT — mantém o nome antigo funcionando
// ════════════════════════════════════════════════════════════════════

/** @deprecated Use useStudentProgress() */
export const useParticipantProgress = useStudentProgress;

// ════════════════════════════════════════════════════════════════════
// SEGMENT CONTEXT — Vocabulário e módulos do segmento ativo
// ════════════════════════════════════════════════════════════════════

interface SegmentContextValue {
  config: SegmentDefinition;
  t: (key: keyof SegmentVocabulary) => string;
  isEnabled: (module: keyof SegmentModuleConfig) => boolean;
}

const SegmentContext = createContext<SegmentContextValue | null>(null);

export function SegmentProvider({
  children,
  segmentType,
  unitOverrides,
}: {
  children: ReactNode;
  segmentType?: string;
  unitOverrides?: Partial<SegmentDefinition>;
}) {
  const [config, setConfig] = useState<SegmentDefinition | null>(null);

  useEffect(() => {
    import('@/lib/acl/segment-resolver').then(mod => {
      setConfig(mod.resolveSegmentConfig(
        (segmentType as any) ?? 'martial_arts',
        unitOverrides,
      ));
    });
  }, [segmentType, unitOverrides]);

  const value = useMemo<SegmentContextValue | null>(() => {
    if (!config) return null;
    const vocab = config.vocabulary;
    const t = (key: keyof SegmentVocabulary): string => {
      const entry = vocab[key];
      if (typeof entry === 'string') return entry;
      if (!entry) return key;
      return entry.default;
    };
    const isEnabled = (module: keyof SegmentModuleConfig): boolean => {
      const a = config.enabledModules[module];
      return a === 'enabled' ? true : a === 'disabled' ? false : true;
    };
    return { config, t, isEnabled };
  }, [config]);

  if (!value) return null;
  return <SegmentContext.Provider value={value}>{children}</SegmentContext.Provider>;
}

export function useVocabulary() {
  const ctx = useContext(SegmentContext);
  if (!ctx) throw new Error('useVocabulary must be used within SegmentProvider');
  return { t: ctx.t };
}

export function useModules() {
  const ctx = useContext(SegmentContext);
  if (!ctx) throw new Error('useModules must be used within SegmentProvider');
  return { isEnabled: ctx.isEnabled };
}

export function useSegmentConfig(): SegmentDefinition {
  const ctx = useContext(SegmentContext);
  if (!ctx) throw new Error('useSegmentConfig must be used within SegmentProvider');
  return ctx.config;
}
