'use client';

import { ReactNode } from 'react';

interface KidsCardProps {
  children: ReactNode;
  color?: 'blue' | 'pink' | 'yellow' | 'green' | 'orange' | 'purple';
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: 'bg-gradient-to-br from-kids-blue-light to-kids-blue hover:from-kids-blue hover:to-kids-blue-dark',
  pink: 'bg-gradient-to-br from-kids-pink-light to-kids-pink hover:from-kids-pink hover:to-kids-pink-dark',
  yellow: 'bg-gradient-to-br from-kids-yellow-light to-kids-yellow hover:from-kids-yellow hover:to-kids-yellow-dark',
  green: 'bg-gradient-to-br from-kids-green-light to-kids-green hover:from-kids-green hover:to-kids-green-dark',
  orange: 'bg-gradient-to-br from-kids-orange-light to-kids-orange hover:from-kids-orange hover:to-kids-orange-dark',
  purple: 'bg-gradient-to-br from-kids-purple-light to-kids-purple hover:from-kids-purple hover:to-kids-purple-dark',
};

export default function KidsCard({ 
  children, 
  color = 'blue', 
  onClick,
  className = '' 
}: KidsCardProps) {
  const baseClasses = "rounded-3xl p-6 shadow-lg transition-all duration-300 transform";
  const interactiveClasses = onClick ? "cursor-pointer hover:scale-105 hover:shadow-xl" : "";
  
  return (
    <div 
      className={`${baseClasses} ${colorClasses[color]} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
