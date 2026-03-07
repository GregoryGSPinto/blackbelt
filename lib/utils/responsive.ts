/**
 * Responsive utilities for consistent mobile-first design
 * BlackBelt - Mobile Optimization
 */

import { useEffect, useState } from 'react';

// Breakpoints em pixels
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Hook para detectar viewport
export function useViewport() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setWidth(w);
      setHeight(h);
      setIsMobile(w < breakpoints.md);
      setIsTablet(w >= breakpoints.md && w < breakpoints.lg);
      setIsDesktop(w >= breakpoints.lg);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { width, height, isMobile, isTablet, isDesktop };
}

// Classes para touch targets acessíveis
export const touchTargets = {
  minimum: 'min-w-[44px] min-h-[44px]', // Apple HIG minimum
  comfortable: 'min-w-[48px] min-h-[48px]', // Material Design
  large: 'min-w-[56px] min-h-[56px]',
} as const;

// Espaçamento responsivo
export const responsiveSpacing = {
  section: 'py-4 sm:py-6 md:py-8 lg:py-12',
  container: 'px-4 sm:px-6 lg:px-8',
  card: 'p-4 sm:p-5 md:p-6',
} as const;

// Tamanhos de texto responsivos
export const responsiveText = {
  h1: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl',
  h2: 'text-lg sm:text-xl md:text-2xl lg:text-3xl',
  h3: 'text-base sm:text-lg md:text-xl lg:text-2xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
} as const;

// Grid responsivo
export const responsiveGrid = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
} as const;

// Verificar se é mobile no servidor
export function isMobileUserAgent(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
}
