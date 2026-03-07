import { ReactNode } from 'react';

interface KidsHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  color?: 'blue' | 'pink' | 'yellow' | 'green' | 'orange' | 'purple';
}

const colorClasses = {
  blue: 'bg-gradient-to-r from-kids-blue to-kids-blue-dark',
  pink: 'bg-gradient-to-r from-kids-pink to-kids-pink-dark',
  yellow: 'bg-gradient-to-r from-kids-yellow to-kids-yellow-dark',
  green: 'bg-gradient-to-r from-kids-green to-kids-green-dark',
  orange: 'bg-gradient-to-r from-kids-orange to-kids-orange-dark',
  purple: 'bg-gradient-to-r from-kids-purple to-kids-purple-dark',
};

export default function KidsHeader({ 
  title, 
  subtitle, 
  icon,
  color = 'blue' 
}: KidsHeaderProps) {
  return (
    <div className={`${colorClasses[color]} rounded-3xl p-6 mb-6 shadow-lg`}>
      <div className="flex items-center gap-4">
        {icon && (
          <div className="text-5xl">{icon}</div>
        )}
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl lg:text-4xl font-semibold text-white font-kids drop-shadow-md">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/90 text-lg mt-1 font-kids">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
