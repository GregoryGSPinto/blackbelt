interface StarRatingProps {
  stars: number; // 0-5
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'orange' | 'purple';
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
};

const colorClasses = {
  yellow: 'text-kids-yellow',
  orange: 'text-kids-orange',
  purple: 'text-kids-purple',
};

export default function StarRating({
  stars, maxStars = 5, size = 'md', color = 'yellow',
}: StarRatingProps) {
  const fullStars = Math.floor(stars);
  const emptyStars = maxStars - fullStars;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className={`${sizeClasses[size]} ${colorClasses[color]}`}>
          ⭐
        </span>
      ))}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className={`${sizeClasses[size]} opacity-30`}>
          ☆
        </span>
      ))}
    </div>
  );
}
