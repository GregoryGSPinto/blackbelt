'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ProductCard } from '@/components/shop';
import VideoCarousel from '@/components/ui/VideoCarousel';
import * as shopService from '@/lib/api/shop.service';
import type { Product } from '@/lib/api/shop.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function ShopPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const router = useRouter();
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [uniformes, setUniformes] = useState<Product[]>([]);
  const [roupas, setRoupas] = useState<Product[]>([]);
  const [acessorios, setAcessorios] = useState<Product[]>([]);
  const [kids, setKids] = useState<Product[]>([]);
  const [novidades, setNovidades] = useState<Product[]>([]);
  const [maisVendidos, setMaisVendidos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [featured, allProducts, novidadesData, vendidosData] = await Promise.all([
          shopService.getFeatured(),
          shopService.getProducts(),
          shopService.getNewProductsList(),
          shopService.getBestSellersList(),
        ]);
        setFeaturedProduct(featured);
        setUniformes(allProducts.filter(p => p.category === 'uniformes'));
        setRoupas(allProducts.filter(p => p.category === 'roupas'));
        setAcessorios(allProducts.filter(p => p.category === 'acessorios'));
        setKids(allProducts.filter(p => p.category === 'kids'));
        setNovidades(novidadesData);
        setMaisVendidos(vendidosData);
      } catch (err) {
        setError(handleServiceError(err, 'Shop'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  const handleProductClick = (productId: string) => {
    router.push(`/shop/produto/${productId}`);
  };

  if (loading) {
    return <PremiumLoader text="Carregando loja..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (!featuredProduct) {
    return <PageEmpty title="Loja indisponível" message="Nenhum produto encontrado no momento." />;
  }


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[50vh] md:h-[60vh] tv:h-[70vh] mb-8">
        {/* Background Image */}
        <img
          src={featuredProduct.images[0]}
          alt={featuredProduct.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />

        {/* Content */}
        <div className="relative h-full flex items-end p-4 md:p-8 tv:p-16">
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold">NOVA COLEÇÃO</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tv:text-7xl font-bold mb-4 text-white">
              {featuredProduct.name}
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-white/55 mb-6 line-clamp-2">
              {featuredProduct.description}
            </p>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => handleProductClick(featuredProduct.id)}
                className="btn-primary flex items-center gap-2"
              >
                Ver Produto →
              </button>
              <button
                onClick={() => {
                  document.getElementById('uniformes')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary"
              >
                Explorar Coleção
              </button>
            </div>

            {/* Metadata */}
            <div className="mt-6 flex items-center gap-3 text-sm text-white/40">
              <span className="text-primary font-bold text-lg">
                {featuredProduct.price.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                })}
              </span>
              <span>•</span>
              <span>{featuredProduct.installments}x sem juros</span>
              <span>•</span>
              <span>⭐ {featuredProduct.rating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Carousels */}
      <div className="space-y-8 px-4 md:px-8 tv:px-16">
        {/* Mais Vendidos */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Mais Vendidos</h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {maisVendidos.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>

        {/* Uniformes */}
        <section id="uniformes">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Uniformes</h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {uniformes.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>

        {/* Roupas de Treino */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Roupas de Treino</h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {roupas.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>

        {/* Acessórios */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Acessórios</h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {acessorios.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>

        {/* Kids */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
              👶 Linha Kids
            </h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {kids.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>

        {/* Novidades */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">Novidades</h2>
            <button className="text-primary hover:underline text-sm font-semibold">
              Ver Todos →
            </button>
          </div>
          <VideoCarousel title="">
            {novidades.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </VideoCarousel>
        </section>
      </div>

      {/* Bottom Spacing */}
      <div className="h-8" />
    </div>
  );
}
