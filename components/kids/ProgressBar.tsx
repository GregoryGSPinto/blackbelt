'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ProgressBarProps {
  progress: number; // 0-100
  color?: 'blue' | 'pink' | 'yellow' | 'green' | 'orange' | 'purple';
  height?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  label?: string;
}

const colorClasses = {
  blue: 'bg-kids-blue',
  pink: 'bg-kids-pink',
  yellow: 'bg-kids-yellow',
  green: 'bg-kids-green',
  orange: 'bg-kids-orange',
  purple: 'bg-kids-purple',
};

const heightClasses = { sm: 'h-2', md: 'h-4', lg: 'h-6' };

export default function ProgressBar({
  progress, color = 'green', height = 'md',
  showPercentage = true, label,
}: ProgressBarProps) {
  const { isDark } = useTheme();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span
            className="text-sm font-kids font-semibold"
            style={{ color: isDark ? '#CBD5E1' : '#374151' }}
          >
            {label}
          </span>
          {showPercentage && (
            <span
              className="text-sm font-kids font-medium"
              style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.3)' }}
            >
              {clampedProgress}%
            </span>
          )}
        </div>
      )}

      <div
        className={`w-full rounded-full overflow-hidden ${heightClasses[height]}`}
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#E5E7EB' }}
      >
        <div
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
