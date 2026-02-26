/**
 * Mock Data — Shop — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém dados mock para desenvolvimento.
 * Em produção com NEXT_PUBLIC_API_URL definida, substitua por API real.
 */

// Mock de dados do Shop - Produtos BlackBelt

export interface Product {
  id: string;
  unidadeId?: string; // Multi-tenant: loja por unidade
  name: string;
  description: string;
  price: number;
  installments: number;
  category: 'uniformes' | 'roupas' | 'acessorios' | 'kids';
  images: string[];
  colors: ProductColor[];
  sizes: ProductSize[];
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  isBestSeller?: boolean;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
  available: boolean;
}

export interface ProductSize {
  label: string;
  available: boolean;
  height?: string;
  weight?: string;
}

export interface SizeGuideTable {
  size: string;
  height: string;
  weight: string;
}

export interface TechnicalMeasurement {
  size: string;
  length: string;
  sleeve: string;
  shoulder: string;
}

// Cores disponíveis
export const colors: Record<string, ProductColor> = {
  white: { name: 'Branco', hex: '#FFFFFF', available: true },
  blue: { name: 'Azul', hex: '#1E3A8A', available: true },
  black: { name: 'Preto', hex: '#000000', available: true },
  navy: { name: 'Azul Marinho', hex: '#1E40AF', available: true },
  gray: { name: 'Cinza', hex: '#6B7280', available: true },
};

// Tamanhos adultos
export const adultSizes: ProductSize[] = [
  { label: 'A0', available: true, height: '155-165 cm', weight: '55-65 kg' },
  { label: 'A1', available: true, height: '165-175 cm', weight: '65-75 kg' },
  { label: 'A2', available: true, height: '175-185 cm', weight: '75-85 kg' },
  { label: 'A3', available: true, height: '185-195 cm', weight: '85-95 kg' },
  { label: 'A4', available: true, height: '195-205 cm', weight: '95-105 kg' },
  { label: 'A5', available: false, height: '205-215 cm', weight: '105-115 kg' },
];

// Tamanhos kids
export const kidsSizes: ProductSize[] = [
  { label: 'M0', available: true, height: '110-120 cm', weight: '18-22 kg' },
  { label: 'M1', available: true, height: '120-130 cm', weight: '22-28 kg' },
  { label: 'M2', available: true, height: '130-140 cm', weight: '28-35 kg' },
  { label: 'M3', available: true, height: '140-150 cm', weight: '35-45 kg' },
];

// Produtos mockados
export const mockProducts: Product[] = [
  // KIMONOS
  {
    id: 'uniforme-competition-pro',
    name: 'Uniforme Competition Pro',
    description: 'Uniforme premium de alta performance para competições. Tecido pearl weave reforçado com costuras triplas e acabamento premium. Ideal para treinos intensos e campeonatos.',
    price: 549.90,
    installments: 10,
    category: 'uniformes',
    images: [
      'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    ],
    colors: [colors.white, colors.blue, colors.black],
    sizes: adultSizes,
    rating: 4.8,
    reviewCount: 127,
    isNew: true,
    isBestSeller: true,
    stock: 45,
  },
  {
    id: 'uniforme-training-edition',
    name: 'Uniforme Training Edition',
    description: 'Uniforme versátil para treinos diários. Excelente custo-benefício com durabilidade comprovada. Tecido leve e respirável.',
    price: 349.90,
    installments: 10,
    category: 'uniformes',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    ],
    colors: [colors.white, colors.navy],
    sizes: adultSizes,
    rating: 4.6,
    reviewCount: 89,
    isBestSeller: true,
    stock: 78,
  },
  {
    id: 'uniforme-light-series',
    name: 'Uniforme Light Series',
    description: 'Uniforme ultra leve para treinos em clima quente. Secagem rápida e máximo conforto térmico.',
    price: 429.90,
    installments: 10,
    category: 'uniformes',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    ],
    colors: [colors.white, colors.blue],
    sizes: adultSizes,
    rating: 4.7,
    reviewCount: 64,
    stock: 34,
  },

  // ROUPAS DE TREINO
  {
    id: 'rashguard-pro-black',
    name: 'Rashguard Pro',
    description: 'Rashguard de compressão com proteção UV50+. Tecido antibacteriano e anti-odor. Perfeito para treinos de gi e no-gi.',
    price: 149.90,
    installments: 3,
    category: 'roupas',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    ],
    colors: [colors.black, colors.navy],
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: true },
    ],
    rating: 4.9,
    reviewCount: 213,
    isBestSeller: true,
    stock: 156,
  },
  {
    id: 'shorts-fight-edition',
    name: 'Shorts Fight Edition',
    description: 'Shorts leve e flexível para máxima mobilidade. Costuras reforçadas e elástico interno ajustável.',
    price: 119.90,
    installments: 2,
    category: 'roupas',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=800&fit=crop',
    ],
    colors: [colors.black, colors.navy, colors.gray],
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: false },
    ],
    rating: 4.5,
    reviewCount: 98,
    stock: 87,
  },
  {
    id: 'spats-compression',
    name: 'Spats Compression',
    description: 'Calça de compressão para no-gi. Tecnologia dry-fit e design anatômico para máximo conforto.',
    price: 139.90,
    installments: 3,
    category: 'roupas',
    images: [
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&h=800&fit=crop',
    ],
    colors: [colors.black, colors.navy],
    sizes: [
      { label: 'P', available: true },
      { label: 'M', available: true },
      { label: 'G', available: true },
      { label: 'GG', available: true },
    ],
    rating: 4.7,
    reviewCount: 142,
    stock: 64,
  },

  // ACESSÓRIOS
  {
    id: 'nivel-premium',
    name: 'Nível Premium',
    description: 'Nível oficial com bordado personalizado. 100% algodão de alta qualidade. Disponível em todos os níveis.',
    price: 79.90,
    installments: 2,
    category: 'acessorios',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=800&fit=crop',
    ],
    colors: [colors.white, colors.blue, colors.black],
    sizes: [
      { label: 'A0', available: true },
      { label: 'A1', available: true },
      { label: 'A2', available: true },
      { label: 'A3', available: true },
      { label: 'A4', available: true },
    ],
    rating: 5.0,
    reviewCount: 234,
    isBestSeller: true,
    stock: 189,
  },
  {
    id: 'bolsa-mochila',
    name: 'Bolsa Mochila BlackBelt',
    description: 'Mochila espaçosa com compartimento para uniforme molhado. Material impermeável e alças reforçadas.',
    price: 189.90,
    installments: 3,
    category: 'acessorios',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    ],
    colors: [colors.black, colors.navy],
    sizes: [{ label: 'Único', available: true }],
    rating: 4.8,
    reviewCount: 156,
    stock: 43,
  },
  {
    id: 'protetor-bucal',
    name: 'Protetor Bucal Premium',
    description: 'Protetor bucal moldável com estojo. Aprovado para competições oficiais.',
    price: 49.90,
    installments: 1,
    category: 'acessorios',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    ],
    colors: [colors.black, { name: 'Transparente', hex: '#FFFFFF', available: true }],
    sizes: [{ label: 'Único', available: true }],
    rating: 4.6,
    reviewCount: 87,
    stock: 124,
  },

  // KIDS
  {
    id: 'uniforme-kids-starter',
    name: 'Uniforme Kids Starter',
    description: 'Uniforme infantil durável e confortável. Perfeito para pequenos campeões iniciantes. Tecido macio e resistente.',
    price: 229.90,
    installments: 5,
    category: 'kids',
    images: [
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=800&fit=crop',
    ],
    colors: [colors.white, colors.blue],
    sizes: kidsSizes,
    rating: 4.9,
    reviewCount: 178,
    isNew: true,
    isBestSeller: true,
    stock: 92,
  },
  {
    id: 'rashguard-kids',
    name: 'Rashguard Kids',
    description: 'Rashguard infantil com proteção UV. Cores vibrantes e estampas divertidas para motivar as crianças.',
    price: 99.90,
    installments: 2,
    category: 'kids',
    images: [
      'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=800&fit=crop',
    ],
    colors: [colors.blue, colors.black],
    sizes: [
      { label: 'M0', available: true },
      { label: 'M1', available: true },
      { label: 'M2', available: true },
      { label: 'M3', available: true },
    ],
    rating: 4.8,
    reviewCount: 145,
    stock: 78,
  },
];

