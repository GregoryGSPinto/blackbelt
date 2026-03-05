'use client';

import { memo } from 'react';
import { Star } from 'lucide-react';
import type { Product } from '@/lib/api/shop.service';
import { useFormatting } from '@/hooks/useFormatting';

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  showRating?: boolean;
}

/**
 * ProductCard — Componente otimizado para grids de produtos
 * 
 * React.memo previne re-renders quando props não mudam.
 * Essencial para performance em listas grandes de produtos.
 */
export const ProductCard = memo(function ProductCard({ product, onClick, showRating = true }: ProductCardProps) {
  const { formatMoney } = useFormatting();

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-dark-card rounded-lg overflow-hidden mb-3 border border-white/[0.08] transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_8px_32px_rgba(124,58,237,0.3)]">
        {/* Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.isNew && (
            <div className="bg-primary px-2 py-1 rounded text-xs font-semibold">
              NOVO
            </div>
          )}
          {product.isBestSeller && (
            <div className="bg-amber-500 px-2 py-1 rounded text-xs font-semibold text-black">
              MAIS VENDIDO
            </div>
          )}
          {product.category === 'kids' && (
            <div className="bg-green-500 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              👶 KIDS
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Info */}
      <div className="space-y-1">
        {/* Name */}
        <h3 className="font-medium text-white line-clamp-2 group-hover:text-primary transition-colors min-h-[3rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="space-y-0.5">
          <p className="text-lg font-semibold text-primary">
            {formatMoney(product.price)}
          </p>
          {product.installments > 1 && (
            <p className="text-xs text-white/40">
              {product.installments}x de {formatMoney(product.price / product.installments)}
            </p>
          )}
        </div>

        {/* Rating */}
        {showRating && product.rating && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(product.rating!)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-white/30'
                  }
                />
              ))}
            </div>
            <span>
              {product.rating} ({product.reviewCount})
            </span>
          </div>
        )}
      </div>
    </div>
  );
});
