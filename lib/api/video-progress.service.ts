/**
 * Video Progress Service — Track watched/favorites
 *
 * TODO(BBOS-Phase-2): implement when feature flag enabled
 */

import { apiClient } from './client';
import { useMock, mockDelay } from '@/lib/env';
import type { VideoProgressSummary, WatchRecord } from '@/lib/__mocks__/video-progress.mock';

export type { VideoProgressSummary, WatchRecord } from '@/lib/__mocks__/video-progress.mock';

async function getMock() {
  return import('@/lib/__mocks__/video-progress.mock');
}

export async function markAsWatched(videoId: string): Promise<void> {
  if (useMock()) { await mockDelay(150); const m = await getMock(); m.markAsWatched(videoId); return; }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  await apiClient.post(`/video-progress/watched/${videoId}`);
}

export async function toggleFavorite(videoId: string): Promise<boolean> {
  if (useMock()) { await mockDelay(150); const m = await getMock(); return m.toggleFavorite(videoId); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.post<{ isFavorite: boolean }>(`/video-progress/favorite/${videoId}`);
  return data.isFavorite;
}

export function isWatched(videoId: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  try { const m = require('@/lib/__mocks__/video-progress.mock'); return m.isWatched(videoId); } catch { return false; }
}

export function isFavorite(videoId: string): boolean {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  try { const m = require('@/lib/__mocks__/video-progress.mock'); return m.isFavorite(videoId); } catch { return false; }
}

export async function getProgressSummary(): Promise<VideoProgressSummary> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getProgressSummary(); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<VideoProgressSummary>('/video-progress/summary');
  return data;
}

export async function getWatchHistory(limit = 10): Promise<WatchRecord[]> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.getWatchHistory(limit); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<WatchRecord[]>(`/video-progress/history?limit=${limit}`);
  return data;
}

export async function getWatchedSet(): Promise<Set<string>> {
  if (useMock()) { const m = await getMock(); return m.getWatchedSet(); }
  // TODO(BBOS-Phase-2): implement when feature flag enabled
  const { data } = await apiClient.get<string[]>('/video-progress/watched');
  return new Set(data);
}
