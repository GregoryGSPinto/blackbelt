/**
 * Video Progress Service — Track watched/favorites
 *
 * TODO(BE-122): Implementar endpoints de progresso de vídeos
 */

import { useMock, mockDelay } from '@/lib/env';
import type { VideoProgressSummary, WatchRecord } from '@/lib/__mocks__/video-progress.mock';

export type { VideoProgressSummary, WatchRecord } from '@/lib/__mocks__/video-progress.mock';

async function getMock() {
  return import('@/lib/__mocks__/video-progress.mock');
}

export async function markAsWatched(videoId: string): Promise<void> {
  if (useMock()) { await mockDelay(150); const m = await getMock(); m.markAsWatched(videoId); return; }
}

export async function toggleFavorite(videoId: string): Promise<boolean> {
  if (useMock()) { await mockDelay(150); const m = await getMock(); return m.toggleFavorite(videoId); }
  return false;
}

export function isWatched(videoId: string): boolean {
  try { const m = require('@/lib/__mocks__/video-progress.mock'); return m.isWatched(videoId); } catch { return false; }
}

export function isFavorite(videoId: string): boolean {
  try { const m = require('@/lib/__mocks__/video-progress.mock'); return m.isFavorite(videoId); } catch { return false; }
}

export async function getProgressSummary(): Promise<VideoProgressSummary> {
  if (useMock()) { await mockDelay(250); const m = await getMock(); return m.getProgressSummary(); }
  return { totalAssistidos: 0, totalFavoritos: 0, horasEstimadas: 0, porCategoria: [], playlistProgress: [] };
}

export async function getWatchHistory(limit = 10): Promise<WatchRecord[]> {
  if (useMock()) { await mockDelay(200); const m = await getMock(); return m.getWatchHistory(limit); }
  return [];
}

export async function getWatchedSet(): Promise<Set<string>> {
  if (useMock()) { const m = await getMock(); return m.getWatchedSet(); }
  return new Set();
}
