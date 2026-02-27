/**
 * Video Upload Service — Upload, CRUD, and listing for uploaded videos
 *
 * MOCK:  useMock() === true → dados de __mocks__/professor-videos.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-150): Implementar endpoints de upload de vídeos
 *   GET    /professor/videos/uploaded       (listar vídeos enviados)
 *   POST   /professor/videos/upload         (upload de arquivo)
 *   PUT    /professor/videos/uploaded/:id   (atualizar metadados)
 *   DELETE /professor/videos/uploaded/:id   (excluir vídeo)
 *   GET    /content/videos/uploaded         (vídeos públicos para alunos)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type {
  UploadedVideo,
  VideoUploadInput,
  VideoUploadUpdateInput,
} from './video-provider.types';

export type { UploadedVideo, VideoUploadInput, VideoUploadUpdateInput };

async function getMock() {
  return import('@/lib/__mocks__/professor-videos.mock');
}

async function getProvider() {
  const { getMockVideoProvider } = await import('./providers/mock-video-provider');
  return getMockVideoProvider();
}

export async function getUploadedVideos(profId: string): Promise<UploadedVideo[]> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    return mock.getUploadedVideosByProfessor(profId);
  }
  const { data } = await apiClient.get<UploadedVideo[]>(
    `/professor/videos/uploaded?profId=${profId}`,
  );
  return data;
}

export async function uploadVideo(
  profId: string,
  file: File,
  thumbnail: File | null,
  input: VideoUploadInput,
  onProgress?: (percent: number) => void,
): Promise<UploadedVideo> {
  if (useMock()) {
    const provider = await getProvider();
    const result = await provider.upload(file, onProgress);
    await mockDelay(200);
    const mock = await getMock();
    const video = mock.createUploadedVideo(
      profId,
      { name: file.name, sizeMB: Math.round(file.size / (1024 * 1024)) },
      input,
      result.fileUrl,
      thumbnail ? result.thumbnailUrl : result.thumbnailUrl,
    );
    // Simulate auto-publish after a short delay in mock mode
    setTimeout(async () => {
      try {
        const m = await getMock();
        m.publishUploadedVideo(video.id);
      } catch { /* ignore if already deleted */ }
    }, 3000);
    return video;
  }

  const formData = new FormData();
  formData.append('file', file);
  if (thumbnail) formData.append('thumbnail', thumbnail);
  formData.append('profId', profId);
  formData.append('input', JSON.stringify(input));

  const { data } = await apiClient.post<UploadedVideo>(
    '/professor/videos/upload',
    formData,
  );
  return data;
}

export async function updateUploadedVideo(
  videoId: string,
  input: VideoUploadUpdateInput,
): Promise<UploadedVideo> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    return mock.updateUploadedVideo(videoId, input);
  }
  const { data } = await apiClient.put<UploadedVideo>(
    `/professor/videos/uploaded/${videoId}`,
    input,
  );
  return data;
}

export async function deleteUploadedVideo(videoId: string): Promise<void> {
  if (useMock()) {
    await mockDelay(250);
    const mock = await getMock();
    return mock.deleteUploadedVideo(videoId);
  }
  await apiClient.delete(`/professor/videos/uploaded/${videoId}`);
}

export async function getPublicVideos(): Promise<UploadedVideo[]> {
  if (useMock()) {
    await mockDelay(200);
    const mock = await getMock();
    return mock.getPublicUploadedVideos();
  }
  const { data } = await apiClient.get<UploadedVideo[]>('/content/videos/uploaded');
  return data;
}
