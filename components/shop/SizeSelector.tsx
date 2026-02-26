'use client';

import { Ruler } from 'lucide-react';
import type { ProductSize } from '@/lib/api/shop.service';

interface SizeSelectorProps {
  sizes: ProductSize[];
  selectedSize: string | null;
  onSelectSize: (size: string) => void;
  onOpenGuide: () => void;
}

export function SizeSelector({
  sizes,
  selectedSize,
  onSelectSize,
  onOpenGuide,
}: SizeSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Label com link para guia */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-white/55">TAMANHO:</label>
        <button
          onClick={onOpenGuide}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors"
        >
          <Ruler size={16} />
          Guia de Medidas
        </button>
      </div>

      {/* Botões de tamanho */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {sizes.map((size) => (
          <button
            key={size.label}
            onClick={() => size.available && onSelectSize(size.label)}
            disabled={!size.available}
            className={`
              h-12 md:h-14 rounded-lg font-semibold text-sm md:text-base
              transition-all duration-150
              ${
                selectedSize === size.label
                  ? 'bg-primary border-2 border-primary text-white font-bold scale-105'
                  : size.available
                  ? 'bg-transparent border-2 border-dark-surface text-white/40 hover:border-primary hover:bg-primary/10 hover:text-white'
                  : 'bg-dark-elevated border-2 border-dashed border-dark-surface text-white/30 opacity-50 cursor-not-allowed'
              }
            `}
            title={
              size.available
                ? size.height
                  ? `${size.height}, ${size.weight}`
                  : size.label
                : 'Indisponível'
            }
          >
            {size.label}
          </button>
        ))}
      </div>

      {/* Info do tamanho selecionado */}
      {selectedSize && sizes.find(s => s.label === selectedSize)?.height && (
        <p className="text-xs text-white/40">
          📊 {sizes.find(s => s.label === selectedSize)?.height} •{' '}
          {sizes.find(s => s.label === selectedSize)?.weight}
        </p>
      )}
    </div>
  );
}
