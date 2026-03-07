interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trailColor?: string;
  label?: string;
  showGlow?: boolean;
}

export default function ProgressCircle({ 
  percentage, 
  size = 120, 
  strokeWidth = 10,
  color = 'var(--teen-accent, #006B8F)',
  trailColor,
  label,
  showGlow = true,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={`teen-prog-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
          {showGlow && (
            <filter id={`teen-glow-${size}`}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>
        {/* Trail */}
        <circle
          cx={center} cy={center} r={radius}
          stroke={trailColor || 'rgb(var(--color-elevated) / 0.5)'}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={center} cy={center} r={radius}
          stroke={`url(#teen-prog-${size})`}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          filter={showGlow ? `url(#teen-glow-${size})` : undefined}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="teen-text-heading font-medium font-teen" style={{ fontSize: size * 0.22 }}>
          {percentage}%
        </span>
        {label && (
          <span className="teen-text-muted text-xs font-teen mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
