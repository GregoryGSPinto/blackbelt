/**
 * Playlist Service
 *
 * MOCK:  useMock() === true → dados de __mocks__/playlist.mock.ts
 * PROD:  useMock() === false → apiClient
 *
 * TODO(BE-121): Implementar endpoints de playlists
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { Playlist, PlaylistCreateInput } from '@/lib/__mocks__/playlist.mock';

export type { Playlist, PlaylistCreateInput } from '@/lib/__mocks__/playlist.mock';

async function getMock() {
  return import('@/lib/__mocks__/playlist.mock');
}

export async function getPlaylistsByProfessor(profId: string): Promise<Playlist[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getPlaylistsByProfessor(profId); }
  return apiClient.get<Playlist[]>(`/playlists?profId=${profId}`).then(r => r.data);
}

export async function getPlaylistsForAluno(alunoId: string): Promise<Playlist[]> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getPlaylistsForAluno(alunoId); }
  return apiClient.get<Playlist[]>(`/playlists/aluno/${alunoId}`).then(r => r.data);
}

export async function createPlaylist(profId: string, input: PlaylistCreateInput): Promise<Playlist> {
  if (useMock()) { await mockDelay(350); const m = await getMock(); return m.createPlaylist(profId, input); }
  return apiClient.post<Playlist>('/playlists', { ...input, profId }).then(r => r.data);
}

export async function updatePlaylist(id: string, input: PlaylistCreateInput): Promise<Playlist> {
  if (useMock()) {
    await mockDelay(300);
    // Mock: return updated playlist
    return { id, ...input, profId: 'prof-001', criadaEm: new Date().toLocaleDateString('pt-BR') } as Playlist;
  }
  return apiClient.put<Playlist>(`/playlists/${id}`, input).then(r => r.data);
}

export async function deletePlaylist(id: string): Promise<void> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.deletePlaylist(id); }
  await apiClient.delete(`/playlists/${id}`);
}

export async function addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.addVideoToPlaylist(playlistId, videoId); }
  await apiClient.post(`/playlists/${playlistId}/videos`, { videoId });
}

export async function removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.removeVideoFromPlaylist(playlistId, videoId); }
  await apiClient.delete(`/playlists/${playlistId}/videos/${videoId}`);
}
