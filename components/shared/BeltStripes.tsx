'use client';

/**
 * BeltStripes — Visual representation of BlackBelt belt with stripes (subniveis).
 *
 * Renders a colored bar representing the belt with up to 4 white stripes.
 * Used in: graduation pages, athlete profile, digital membership card.
 */

const NIVEL_HEX: Record<string, string> = {
  'Nível Iniciante': '#E5E7EB',
  'Nível Cinza': '#9CA3AF',
  'Nível Amarelo': '#EAB308',
  'Nível Laranja': '#F97316',
  'Nível Verde': '#22C55E',
  'Nível Básico': '#3B82F6',
  'Nível Intermediário': '#8B5CF6',
  'Nível Avançado': '#92400E',
  'Nível Máximo': '#1F2937',
};

interface BeltStripesProps {
  nivel: string;
  subniveis: number; // 0-4
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLabel?: boolean;
}

export function BeltStripes({ nivel, subniveis, size = 'md', className = '', showLabel = false }: BeltStripesProps) {
  const color = NIVEL_HEX[nivel] || '#E5E7EB';
  const isDark = ['Nível Máximo', 'Nível Avançado', 'Nível Intermediário', 'Nível Básico'].includes(nivel);
  const stripeColor = nivel === 'Nível Máximo' ? '#DC2626' : '#FFFFFF';

  const dims = {
    sm: { h: 'h-3', w: 'w-16', stripe: 'w-[2px] h-2', gap: 'gap-[2px]', text: 'text-[8px]' },
    md: { h: 'h-4', w: 'w-24', stripe: 'w-[3px] h-3', gap: 'gap-[3px]', text: 'text-[9px]' },
    lg: { h: 'h-6', w: 'w-36', stripe: 'w-1 h-4', gap: 'gap-1', text: 'text-[10px]' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div
        className={`relative ${dims.h} ${dims.w} rounded-sm border overflow-hidden`}
        style={{
          backgroundColor: color,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
        }}
      >
        {/* Black stripe section (ponta do indicador) — right side */}
        <div className="absolute right-0 top-0 bottom-0 w-[30%] bg-black/80 flex items-center justify-end pr-[10%]">
          <div className={`flex items-center ${dims.gap}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`${dims.stripe} rounded-[0.5px]`}
                style={{
                  backgroundColor: i < subniveis ? stripeColor : 'transparent',
                  opacity: i < subniveis ? 1 : 0.15,
                  border: i < subniveis ? 'none' : `0.5px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)'}`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {showLabel && (
        <span className={`${dims.text} text-white/40 font-medium`}>
          {subniveis > 0 ? `${subniveis}° subnível` : 'Sem subnível'}
        </span>
      )}
    </div>
  );
}
