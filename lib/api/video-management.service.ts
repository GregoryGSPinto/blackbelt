/**
 * Video Management Service — Professor CRUD
 *
 * MOCK:  useMock() === true → dados de __mocks__/video-management.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-120): Implementar endpoints de gestão de vídeos
 *   GET    /professor/videos          (listar vídeos do instrutor)
 *   POST   /professor/videos          (criar vídeo)
 *   PUT    /professor/videos/:id      (atualizar vídeo)
 *   DELETE /professor/videos/:id      (excluir vídeo)
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Video } from '@/lib/__mocks__/content.mock';
import type { VideoCreateInput, VideoUpdateInput } from '@/lib/__mocks__/video-management.mock';

export type { Video } from '@/lib/__mocks__/content.mock';
export type { VideoCreateInput, VideoUpdateInput, VideoCategory } from '@/lib/__mocks__/video-management.mock';
export { extractYoutubeId } from '@/lib/__mocks__/video-management.mock';

async function getMock() {
  return import('@/lib/__mocks__/video-management.mock');
}

export async function getVideosByProfessor(profId: string): Promise<Video[]> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    return mock.getVideosByProfessor(profId);
  }
  const { data } = await apiClient.get<Video[]>(`/professor/videos?profId=${profId}`);
  return data;
}

export async function createVideo(profId: string, input: VideoCreateInput): Promise<Video> {
  if (useMock()) {
    await mockDelay(400);
    const mock = await getMock();
    return mock.createVideo(profId, input);
  }
  const { data } = await apiClient.post<Video>('/professor/videos', { ...input, profId });
  return data;
}

export async function updateVideo(videoId: string, input: VideoUpdateInput): Promise<Video> {
  if (useMock()) {
    await mockDelay(300);
    const mock = await getMock();
    return mock.updateVideo(videoId, input);
  }
  const { data } = await apiClient.put<Video>(`/professor/videos/${videoId}`, input);
  return data;
}

export async function deleteVideo(videoId: string): Promise<void> {
  if (useMock()) {
    await mockDelay(250);
    const mock = await getMock();
    return mock.deleteVideo(videoId);
  }
  await apiClient.delete(`/professor/videos/${videoId}`);
}