// Funções utilitárias
export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(p => p.id === id);
};

export const getProductsByCategory = (category: Product['category']): Product[] => {
  return mockProducts.filter(p => p.category === category);
};

export const getNewProducts = (): Product[] => {
  return mockProducts.filter(p => p.isNew);
};

export const getBestSellers = (): Product[] => {
  return mockProducts.filter(p => p.isBestSeller);
};

export const getFeaturedProduct = (): Product => {
  return mockProducts[0]; // Uniforme Competition Pro
};

// Tabelas de medidas
export const adultSizeGuide: SizeGuideTable[] = [
  { size: 'A0', height: '155 - 165', weight: '55 - 65' },
  { size: 'A1', height: '165 - 175', weight: '65 - 75' },
  { size: 'A2', height: '175 - 185', weight: '75 - 85' },
  { size: 'A3', height: '185 - 195', weight: '85 - 95' },
  { size: 'A4', height: '195 - 205', weight: '95 - 105' },
];

export const kidsSizeGuide: SizeGuideTable[] = [
  { size: 'M0 (4-6 anos)', height: '110 - 120', weight: '18 - 22' },
  { size: 'M1 (6-8 anos)', height: '120 - 130', weight: '22 - 28' },
  { size: 'M2 (8-10 anos)', height: '130 - 140', weight: '28 - 35' },
  { size: 'M3 (10-12 anos)', height: '140 - 150', weight: '35 - 45' },
];

export const technicalMeasurements: TechnicalMeasurement[] = [
  { size: 'A0', length: '72 cm', sleeve: '58 cm', shoulder: '44 cm' },
  { size: 'A1', length: '75 cm', sleeve: '60 cm', shoulder: '46 cm' },
  { size: 'A2', length: '78 cm', sleeve: '62 cm', shoulder: '48 cm' },
  { size: 'A3', length: '81 cm', sleeve: '64 cm', shoulder: '50 cm' },
  { size: 'A4', length: '84 cm', sleeve: '66 cm', shoulder: '52 cm' },
];

// Lógica de sugestão de tamanho
export function suggestSize(height: number, weight: number, isKids: boolean = false): string | null {
  if (!height || !weight) return null;
  if (height < 40 || height > 220) return null;
  if (weight < 15 || weight > 150) return null;

  if (isKids) {
    if (height <= 120 && weight <= 22) return 'M0';
    if (height <= 130 && weight <= 28) return 'M1';
    if (height <= 140 && weight <= 35) return 'M2';
    if (height <= 150 && weight <= 45) return 'M3';
    return 'M3';
  }

  // Adults
  if (height <= 165 && weight <= 65) return 'A0';
  if (height <= 175 && weight <= 75) return 'A1';
  if (height <= 185 && weight <= 85) return 'A2';
  if (height <= 195 && weight <= 95) return 'A3';
  if (height <= 205 && weight <= 105) return 'A4';
  
  // Casos extremos: prioriza altura
  if (height > 195) return 'A4';
  if (height > 185) return 'A3';
  if (height > 175) return 'A2';
  
  return 'A1';
}
