'use client';

import { useState, useCallback } from 'react';
import {
  uploadAvatar,
  uploadDocument,
  uploadClassMedia,
  type BUCKETS,
} from '@/lib/supabase/storage';

type UploadType = 'avatar' | 'document' | 'class-media';

interface UseFileUploadReturn {
  upload: (file: File, type: UploadType) => Promise<{ path: string; url: string } | null>;
  uploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useFileUpload(userId: string): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(async (file: File, type: UploadType) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress (Supabase JS doesn't expose upload progress)
      setProgress(30);

      let result: { data: { path: string; url: string } | null; error: string | null };

      switch (type) {
        case 'avatar':
          result = await uploadAvatar(userId, file);
          break;
        case 'document':
          result = await uploadDocument(userId, file);
          break;
        case 'class-media':
          result = await uploadClassMedia(userId, file);
          break;
      }

      setProgress(100);

      if (result.error) {
        setError(result.error);
        return null;
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
      return null;
    } finally {
      setUploading(false);
    }
  }, [userId]);

  return { upload, uploading, progress, error, reset };
}
