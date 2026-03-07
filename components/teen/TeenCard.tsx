'use client';

import { ReactNode, memo } from 'react';

interface TeenCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'elevated' | 'subtle' | 'glass';
  noPadding?: boolean;
}

/**
 * TeenCard — Card premium com suporte a temas claro/escuro
 * Usa CSS variables do projeto para integração automática com ThemeContext
 */
const TeenCard = memo(function TeenCard({ 
  children, 
  onClick, 
  className = '',
  variant = 'default',
  noPadding = false,
}: TeenCardProps) {
  const variants = {
    default: 'teen-card',
    elevated: 'teen-card teen-card-elevated',
    subtle: 'teen-card-subtle',
    glass: 'teen-card-glass',
  };

  const interactive = onClick ? 'cursor-pointer active:scale-[0.98]' : '';
  const padding = noPadding ? '' : 'p-5';

  return (
    <div 
      className={`${variants[variant]} ${interactive} ${padding} rounded-xl transition-all duration-300 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
});

export default TeenCard;
