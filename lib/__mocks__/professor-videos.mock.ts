// ============================================================
// Professor Uploaded Videos Mock — CRUD for uploaded video files
// ============================================================

import type {
  UploadedVideo,
  VideoUploadInput,
  VideoUploadUpdateInput,
} from '@/lib/api/video-provider.types';

// ── In-memory store ──

let nextId = 200;

const UPLOADED_VIDEOS: UploadedVideo[] = [
  {
    id: 'uv-1',
    title: 'Análise de Luta — Regional 2026',
    description: 'Breakdown completo da luta final do Regional, com pontos técnicos e estratégicos.',
    duration: '18:42',
    category: 'Finalizações',
    level: 'Avançado',
    source: 'upload',
    status: 'published',
    contentType: 'analise_luta',
    turmaCategory: 'adulto_avancado',
    visibility: 'public',
    fileUrl: 'https://mock-cdn.blackbelt.app/videos/uv-1/analise-regional.mp4',
    thumbnailUrl: 'https://mock-cdn.blackbelt.app/thumbs/uv-1/thumb.jpg',
    originalFileName: 'analise-regional-2026.mp4',
    fileSizeMB: 245,
    views: 87,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001'],
    tags: ['analise', 'competicao', 'regional'],
    criadoEm: '2026-02-10T14:00:00Z',
    atualizadoEm: '2026-02-10T14:00:00Z',
  },
  {
    id: 'uv-2',
    title: 'Demonstração — Berimbolo Entry',
    description: 'Demonstração detalhada da entrada de berimbolo com variações.',
    duration: '09:15',
    category: 'Passagens',
    level: 'Avançado',
    source: 'upload',
    status: 'published',
    contentType: 'demonstracao',
    turmaCategory: 'adulto_avancado',
    visibility: 'public',
    fileUrl: 'https://mock-cdn.blackbelt.app/videos/uv-2/berimbolo-demo.webm',
    thumbnailUrl: 'https://mock-cdn.blackbelt.app/thumbs/uv-2/thumb.jpg',
    originalFileName: 'berimbolo-entry-demo.webm',
    fileSizeMB: 128,
    views: 142,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001', 'TUR005'],
    tags: ['berimbolo', 'demonstracao', 'avancado'],
    criadoEm: '2026-02-05T10:30:00Z',
    atualizadoEm: '2026-02-06T08:00:00Z',
  },
  {
    id: 'uv-3',
    title: 'Aula — Faixa Branca Semana 8',
    description: 'Conteúdo em preparação para a semana 8 do programa de faixa branca.',
    duration: '22:10',
    category: 'Fundamentos',
    level: 'Iniciante',
    source: 'upload',
    status: 'draft',
    contentType: 'aula',
    turmaCategory: 'adulto_fundamentos',
    visibility: 'private',
    fileUrl: 'https://mock-cdn.blackbelt.app/videos/uv-3/faixa-branca-s8.mp4',
    thumbnailUrl: 'https://mock-cdn.blackbelt.app/thumbs/uv-3/thumb.jpg',
    originalFileName: 'faixa-branca-semana-8.mp4',
    fileSizeMB: 380,
    views: 0,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR002'],
    tags: ['faixa branca', 'fundamentos', 'semana 8'],
    criadoEm: '2026-02-20T16:00:00Z',
    atualizadoEm: '2026-02-20T16:00:00Z',
  },
  {
    id: 'uv-4',
    title: 'Passagem Toreando — Aula Completa',
    description: 'Vídeo recém enviado, ainda em processamento.',
    duration: '15:30',
    category: 'Passagens',
    level: 'Intermediário',
    source: 'upload',
    status: 'processing',
    contentType: 'aula',
    turmaCategory: 'todas',
    visibility: 'public',
    fileUrl: 'https://mock-cdn.blackbelt.app/videos/uv-4/toreando-aula.mp4',
    thumbnailUrl: 'https://mock-cdn.blackbelt.app/thumbs/uv-4/thumb.jpg',
    originalFileName: 'toreando-aula-completa.mp4',
    fileSizeMB: 310,
    views: 0,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: ['TUR001', 'TUR002', 'TUR005'],
    tags: ['toreando', 'passagem', 'aula'],
    criadoEm: '2026-02-25T09:00:00Z',
    atualizadoEm: '2026-02-25T09:00:00Z',
  },
  {
    id: 'uv-5',
    title: 'Aquecimento Específico — Solo Drills',
    description: 'Sequência de solo drills para aquecimento pré-treino. Acesso restrito a professores.',
    duration: '07:45',
    category: 'Drills',
    level: 'Iniciante',
    source: 'upload',
    status: 'published',
    contentType: 'aquecimento',
    turmaCategory: 'todas',
    visibility: 'private',
    fileUrl: 'https://mock-cdn.blackbelt.app/videos/uv-5/solo-drills.mp4',
    thumbnailUrl: 'https://mock-cdn.blackbelt.app/thumbs/uv-5/thumb.jpg',
    originalFileName: 'aquecimento-solo-drills.mp4',
    fileSizeMB: 95,
    views: 23,
    instructor: 'Mestre João Silva',
    criadoPor: 'prof-001',
    turmasAssociadas: [],
    tags: ['aquecimento', 'solo drills', 'professores'],
    criadoEm: '2026-01-28T07:30:00Z',
    atualizadoEm: '2026-02-01T10:00:00Z',
  },
];

