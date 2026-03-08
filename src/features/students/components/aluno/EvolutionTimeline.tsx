// ============================================================
// EvolutionTimeline — Vertical Timeline of Student Evolution
// ============================================================
// Events: graduation, medal, attendance milestone, achievement.
// Compact vertical design with animated entrances.
// Data from: graduacao.service + ranking.service + mock achievements.
// ============================================================
'use client';

import { useMemo } from 'react';
import { Award, Trophy, Target, Star, Calendar } from 'lucide-react';
import { useFormatting } from '@/hooks/useFormatting';

// ── Types ──
export type TimelineEventType = 'graduation' | 'medal' | 'milestone' | 'achievement' | 'subnivel';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string; // ISO
  emoji?: string;
  /** Belt color for graduation events */
  nivelCor?: string;
}

const TIMELINE_STYLES = `
  @keyframes tl-item-in {
    from { opacity: 0; transform: translateX(-12px); }
    to { opacity: 1; transform: translateX(0); }
  }
`;

// ── Belt color mapping ──
const NIVEL_COLORS: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB',
  'Nível Cinza': '#9CA3AF',
  'Nível Amarelo': '#EAB308',
  'Nível Básico': '#3B82F6',
  'Nível Intermediário': '#8B5CF6',
  'Nível Avançado': '#92400E',
  'Nível Máximo': '#1F2937',
  'Nível Vermelho': '#EF4444',
};

// ── Icon by type ──
function EventIcon({ type, emoji, nivel }: { type: TimelineEventType; emoji?: string; nivel?: string }) {
  if (emoji) {
    return <span className="text-lg leading-none">{emoji}</span>;
  }

  const nivelColor = nivel ? NIVEL_COLORS[nivel] : undefined;

  switch (type) {
    case 'graduation':
      return nivelColor
        ? <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: nivelColor, background: `${nivelColor}40` }} />
        : <Award size={16} className="text-yellow-400" />;
    case 'subnivel':
      return <Star size={16} className="text-amber-400" />;
    case 'medal':
      return <Trophy size={16} className="text-purple-400" />;
    case 'milestone':
      return <Target size={16} className="text-emerald-400" />;
    case 'achievement':
      return <Award size={16} className="text-blue-400" />;
    default:
      return <Calendar size={16} className="text-white/40" />;
  }
}

// ── Type accent color ──
function typeAccent(type: TimelineEventType): string {
  switch (type) {
    case 'graduation': return 'rgba(234, 179, 8, 0.15)';
    case 'subnivel': return 'rgba(245, 158, 11, 0.12)';
    case 'medal': return 'rgba(168, 85, 247, 0.12)';
    case 'milestone': return 'rgba(16, 185, 129, 0.12)';
    case 'achievement': return 'rgba(59, 130, 246, 0.12)';
    default: return 'rgba(255,255,255,0.04)';
  }
}

function typeLine(type: TimelineEventType): string {
  switch (type) {
    case 'graduation': return 'bg-yellow-500/40';
    case 'subnivel': return 'bg-amber-500/30';
    case 'medal': return 'bg-purple-500/30';
    case 'milestone': return 'bg-emerald-500/30';
    case 'achievement': return 'bg-blue-500/30';
    default: return 'bg-white/10';
  }
}

// ══════════════════════════════════════════════════════════════
// Timeline Item
// ══════════════════════════════════════════════════════════════

function TimelineItem({ event, index, isLast }: { event: TimelineEvent; index: number; isLast: boolean }) {
  const { formatDate } = useFormatting();
  const dateStr = formatDate(event.date);

  return (
    <div
      className="flex gap-3 relative"
      style={{ animation: `tl-item-in 400ms cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms both` }}
    >
      {/* Dot + Line */}
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10"
          style={{ background: typeAccent(event.type), border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <EventIcon type={event.type} emoji={event.emoji} nivel={event.nivelCor} />
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[24px] ${typeLine(event.type)}`} />
        )}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">{event.title}</p>
        {event.description && (
          <p className="text-white/35 text-xs mt-0.5 leading-relaxed">{event.description}</p>
        )}
        <p className="text-white/20 text-[10px] mt-1">{dateStr}</p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════

interface EvolutionTimelineProps {
  events: TimelineEvent[];
  /** Max items to show initially */
  maxItems?: number;
  /** Title override */
  title?: string;
}

export function EvolutionTimeline({
  events,
  maxItems = 10,
  title = 'Linha do Tempo',
}: EvolutionTimelineProps) {
  // Sort by date descending (most recent first)
  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, maxItems),
    [events, maxItems]
  );

  if (sorted.length === 0) {
    return (
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-white/30 text-sm">Nenhum evento registrado ainda</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <style dangerouslySetInnerHTML={{ __html: TIMELINE_STYLES }} />

      <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-5">
        <Calendar size={15} className="text-blue-400/70" />
        {title}
      </h3>

      <div>
        {sorted.map((event, i) => (
          <TimelineItem
            key={event.id}
            event={event}
            index={i}
            isLast={i === sorted.length - 1}
          />
        ))}
      </div>

      {events.length > maxItems && (
        <p className="text-white/20 text-xs text-center mt-2">
          +{events.length - maxItems} eventos anteriores
        </p>
      )}
    </div>
  );
}
