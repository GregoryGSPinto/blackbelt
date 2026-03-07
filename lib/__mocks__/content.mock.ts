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
  },
  {
    id: '7',
    title: 'Triangulo do Fechado',
    description: 'Finalizacao classica a partir da guarda fechada.',
    duration: '13:20',
    category: 'Finalização',
    level: 'Intermediário',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: `https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg`,
    views: 1920,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '8',
    title: 'Kimura da Meia Guarda',
    description: 'Como aplicar a kimura partindo da meia guarda.',
    duration: '09:45',
    category: 'Finalização',
    level: 'Intermediário',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: `https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg`,
    views: 1450,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '9',
    title: 'Armlock da Montada',
    description: 'Tecnica de armlock executada da posicao montada.',
    duration: '11:10',
    category: 'Finalização',
    level: 'Avançado',
    youtubeId: '9VhHuMtdV38',
    thumbnail: `https://img.youtube.com/vi/9VhHuMtdV38/maxresdefault.jpg`,
    views: 2800,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '10',
    title: 'Defesa de Queda',
    description: 'Fundamentos de defesa contra quedas e projecoes.',
    duration: '08:30',
    category: 'Defesa',
    level: 'Iniciante',
    youtubeId: 'NJV0HIN5GWI',
    thumbnail: `https://img.youtube.com/vi/NJV0HIN5GWI/maxresdefault.jpg`,
    views: 980,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '11',
    title: 'Finalizacao Guilhotina',
    description: 'Como executar a guilhotina de diferentes posicoes.',
    duration: '14:00',
    category: 'Finalização',
    level: 'Intermediário',
    youtubeId: 'JsTcW7p2nn8',
    thumbnail: `https://img.youtube.com/vi/JsTcW7p2nn8/maxresdefault.jpg`,
    views: 2100,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '12',
    title: 'Back Take',
    description: 'Tecnicas para pegar as costas do oponente.',
    duration: '16:20',
    category: 'Costas',
    level: 'Avançado',
    youtubeId: '0vLDElI_Mz8',
    thumbnail: `https://img.youtube.com/vi/0vLDElI_Mz8/maxresdefault.jpg`,
    views: 3100,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '13',
    title: 'Berimbolo',
    description: 'Inversao moderna para pegar as costas.',
    duration: '19:45',
    category: 'Raspagem',
    level: 'Avançado',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: `https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg`,
    views: 4200,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '14',
    title: 'Leg Lock Basico',
    description: 'Introducao aos ataques de perna.',
    duration: '12:15',
    category: 'Finalização',
    level: 'Intermediário',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: `https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg`,
    views: 1800,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '15',
    title: 'Estrangulamento Cruzado',
    description: 'Finalizacao classica de estrangulamento cruzado.',
    duration: '10:50',
    category: 'Finalização',
    level: 'Avançado',
    youtubeId: '9VhHuMtdV38',
    thumbnail: `https://img.youtube.com/vi/9VhHuMtdV38/maxresdefault.jpg`,
    views: 2600,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '16',
    title: 'Guarda Borboleta',
    description: 'Fundamentos e raspagens da guarda borboleta.',
    duration: '15:30',
    category: 'Guarda',
    level: 'Intermediário',
    youtubeId: 'NJV0HIN5GWI',
    thumbnail: `https://img.youtube.com/vi/NJV0HIN5GWI/maxresdefault.jpg`,
    views: 1350,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '17',
    title: 'Passagem Toreando',
    description: 'Passagem de guarda classica e eficiente.',
    duration: '11:40',
    category: 'Passagem',
    level: 'Iniciante',
    youtubeId: 'JsTcW7p2nn8',
    thumbnail: `https://img.youtube.com/vi/JsTcW7p2nn8/maxresdefault.jpg`,
    views: 1600,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '18',
    title: 'Controle Side Control',
    description: 'Manutencao e pressao na posicao lateral.',
    duration: '13:55',
    category: 'Montada',
    level: 'Iniciante',
    youtubeId: '0vLDElI_Mz8',
    thumbnail: `https://img.youtube.com/vi/0vLDElI_Mz8/maxresdefault.jpg`,
    views: 1100,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '19',
    title: 'Escape da Montada',
    description: 'Tecnicas de escape quando o oponente esta montado.',
    duration: '10:25',
    category: 'Defesa',
    level: 'Iniciante',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: `https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg`,
    views: 2050,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '20',
    title: 'De La Riva Guard',
    description: 'Controle e ataques da guarda De La Riva.',
    duration: '17:10',
    category: 'Guarda',
    level: 'Avançado',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: `https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg`,
    views: 3500,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '21',
    title: 'Lapel Guard',
    description: 'Tecnicas modernas usando a lapela.',
    duration: '20:00',
    category: 'Guarda',
    level: 'Avançado',
    youtubeId: '9VhHuMtdV38',
    thumbnail: `https://img.youtube.com/vi/9VhHuMtdV38/maxresdefault.jpg`,
    views: 2900,
    instructor: 'Prof. João Mendes'
  },
  {
    id: '22',
    title: 'Entrada de Queda Simples',
    description: 'Quedas basicas para iniciantes.',
    duration: '07:40',
    category: 'Queda',
    level: 'Iniciante',
    youtubeId: 'NJV0HIN5GWI',
    thumbnail: `https://img.youtube.com/vi/NJV0HIN5GWI/maxresdefault.jpg`,
    views: 750,
    instructor: 'Prof. Ricardo Silva'
  },
  {
    id: '23',
    title: 'Aquecimento Funcional',
    description: 'Rotina de aquecimento antes do treino.',
    duration: '06:15',
    category: 'Preparação',
    level: 'Iniciante',
    youtubeId: 'JsTcW7p2nn8',
    thumbnail: `https://img.youtube.com/vi/JsTcW7p2nn8/maxresdefault.jpg`,
    views: 4500,
    instructor: 'Prof. Ana Costa'
  },
  {
    id: '24',
    title: 'Ezequiel Choke',
    description: 'Estrangulamento Ezequiel da montada e guarda.',
    duration: '09:30',
    category: 'Finalização',
    level: 'Intermediário',
    youtubeId: '0vLDElI_Mz8',
    thumbnail: `https://img.youtube.com/vi/0vLDElI_Mz8/maxresdefault.jpg`,
    views: 1750,
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


