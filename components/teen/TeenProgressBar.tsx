interface TeenProgressBarProps {
  progress: number;
  color?: 'ocean' | 'purple' | 'emerald' | 'energy';
  showPercentage?: boolean;
  label?: string;
  height?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  ocean: 'bg-teen-ocean',
  purple: 'bg-teen-purple',
  emerald: 'bg-teen-emerald',
  energy: 'bg-teen-energy',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

export default function TeenProgressBar({ 
  progress, 
  color = 'ocean',
  showPercentage = true,
  label,
  height = 'md'
}: TeenProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-teen font-medium teen-text-body">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-teen font-medium teen-text-heading">
              {clampedProgress}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full teen-progress-track rounded-full overflow-hidden ${heightClasses[height]}`}>
        <div 
          className={`${colorClasses[color]} ${heightClasses[height]} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
