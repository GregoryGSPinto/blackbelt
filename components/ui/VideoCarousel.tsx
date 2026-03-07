'use client';

import { ChevronRight } from 'lucide-react';

interface VideoCarouselProps {
  title: string;
  children: React.ReactNode;
  seeAllHref?: string;
}

export default function VideoCarousel({ title, children, seeAllHref }: VideoCarouselProps) {
  return (
    <div className="mb-6 w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {seeAllHref && (
          <a href={seeAllHref} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors">
            Ver todos <ChevronRight size={12} />
          </a>
        )}
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}
