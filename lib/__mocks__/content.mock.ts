/**
 * Mock Data — APENAS DESENVOLVIMENTO
 * 
 * ⚠️ ATENÇÃO: Este arquivo contém dados mock para desenvolvimento.
 * Em produção com NEXT_PUBLIC_API_URL definida, estes dados não são usados.
 * 
 * Caso use backend real, substitua imports deste arquivo por
 * chamadas à API via serviços em lib/api/
 */

// Mock de dados simulando conteúdo real da unidade
// Vídeos hospedados no YouTube (embed seguro)

export interface Video {
  id: string;
  unidadeId?: string; // Multi-tenant: conteúdo por unidade
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  youtubeId: string;
  thumbnail: string;
  views: number;
  instructor: string;
  // ── Management fields (Wave 12) ──
  criadoPor?: string;
  turmasAssociadas?: string[];
  tags?: string[];
  criadoEm?: string;
}

export interface Serie {
  id: string;
  unidadeId?: string; // Multi-tenant
  title: string;
  description: string;
  videos: Video[];
  thumbnail: string;
  totalDuration: string;
}

// Vídeos base fornecidos
export const mockVideos: Video[] = [
  {
    id: '1',
    title: 'Fundamentos de Guarda Fechada',
    description: 'Aprenda os conceitos essenciais da guarda fechada, uma das posições mais fundamentais do treinamento especializado.',
    duration: '12:30',
    category: 'Guarda',
    level: 'Iniciante',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: `https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg`,
    views: 1250,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '2',
    title: 'Passagem de Guarda Essencial',
    description: 'Técnicas fundamentais de passagem de guarda para iniciantes e intermediários.',
    duration: '15:45',
    category: 'Passagem',
    level: 'Intermediário',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: `https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg`,
    views: 2100,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '3',
    title: 'Defesa contra Omoplata',
    description: 'Como defender e escapar da omoplata de forma eficiente.',
    duration: '10:20',
    category: 'Defesa',
    level: 'Intermediário',
    youtubeId: '9VhHuMtdV38',
    thumbnail: `https://img.youtube.com/vi/9VhHuMtdV38/maxresdefault.jpg`,
    views: 890,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '4',
    title: 'Finalizações de Guarda Fechada',
    description: 'Principais finalizações executadas a partir da guarda fechada.',
    duration: '18:15',
    category: 'Finalização',
    level: 'Avançado',
    youtubeId: 'NJV0HIN5GWI',
    thumbnail: `https://img.youtube.com/vi/NJV0HIN5GWI/maxresdefault.jpg`,
    views: 3400,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '5',
    title: 'Raspagem de Meia Guarda',
    description: 'Técnica eficaz de raspagem a partir da meia guarda.',
    duration: '14:30',
    category: 'Raspagem',
    level: 'Intermediário',
    youtubeId: 'JsTcW7p2nn8',
    thumbnail: `https://img.youtube.com/vi/JsTcW7p2nn8/maxresdefault.jpg`,
    views: 1680,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '6',
    title: 'Controle de Montada',
    description: 'Como manter e pressionar a partir da posição montada.',
    duration: '11:50',
    category: 'Montada',
    level: 'Iniciante',
    youtubeId: '0vLDElI_Mz8',
    thumbnail: `https://img.youtube.com/vi/0vLDElI_Mz8/maxresdefault.jpg`,
    views: 2250,
    instructor: 'Prof. João Mendes'
  }
];

// Séries organizadas
export const mockSeries: Serie[] = [
  {
    id: 'serie-1',
    title: 'Fundamentos para Iniciantes',
    description: 'Série completa com os conceitos essenciais para quem está começando no treinamento especializado.',
    videos: [mockVideos[0], mockVideos[5]],
    thumbnail: mockVideos[0].thumbnail,
    totalDuration: '24:20'
  },
  {
    id: 'serie-2',
    title: 'Passagem de Guarda Avançada',
    description: 'Técnicas avançadas de passagem de guarda para competidores.',
    videos: [mockVideos[1], mockVideos[4]],
    thumbnail: mockVideos[1].thumbnail,
    totalDuration: '30:15'
  },
  {
    id: 'serie-3',
    title: 'Defesa e Contra-Ataque',
    description: 'Aprenda a defender finalizações e converter em contra-ataques.',
    videos: [mockVideos[2], mockVideos[3]],
    thumbnail: mockVideos[2].thumbnail,
    totalDuration: '28:35'
  }
];

// Top 10 da semana (usando os mesmos vídeos)
export const top10Videos = mockVideos.map((video, index) => ({
  ...video,
  rank: index + 1
}));

// Recomendações por categoria
export const getVideosByCategory = (category: string): Video[] => {
  return mockVideos.filter(v => v.category === category);
};

// Recomendações por nível
export const getVideosByLevel = (level: Video['level']): Video[] => {
  return mockVideos.filter(v => v.level === level);
};


