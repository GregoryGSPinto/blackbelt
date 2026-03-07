// ============================================================
// Content Service — Unit Tests
// ============================================================
// Types validated against lib/__mocks__/content.mock.ts:
//   Video: { id, title, description, thumbnail, category, level, ... }
//   Serie: { id, title, videos: Video[], thumbnail, totalDuration }
// Filter: getVideos({ category?: string; level?: string; search?: string })
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  getVideos,
  getSeries,
  getTop10,
  getVideoById,
  getRelatedVideos,
} from '@/lib/api/content.service';

describe('Content Service (mock mode)', () => {
  describe('getVideos', () => {
    it('returns array of videos', async () => {
      const videos = await getVideos();
      expect(Array.isArray(videos)).toBe(true);
      expect(videos.length).toBeGreaterThan(0);
    });

    it('each video has required fields', async () => {
      const videos = await getVideos();
      for (const v of videos.slice(0, 5)) {
        expect(v.id).toBeTruthy();
        expect(v.title).toBeTruthy();
        expect(v.thumbnail).toBeTruthy();
      }
    });

    it('supports category filter', async () => {
      const all = await getVideos();
      const guarda = await getVideos({ category: 'Guarda' });

      expect(guarda.length).toBeLessThanOrEqual(all.length);
      for (const v of guarda) {
        expect(v.category).toBe('Guarda');
      }
    });

    it('supports search filter', async () => {
      const results = await getVideos({ search: 'guarda' });
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('getSeries', () => {
    it('returns array of series', async () => {
      const series = await getSeries();
      expect(Array.isArray(series)).toBe(true);
      expect(series.length).toBeGreaterThan(0);
    });

    it('each serie has title and videos array', async () => {
      const series = await getSeries();
      for (const s of series.slice(0, 3)) {
        expect(s.title).toBeTruthy();
        expect(Array.isArray(s.videos)).toBe(true);
        expect(s.videos.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getTop10', () => {
    it('returns top videos list', async () => {
      const top = await getTop10();
      expect(Array.isArray(top)).toBe(true);
      expect(top.length).toBeGreaterThan(0);
    });
  });

  describe('getVideoById', () => {
    it('returns video for valid id', async () => {
      const videos = await getVideos();
      const first = videos[0];
      const found = await getVideoById(first.id);
      expect(found).not.toBeNull();
      expect(found!.id).toBe(first.id);
    });

    it('returns null for invalid id', async () => {
      const found = await getVideoById('non-existent-id-xyz');
      expect(found).toBeNull();
    });
  });

  describe('getRelatedVideos', () => {
    it('returns related videos excluding source', async () => {
      const videos = await getVideos();
      if (videos.length < 2) return;

      const source = videos[0];
      const related = await getRelatedVideos(source, 4);

      expect(related.length).toBeLessThanOrEqual(4);
      expect(related.find((v) => v.id === source.id)).toBeUndefined();
    });
  });
});
