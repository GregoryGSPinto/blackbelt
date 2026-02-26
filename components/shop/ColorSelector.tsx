'use client';

import { Check } from 'lucide-react';
import type { ProductColor } from '@/lib/api/shop.service';

interface ColorSelectorProps {
  colors: ProductColor[];
  selectedColor: string;
  onSelectColor: (colorName: string) => void;
}

export function ColorSelector({ colors, selectedColor, onSelectColor }: ColorSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-white/55">
        COR: <span className="text-white">{selectedColor}</span>
      </label>

      <div className="flex items-center gap-3">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => color.available && onSelectColor(color.name)}
            disabled={!color.available}
            className={`
              relative w-10 h-10 rounded-full transition-all
              ${color.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}
              ${
                selectedColor === color.name
                  ? 'ring-[3px] ring-primary ring-offset-2 ring-offset-dark-bg scale-110'
                  : 'ring-2 ring-dark-surface hover:ring-primary/50'
              }
            `}
            style={{ backgroundColor: color.hex }}
            title={color.name}
            aria-label={`Selecionar cor ${color.name}`}
          >
            {/* Check icon quando selecionado */}
            {selectedColor === color.name && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check
                  size={20}
                  className={color.hex === '#FFFFFF' ? 'text-black' : 'text-white'}
                  strokeWidth={3}
                />
              </div>
            )}

            {/* X quando indisponível */}
            {!color.available && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 rotate-45" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
