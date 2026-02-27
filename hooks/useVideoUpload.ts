'use client';

import { useState, useCallback, useRef } from 'react';
import type { UploadedVideo, VideoUploadInput } from '@/lib/api/video-provider.types';

// ── Types ──

export type UploadPhase = 'idle' | 'validating' | 'uploading' | 'processing' | 'done' | 'error';

const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB
const MAX_THUMB_SIZE = 5 * 1024 * 1024; // 5 MB

interface UseVideoUploadReturn {
  phase: UploadPhase;
  progress: number;
  error: string | null;
  uploadedVideo: UploadedVideo | null;
  startUpload: (
    profId: string,
    file: File,
    thumbnail: File | null,
    input: VideoUploadInput,
  ) => Promise<void>;
  reset: () => void;
  abort: () => void;
}

// ── Hook ──

export function useVideoUpload(): UseVideoUploadReturn {
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const abortedRef = useRef(false);

  const reset = useCallback(() => {
    setPhase('idle');
    setProgress(0);
    setError(null);
    setUploadedVideo(null);
    abortedRef.current = false;
  }, []);

  const abort = useCallback(() => {
    abortedRef.current = true;
    setPhase('idle');
    setProgress(0);
  }, []);

  const startUpload = useCallback(
    async (
      profId: string,
      file: File,
      thumbnail: File | null,
      input: VideoUploadInput,
    ) => {
      abortedRef.current = false;
      setError(null);
      setUploadedVideo(null);

      // ── Validation phase ──
      setPhase('validating');
      setProgress(0);

      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setError('Formato não suportado. Use .mp4, .mov ou .webm');
        setPhase('error');
        return;
      }

      if (file.size > MAX_VIDEO_SIZE) {
        setError('Arquivo muito grande. Máximo: 2 GB');
        setPhase('error');
        return;
      }

      if (thumbnail) {
        if (!ALLOWED_IMAGE_TYPES.includes(thumbnail.type)) {
          setError('Thumbnail deve ser JPG, PNG ou WebP');
          setPhase('error');
          return;
        }
        if (thumbnail.size > MAX_THUMB_SIZE) {
          setError('Thumbnail muito grande. Máximo: 5 MB');
          setPhase('error');
          return;
        }
      }

      if (!input.title.trim()) {
        setError('Título é obrigatório');
        setPhase('error');
        return;
      }

      // ── Upload phase ──
      setPhase('uploading');

      try {
        const { uploadVideo } = await import('@/lib/api/video-upload.service');

        const video = await uploadVideo(
          profId,
          file,
          thumbnail,
          input,
          (percent) => {
            if (abortedRef.current) return;
            setProgress(percent);
          },
        );

        if (abortedRef.current) return;

        // ── Processing phase ──
        setPhase('processing');
        setProgress(100);

        // Short delay to show processing state
        await new Promise((r) => setTimeout(r, 800));

        if (abortedRef.current) return;

        // ── Done ──
        setPhase('done');
        setUploadedVideo(video);
      } catch (err) {
        if (abortedRef.current) return;
        setError(err instanceof Error ? err.message : 'Erro ao enviar vídeo');
        setPhase('error');
      }
    },
    [],
  );

  return { phase, progress, error, uploadedVideo, startUpload, reset, abort };
}
