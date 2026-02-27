// ============================================================
// Video Provider Types — Abstraction layer for video hosting
// ============================================================

export type VideoSource = 'youtube' | 'upload' | 'vimeo' | 'mux' | 'bunny';

export type VideoStatus = 'processing' | 'published' | 'draft' | 'error';

export type VideoContentType = 'aula' | 'demonstracao' | 'analise_luta' | 'aquecimento' | 'outro';

export type VideoTurmaCategory = 'adulto_fundamentos' | 'adulto_avancado' | 'teen' | 'kids' | 'todas';

export type VideoVisibility = 'public' | 'private';

export interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  source: VideoSource;
  status: VideoStatus;
  contentType: VideoContentType;
  turmaCategory: VideoTurmaCategory;
  visibility: VideoVisibility;
  fileUrl: string;
  thumbnailUrl: string;
  originalFileName: string;
  fileSizeMB: number;
  views: number;
  instructor: string;
  criadoPor: string;
  turmasAssociadas: string[];
  tags: string[];
  criadoEm: string;
  atualizadoEm: string;
}

export interface VideoUploadInput {
  title: string;
  description?: string;
  category: string;
  level: UploadedVideo['level'];
  contentType: VideoContentType;
  turmaCategory: VideoTurmaCategory;
  visibility: VideoVisibility;
  turmasAssociadas?: string[];
  tags?: string[];
}

export interface VideoUploadUpdateInput {
  title?: string;
  description?: string;
  category?: string;
  level?: UploadedVideo['level'];
  contentType?: VideoContentType;
  turmaCategory?: VideoTurmaCategory;
  visibility?: VideoVisibility;
  turmasAssociadas?: string[];
  tags?: string[];
}

export interface VideoProvider {
  upload(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ fileUrl: string; thumbnailUrl: string }>;
  getPlaybackUrl(fileUrl: string): string;
  getThumbnailUrl(fileUrl: string): string;
  delete(fileUrl: string): Promise<void>;
  getStatus(fileUrl: string): Promise<VideoStatus>;
}
