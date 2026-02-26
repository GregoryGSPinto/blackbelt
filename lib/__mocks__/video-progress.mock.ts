// ============================================================
// Video Progress Mock — Track watched/favorite videos
// ============================================================

export interface WatchRecord {
  videoId: string;
  assistidoEm: string;
  duracao?: string;
}

export interface VideoProgressSummary {
  totalAssistidos: number;
  totalFavoritos: number;
  horasEstimadas: number;
  porCategoria: { categoria: string; assistidos: number; total: number }[];
  playlistProgress: { playlistId: string; assistidos: number; total: number }[];
}

// ── In-memory sets ──

const watchedSet = new Set<string>(['1', '2', '3', '4', 'pv-1', 'pv-4', 'pv-5', '5']);
const favoritesSet = new Set<string>(['1', 'pv-1', 'pv-2']);
const watchHistory: WatchRecord[] = [
  { videoId: 'pv-1', assistidoEm: '2026-02-17T19:30:00Z', duracao: '14:22' },
  { videoId: 'pv-4', assistidoEm: '2026-02-16T20:00:00Z', duracao: '16:10' },
  { videoId: 'pv-5', assistidoEm: '2026-02-15T18:15:00Z', duracao: '09:55' },
  { videoId: '1', assistidoEm: '2026-02-14T19:00:00Z', duracao: '12:30' },
  { videoId: '2', assistidoEm: '2026-02-13T20:30:00Z', duracao: '15:45' },
  { videoId: '3', assistidoEm: '2026-02-12T19:45:00Z', duracao: '10:20' },
  { videoId: '4', assistidoEm: '2026-02-11T18:00:00Z', duracao: '18:15' },
  { videoId: '5', assistidoEm: '2026-02-10T20:00:00Z', duracao: '14:00' },
];

// ── Functions ──

export function markAsWatched(videoId: string): void {
  watchedSet.add(videoId);
  watchHistory.unshift({ videoId, assistidoEm: new Date().toISOString() });
}

export function toggleFavorite(videoId: string): boolean {
  if (favoritesSet.has(videoId)) { favoritesSet.delete(videoId); return false; }
  favoritesSet.add(videoId); return true;
}

export function isWatched(videoId: string): boolean { return watchedSet.has(videoId); }
export function isFavorite(videoId: string): boolean { return favoritesSet.has(videoId); }
export function getWatchedSet(): Set<string> { return new Set(watchedSet); }
export function getFavoritesSet(): Set<string> { return new Set(favoritesSet); }

export function getWatchHistory(limit = 10): WatchRecord[] {
  return watchHistory.slice(0, limit);
}

export function getProgressSummary(): VideoProgressSummary {
  return {
    totalAssistidos: watchedSet.size,
    totalFavoritos: favoritesSet.size,
    horasEstimadas: 2.4,
    porCategoria: [
      { categoria: 'Fundamentos', assistidos: 3, total: 4 },
      { categoria: 'Passagens', assistidos: 2, total: 5 },
      { categoria: 'Finalizações', assistidos: 1, total: 4 },
      { categoria: 'Defesa', assistidos: 2, total: 3 },
      { categoria: 'Drills', assistidos: 1, total: 2 },
    ],
    playlistProgress: [
      { playlistId: 'pl-1', assistidos: 3, total: 4 },
      { playlistId: 'pl-2', assistidos: 2, total: 6 },
      { playlistId: 'pl-3', assistidos: 1, total: 5 },
    ],
  };
}
