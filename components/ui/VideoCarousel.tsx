'use client';

interface VideoCarouselProps {
  title: string;
  children: React.ReactNode;
}

export default function VideoCarousel({ title, children }: VideoCarouselProps) {
  return (
    <div className="mb-6 w-full">
      <h2 className="text-lg md:text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 w-full">
        {children}
      </div>
    </div>
  );
}
