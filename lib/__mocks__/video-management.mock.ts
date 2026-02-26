// ============================================================
// Video Management Mock — Professor CRUD for videos
// ============================================================

import type { Video } from './content.mock';

export type VideoCategory = 'Fundamentos' | 'Passagens' | 'Finalizações' | 'Defesa' | 'Drills' | 'Guarda' | 'Passagem';

export interface VideoCreateInput {
  title: string;
  description?: string;
  youtubeUrl: string;
  category: string;
  level: Video['level'];
  turmasAssociadas?: string[];
  tags?: string[];
}

export interface VideoUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  level?: Video['level'];
  turmasAssociadas?: string[];
  tags?: string[];
}

// ── YouTube URL parsing ──

const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

export function extractYoutubeId(url: string): string | null {
  const match = url.match(YT_REGEX);
  return match ? match[1] : null;
}

// ── In-memory store ──

let nextId = 100;

const PROFESSOR_VIDEOS: Video[] = [
  {
    id: 'pv-1',
    title: 'Guard Retention — Conceitos Chave',
    description: 'Os 3 princípios fundamentais para nunca perder a guarda.',
    duration: '14:22',
    category: 'Guarda',
    level: 'Intermediário',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: 'https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg',
    views: 340,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001', 'TUR002'],
    tags: ['guarda', 'retenção', 'conceitos'],
    criadoEm: '2025-12-10T10:00:00Z',
  },
  {
    id: 'pv-2',
    title: 'Leg Drag Pass — Passo a Passo',
    description: 'Como executar a passagem Leg Drag com detalhes de grip e posicionamento.',
    duration: '11:45',
    category: 'Passagem',
    level: 'Avançado',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: 'https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg',
    views: 520,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001'],
    tags: ['passagem', 'leg drag'],
    criadoEm: '2025-12-15T14:30:00Z',
  },
  {
    id: 'pv-3',
    title: 'Armbar da Montada — Drill de Repetição',
    description: 'Drill para automatizar a finalização de armbar a partir da montada.',
    duration: '08:30',
    category: 'Finalizações',
    level: 'Iniciante',
    youtubeId: '9VhHuMtdV38',
    thumbnail: 'https://img.youtube.com/vi/9VhHuMtdV38/maxresdefault.jpg',
    views: 180,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR002'],
    tags: ['armbar', 'montada', 'drill'],
    criadoEm: '2026-01-05T09:00:00Z',
  },
  {
    id: 'pv-4',
    title: 'Fuga de Side Control — 3 Opções',
    description: 'Três fugas eficientes quando preso em side control.',
    duration: '16:10',
    category: 'Defesa',
    level: 'Iniciante',
    youtubeId: '3sv8YS6V1n4',
    thumbnail: 'https://img.youtube.com/vi/3sv8YS6V1n4/maxresdefault.jpg',
    views: 410,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001', 'TUR002'],
    tags: ['defesa', 'side control', 'fuga'],
    criadoEm: '2026-01-20T11:00:00Z',
  },
  {
    id: 'pv-5',
    title: 'Warm-up Drills para treinamento especializado',
    description: 'Sequência de drills para aquecimento específico de BlackBelt.',
    duration: '09:55',
    category: 'Drills',
    level: 'Iniciante',
    youtubeId: '0QDgz6cD4LQ',
    thumbnail: 'https://img.youtube.com/vi/0QDgz6cD4LQ/maxresdefault.jpg',
    views: 290,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001', 'TUR002', 'TUR005'],
    tags: ['drills', 'aquecimento'],
    criadoEm: '2026-02-01T08:00:00Z',
  },
];

// ── CRUD functions ──

export function getVideosByProfessor(profId: string): Video[] {
  return PROFESSOR_VIDEOS.filter(v => v.criadoPor === profId)
    .sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
}

export function createVideo(profId: string, input: VideoCreateInput): Video {
  const youtubeId = extractYoutubeId(input.youtubeUrl);
  if (!youtubeId) throw new Error('URL do YouTube inválida');

  const video: Video = {
    id: `pv-${++nextId}`,
    title: input.title,
    description: input.description || '',
    duration: '00:00',
    category: input.category,
    level: input.level,
    youtubeId,
    thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
    views: 0,
    instructor: 'Mestre João Silva',
    criadoPor: profId,
    turmasAssociadas: input.turmasAssociadas || [],
    tags: input.tags || [],
    criadoEm: new Date().toISOString(),
  };

  PROFESSOR_VIDEOS.unshift(video);
  return video;
}

export function updateVideo(videoId: string, input: VideoUpdateInput): Video {
  const idx = PROFESSOR_VIDEOS.findIndex(v => v.id === videoId);
  if (idx === -1) throw new Error('Vídeo não encontrado');

  const video = PROFESSOR_VIDEOS[idx];
  if (input.title !== undefined) video.title = input.title;
  if (input.description !== undefined) video.description = input.description;
  if (input.category !== undefined) video.category = input.category;
  if (input.level !== undefined) video.level = input.level;
  if (input.turmasAssociadas !== undefined) video.turmasAssociadas = input.turmasAssociadas;
  if (input.tags !== undefined) video.tags = input.tags;

  return video;
}

export function deleteVideo(videoId: string): void {
  const idx = PROFESSOR_VIDEOS.findIndex(v => v.id === videoId);
  if (idx === -1) throw new Error('Vídeo não encontrado');
  PROFESSOR_VIDEOS.splice(idx, 1);
}
