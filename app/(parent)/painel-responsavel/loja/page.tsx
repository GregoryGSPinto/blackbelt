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
import { useFormatting } from '@/hooks/useFormatting';

export default function ParentLojaPage() {
  const t = useTranslations('common');
  const { formatMoney } = useFormatting();
  const router = useRouter();

  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [novidades, setNovidades] = useState<Product[]>([]);
  const [maisVendidos, setMaisVendidos] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [featured, products, novidadesData, vendidosData] = await Promise.all([
          shopService.getFeatured(),
          shopService.getProducts(),
          shopService.getNewProductsList(),
          shopService.getBestSellersList(),
        ]);
        setFeaturedProduct(featured);
        setAllProducts(products);
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

  if (loading) return <PremiumLoader text={t('loading.shop')} />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  if (!featuredProduct) return <PageEmpty title={t('empty.shopUnavailable')} message={t('empty.noProducts')} />;

  const uniformes = allProducts.filter(p => p.category === 'uniformes');
  const roupas = allProducts.filter(p => p.category === 'roupas');
  const acessorios = allProducts.filter(p => p.category === 'acessorios');

  const sections = [
    { title: 'Mais Vendidos', data: maisVendidos },
    { title: 'Uniformes', data: uniformes },
    { title: 'Roupas de Treino', data: roupas },
    { title: 'Acessórios', data: acessorios },
    { title: 'Novidades', data: novidades },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] mb-8">
        <img src={featuredProduct.images[0]} alt={featuredProduct.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="relative h-full flex items-end p-4 md:p-8">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-3 text-white">{featuredProduct.name}</h1>
            <p className="text-sm md:text-base text-white/55 mb-4 line-clamp-2">{featuredProduct.description}</p>
            <div className="mt-4 flex items-center gap-3 text-sm text-white/40">
              <span className="font-medium text-lg text-white/70">{formatMoney(featuredProduct.price)}</span>
              <span>·</span>
              <span>{featuredProduct.installments}x sem juros</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Sections */}
      <div className="space-y-8 px-4 md:px-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{section.title}</h2>
            <VideoCarousel title="">
              {section.data.map((product) => (
                <ProductCard key={product.id} product={product} onClick={() => {}} />
              ))}
            </VideoCarousel>
          </section>
        ))}
      </div>
      <div className="h-8" />
    </div>
  );
}
