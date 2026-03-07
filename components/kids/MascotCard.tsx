'use client';

import { KidsMascot } from '@/lib/api/kids.service';
import { useTheme } from '@/contexts/ThemeContext';

interface MascotCardProps {
  mascot: KidsMascot;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: { container: 'w-24 h-24', emoji: 'text-4xl', name: 'text-sm' },
  md: { container: 'w-32 h-32', emoji: 'text-5xl', name: 'text-base' },
  lg: { container: 'w-40 h-40', emoji: 'text-6xl', name: 'text-lg' },
};

export default function MascotCard({ mascot, size = 'md' }: MascotCardProps) {
  const { isDark } = useTheme();
  const s = sizeClasses[size];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${s.container} rounded-full shadow-lg flex items-center justify-center border-4 hover:scale-110 transition-transform duration-300 cursor-pointer`}
        style={{
          background: isDark ? 'rgba(30,41,59,0.7)' : '#FFFFFF',
          borderColor: isDark ? 'rgba(20,184,166,0.25)' : '#E3F2FD',
        }}
      >
        <span className={s.emoji}>{mascot.emoji}</span>
      </div>
      <p
        className={`${s.name} font-kids font-medium mt-2`}
        style={{ color: isDark ? '#F1F5F9' : '#374151' }}
      >
        {mascot.nome}
      </p>
      <p
        className="text-xs font-kids text-center"
        style={{ color: isDark ? '#94A3B8' : '#6B7280' }}
      >
        {mascot.animal}
      </p>
    </div>
  );
}