// ── CRUD functions ──

export function getUploadedVideosByProfessor(profId: string): UploadedVideo[] {
  return UPLOADED_VIDEOS.filter((v) => v.criadoPor === profId).sort(
    (a, b) => b.criadoEm.localeCompare(a.criadoEm),
  );
}

export function createUploadedVideo(
  profId: string,
  file: { name: string; sizeMB: number },
  input: VideoUploadInput,
  fileUrl: string,
  thumbnailUrl: string,
): UploadedVideo {
  const now = new Date().toISOString();
  const video: UploadedVideo = {
    id: `uv-${++nextId}`,
    title: input.title,
    description: input.description || '',
    duration: '00:00',
    category: input.category,
    level: input.level,
    source: 'upload',
    status: 'processing',
    contentType: input.contentType,
    turmaCategory: input.turmaCategory,
    visibility: input.visibility,
    fileUrl,
    thumbnailUrl,
    originalFileName: file.name,
    fileSizeMB: file.sizeMB,
    views: 0,
    instructor: 'Mestre João Silva',
    criadoPor: profId,
    turmasAssociadas: input.turmasAssociadas || [],
    tags: input.tags || [],
    criadoEm: now,
    atualizadoEm: now,
  };
  UPLOADED_VIDEOS.unshift(video);
  return video;
}

export function updateUploadedVideo(
  videoId: string,
  input: VideoUploadUpdateInput,
): UploadedVideo {
  const idx = UPLOADED_VIDEOS.findIndex((v) => v.id === videoId);
  if (idx === -1) throw new Error('Vídeo não encontrado');

  const video = UPLOADED_VIDEOS[idx];
  if (input.title !== undefined) video.title = input.title;
  if (input.description !== undefined) video.description = input.description;
  if (input.category !== undefined) video.category = input.category;
  if (input.level !== undefined) video.level = input.level;
  if (input.contentType !== undefined) video.contentType = input.contentType;
  if (input.turmaCategory !== undefined) video.turmaCategory = input.turmaCategory;
  if (input.visibility !== undefined) video.visibility = input.visibility;
  if (input.turmasAssociadas !== undefined) video.turmasAssociadas = input.turmasAssociadas;
  if (input.tags !== undefined) video.tags = input.tags;
  video.atualizadoEm = new Date().toISOString();

  return video;
}

export function deleteUploadedVideo(videoId: string): void {
  const idx = UPLOADED_VIDEOS.findIndex((v) => v.id === videoId);
  if (idx === -1) throw new Error('Vídeo não encontrado');
  UPLOADED_VIDEOS.splice(idx, 1);
}

export function getPublicUploadedVideos(): UploadedVideo[] {
  return UPLOADED_VIDEOS.filter(
    (v) => v.status === 'published' && v.visibility === 'public',
  ).sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

export function publishUploadedVideo(videoId: string): UploadedVideo {
  const idx = UPLOADED_VIDEOS.findIndex((v) => v.id === videoId);
  if (idx === -1) throw new Error('Vídeo não encontrado');
  UPLOADED_VIDEOS[idx].status = 'published';
  UPLOADED_VIDEOS[idx].atualizadoEm = new Date().toISOString();
  return UPLOADED_VIDEOS[idx];
}
