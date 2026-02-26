/**
 * Shop Service — Produtos, tamanhos, cores
 *
 * MOCK:  useMock() === true → dados de __mocks__/shop.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-014): Implementar endpoints shop
 *   GET /shop/products
 *   GET /shop/products/:id
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';

import type {
  Product, ProductColor, ProductSize,
  SizeGuideTable, TechnicalMeasurement,
} from '@/lib/__mocks__/shop.mock';

export type {
  Product, ProductColor, ProductSize,
  SizeGuideTable, TechnicalMeasurement,
};

async function getMock() {
  return import('@/lib/__mocks__/shop.mock');
}

export async function getProducts(filters?: {
  category?: Product['category'];
  search?: string;
}): Promise<Product[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    if (filters?.category) return m.getProductsByCategory(filters.category);
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      return m.mockProducts.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );
    }
    return [...m.mockProducts];
  }
  const { data } = await apiClient.get<Product[]>('/shop/products');
  return data;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getProductById(id); }
  const { data } = await apiClient.get<Product>(`/shop/products/${id}`);
  return data;
}

export async function getNewProductsList(): Promise<Product[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getNewProducts(); }
  const { data } = await apiClient.get<Product[]>('/shop/products?filter=new');
  return data;
}

export async function getBestSellersList(): Promise<Product[]> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getBestSellers(); }
  const { data } = await apiClient.get<Product[]>('/shop/products?filter=bestsellers');
  return data;
}

export async function getFeatured(): Promise<Product> {
  if (useMock()) { await mockDelay(); const m = await getMock(); return m.getFeaturedProduct(); }
  const { data } = await apiClient.get<Product>('/shop/products/featured');
  return data;
}

export async function getSizeGuide(isKids = false): Promise<SizeGuideTable[]> {
  if (useMock()) {
    await mockDelay();
    const m = await getMock();
    return isKids ? [...m.kidsSizeGuide] : [...m.adultSizeGuide];
  }
  const { data } = await apiClient.get<SizeGuideTable[]>(`/shop/size-guide?kids=${isKids}`);
  return data;
}

// TODO(BE-012): Migrar helpers síncronos para endpoints async quando backend estiver pronto
// Re-export synchronous helpers
export {
  suggestSize, technicalMeasurements,
  adultSizeGuide, kidsSizeGuide,
  colors as productColors,
  getFeaturedProduct, getProductsByCategory, getNewProducts, getBestSellers,
} from '@/lib/__mocks__/shop.mock';
