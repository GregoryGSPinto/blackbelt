// ============================================================
// Mock Video Provider — Simulates upload with incremental progress
// ============================================================

import type { VideoProvider, VideoStatus } from '../video-provider.types';

export class MockVideoProvider implements VideoProvider {
  async upload(
    file: File,
    onProgress?: (percent: number) => void,
  ): Promise<{ fileUrl: string; thumbnailUrl: string }> {
    const totalSteps = 10;
    for (let i = 1; i <= totalSteps; i++) {
      await new Promise((r) => setTimeout(r, 200));
      onProgress?.(i * 10);
    }

    const id = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    return {
      fileUrl: `https://mock-cdn.blackbelt.app/videos/${id}/${file.name}`,
      thumbnailUrl: `https://mock-cdn.blackbelt.app/thumbs/${id}/thumb.jpg`,
    };
  }

  getPlaybackUrl(fileUrl: string): string {
    return fileUrl;
  }

  getThumbnailUrl(fileUrl: string): string {
    return fileUrl.replace('/videos/', '/thumbs/').replace(/\.[^.]+$/, '_thumb.jpg');
  }

  async delete(_fileUrl: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 150));
  }

  async getStatus(_fileUrl: string): Promise<VideoStatus> {
    return 'published';
  }
}

let _instance: MockVideoProvider | null = null;

export function getMockVideoProvider(): MockVideoProvider {
  if (!_instance) _instance = new MockVideoProvider();
  return _instance;
}
