'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Star, Heart, Share2, ShoppingCart } from 'lucide-react';
import { ColorSelector, SizeSelector } from '@/components/shop';
import * as shopService from '@/lib/api/shop.service';
import type { Product } from '@/lib/api/shop.service';
import dynamic from 'next/dynamic';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { Breadcrumb } from '@/components/shared/Breadcrumb';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useFormatting } from '@/hooks/useFormatting';

/**
 * Lazy loading do SizeGuideModal
 * Modal pesado (455 linhas) carregado apenas quando usuário clica em "Guia de Medidas"
 */
const SizeGuideModal = dynamic(
  () => import('@/components/shop/SizeGuideModal').then(mod => ({ default: mod.SizeGuideModal })),
  {
    loading: () => null, // Não mostrar loading
    ssr: false // Modal não precisa de SSR
  }
);

export default function ProductPage({ params }: { params: { id: string } }) {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatMoney } = useFormatting();

  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews' | 'care'>('description');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const data = await shopService.getProductById(params.id);
        setProduct(data || null);
        if (data?.colors[0]) setSelectedColor(data.colors[0].name);
      } catch (err) {
        setError(handleServiceError(err, 'Produto'));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id, retryCount]);

  if (loading) {
    return <PremiumLoader text="Carregando produto..." />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Produto não encontrado</h2>
          <button onClick={() => router.push('/shop')} className="btn-primary">
            Voltar para a Loja
          </button>
        </div>
      </div>
    );
  }

  const isKids = product.category === 'kids';

  const handleAddToCart = () => {
    if (!selectedSize) {
      setFeedback({ type: 'error', message: 'Por favor, selecione um tamanho' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    // TODO(FE-022): Integrar POST /shop/cart/add
    setFeedback({ type: 'success', message: `Produto adicionado ao carrinho! Tamanho: ${selectedSize} · Cor: ${selectedColor}` });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="min-h-screen pb-20 md:pb-8">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-xl text-sm font-medium transition-all animate-pulse ${
          feedback.type === 'success'
            ? 'bg-green-600 text-white'
            : 'bg-red-600 text-white'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="px-4 md:px-8 py-4 border-b border-dark-elevated">
        <Breadcrumb dynamicLabel={product.name} />
      </div>

      {/* Product Content */}
      <div className="px-4 md:px-8 py-6 md:py-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Column: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-dark-card rounded-xl overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`
                      aspect-square rounded-xl overflow-hidden border-2 transition-all
                      ${
                        selectedImage === index
                          ? 'border-primary'
                          : 'border-dark-surface hover:border-dark-surface'
                      }
                    `}
                  >
                    <img src={image} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="space-y-6">
            {/* Title & Rating */}
            <div>
              <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {product.name}
              </h1>
              {product.rating && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className={
                          i < Math.floor(product.rating!)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-white/30'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: tokens.textMuted }}>
                    {product.rating} ({product.reviewCount} avaliações)
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="border-b border-dark-elevated pb-6">
              <div className="text-xl md:text-2xl lg:text-4xl font-medium text-primary mb-2">
                {formatMoney(product.price)}
              </div>
              {product.installments > 1 && (
                <p className="text-sm" style={{ color: tokens.textMuted }}>
                  ou {product.installments}x de {formatMoney(product.price / product.installments)} sem juros
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-white/55 leading-relaxed">{product.description}</p>

            {/* Color Selector */}
            {product.colors.length > 0 && (
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onSelectColor={setSelectedColor}
              />
            )}

            {/* Size Selector */}
            <SizeSelector
              sizes={product.sizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              onOpenGuide={() => setShowSizeGuide(true)}
            />

            {/* Stock Info */}
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-sm text-amber-400">
                ⚠️ Apenas {product.stock} unidades em estoque
              </p>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full h-14 bg-primary hover:bg-primary-dark disabled:bg-dark-surface disabled:text-white/35 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart size={20} />
                {selectedSize ? 'Adicionar ao Carrinho' : 'Selecione um Tamanho'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button className="h-12 border-2 border-dark-surface hover:border-primary rounded-xl text-white/55 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Heart size={18} />
                  <span className="hidden md:inline">Favoritos</span>
                </button>
                <button className="h-12 border-2 border-dark-surface hover:border-primary rounded-xl text-white/55 hover:text-white transition-colors flex items-center justify-center gap-2">
                  <Share2 size={18} />
                  <span className="hidden md:inline">Compartilhar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12 md:mt-16">
          {/* Tab Headers */}
          <div className="flex border-b border-dark-elevated overflow-x-auto">
            {([
              { id: 'description' as const, label: 'Descrição' },
              { id: 'specs' as const, label: 'Especificações' },
              { id: 'reviews' as const, label: 'Avaliações' },
              { id: 'care' as const, label: 'Cuidados' },
            ]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors relative
                  ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-white/40 hover:text-white'
                  }
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'description' && (
              <div className="prose prose-invert max-w-none">
                <p className="text-white/55 leading-relaxed">{product.description}</p>
                <h3 className="text-xl font-semibold text-white mt-6 mb-3">Características</h3>
                <ul className="space-y-2 text-white/55">
                  <li>✓ Material de alta qualidade</li>
                  <li>✓ Costuras reforçadas</li>
                  <li>✓ Secagem rápida</li>
                  <li>✓ Durabilidade comprovada</li>
                </ul>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-dark-card p-4 rounded-xl">
                    <p className="text-sm text-white/40 mb-1">Categoria</p>
                    <p className="font-semibold text-white capitalize">{product.category}</p>
                  </div>
                  <div className="bg-dark-card p-4 rounded-xl">
                    <p className="text-sm text-white/40 mb-1">Tamanhos</p>
                    <p className="font-semibold text-white">
                      {product.sizes.map(s => s.label).join(', ')}
                    </p>
                  </div>
                  <div className="bg-dark-card p-4 rounded-xl">
                    <p className="text-sm text-white/40 mb-1">Cores</p>
                    <p className="font-semibold text-white">
                      {product.colors.map(c => c.name).join(', ')}
                    </p>
                  </div>
                  <div className="bg-dark-card p-4 rounded-xl">
                    <p className="text-sm text-white/40 mb-1">Estoque</p>
                    <p className="font-semibold text-white">{product.stock} unidades</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="text-center py-12">
                <p style={{ fontWeight: 300, color: tokens.textMuted }}>Nenhuma avaliação ainda.</p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-4">Instruções de Cuidado</h3>
                <ul className="space-y-2 text-white/55">
                  <li>🧼 Lavar em água fria (máx 30°C)</li>
                  <li>☀️ Secar à sombra</li>
                  <li>🚫 Não usar alvejante</li>
                  <li>🚫 Não usar secadora</li>
                  <li>👕 Passar em temperatura baixa se necessário</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        onSelectSize={setSelectedSize}
        isKids={isKids}
      />

      {/* Mobile Fixed Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-dark-card/95 backdrop-blur-lg border-t border-dark-elevated p-4 z-10">
        <button
          onClick={handleAddToCart}
          disabled={!selectedSize}
          className="w-full h-12 bg-primary hover:bg-primary-dark disabled:bg-dark-surface disabled:text-white/35 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          {selectedSize ? 'Adicionar' : 'Selecione Tamanho'}
        </button>
      </div>
    </div>
  );
}
