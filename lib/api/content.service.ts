/**
 * Content Service — Vídeos e séries da BlackBelt
 *
 * MOCK:  useMock() === true → retorna dados de __mocks__/content.mock.ts
 * PROD:  useMock() === false → chama apiClient
 *
 * TODO(BE-011): Implementar endpoints content
 *   GET /content/videos?category=&level=&search=
 *   GET /content/series
 *   GET /content/top10
 *   GET /content/videos/:id
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Video, Serie } from '@/lib/__mocks__/content.mock';

// Re-export types para UI consumir via service
export type { Video, Serie };

// ── Mock helpers (lazy import) ────────────────────────────

async function getMockModule() {
  return import('@/lib/__mocks__/content.mock');
}

// ── Service functions ─────────────────────────────────────

export async function getVideos(filters?: {
  category?: string;
  level?: Video['level'];
  search?: string;
}): Promise<Video[]> {
  if (useMock()) {
    await mockDelay();
    const { mockVideos, getVideosByCategory, getVideosByLevel } = await getMockModule();

    // Merge public uploaded videos into the content feed
    const { getPublicUploadedVideos } = await import('@/lib/__mocks__/professor-videos.mock');
    const publicUploads = getPublicUploadedVideos();
    const uploadedAsVideos: Video[] = publicUploads.map(uv => ({
      id: uv.id,
      title: uv.title,
      description: uv.description,
      duration: uv.duration,
      category: uv.category,
      level: uv.level,
      youtubeId: '',
      thumbnail: uv.thumbnailUrl,
      views: uv.views,
      instructor: uv.instructor,
      criadoPor: uv.criadoPor,
      turmasAssociadas: uv.turmasAssociadas,
      tags: uv.tags,
      criadoEm: uv.criadoEm,
    }));

    const allVideos = [...mockVideos, ...uploadedAsVideos];

    if (filters?.category) return allVideos.filter(v => v.category === filters.category);
    if (filters?.level) return allVideos.filter(v => v.level === filters.level);
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      return allVideos.filter(v =>
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term)
      );
    }
    return allVideos;
  }

  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.level) params.set('level', filters.level);
  if (filters?.search) params.set('search', filters.search);
  const { data } = await apiClient.get<Video[]>(`/content/videos?${params}`);
  return data;
}

export async function getSeries(): Promise<Serie[]> {
  if (useMock()) {
    await mockDelay();
    const { mockSeries } = await getMockModule();
    return [...mockSeries];
  }
  const { data } = await apiClient.get<Serie[]>('/content/series');
  return data;
}

export async function getTop10(): Promise<Video[]> {
  if (useMock()) {
    await mockDelay();
    const { top10Videos } = await getMockModule();
    return [...top10Videos];
  }
  const { data } = await apiClient.get<Video[]>('/content/top10');
  return data;
}

export async function getVideoById(id: string): Promise<Video | null> {
  if (useMock()) {
    await mockDelay(100);
    const { mockVideos } = await getMockModule();
    return mockVideos.find(v => v.id === id) || null;
  }
  const { data } = await apiClient.get<Video>(`/content/videos/${id}`);
  return data;
}

export async function getRelatedVideos(video: Video, limit = 8): Promise<Video[]> {
  if (useMock()) {
    await mockDelay(100);
    const { mockVideos } = await getMockModule();
    const sameCategory = mockVideos.filter(v => v.id !== video.id && v.category === video.category);
    const sameInstructor = mockVideos.filter(v => v.id !== video.id && v.instructor === video.instructor && v.category !== video.category);
    const others = mockVideos.filter(v => v.id !== video.id && v.category !== video.category && v.instructor !== video.instructor);
    return [...sameCategory, ...sameInstructor, ...others].slice(0, limit);
  }
  const { data } = await apiClient.get<Video[]>(`/content/videos/${video.id}/related?limit=${limit}`);
  return data;
}
