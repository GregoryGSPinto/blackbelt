'use client';

import { useState, useRef, useCallback } from 'react';

export function useCamera() {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const closeCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  const openCamera = useCallback(async (): Promise<string | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
      return null;
    } catch {
      return 'Não foi possível acessar a câmera. Verifique as permissões.';
    }
  }, []);

  const capturePhoto = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const v = videoRef.current;
    const c = canvasRef.current;
    const size = Math.min(v.videoWidth, v.videoHeight);
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d')!;
    const ox = (v.videoWidth - size) / 2;
    const oy = (v.videoHeight - size) / 2;
    ctx.drawImage(v, ox, oy, size, size, 0, 0, size, size);
    const dataUrl = c.toDataURL('image/jpeg', 0.85);
    closeCamera();
    return dataUrl;
  }, [closeCamera]);

  return {
    showCamera,
    videoRef,
    canvasRef,
    openCamera,
    capturePhoto,
    closeCamera,
  };
}
