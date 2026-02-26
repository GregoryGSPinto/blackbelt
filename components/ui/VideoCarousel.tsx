'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

interface VideoCarouselProps {
  title: string;
  children: React.ReactNode;
}

export default function VideoCarousel({ title, children }: VideoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-4 px-4 md:px-8">{title}</h2>
      
      {/* overflow-y visible allows scale-up + preview hover to not clip */}
      <div className="relative group/carousel">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-dark-card/80 hover:bg-dark-elevated/90 p-2 rounded-r-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronLeft size={32} />
        </button>

        {/* Carousel — py-4 gives breathing room for scale(1.05) */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto px-4 md:px-8 snap-x snap-mandatory py-4"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-dark-card/80 hover:bg-dark-elevated/90 p-2 rounded-l-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity hidden md:block"
        >
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}
