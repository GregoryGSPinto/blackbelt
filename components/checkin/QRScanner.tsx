'use client';

// ============================================================
// QRScanner — Scanner de QR Code via câmera
//
// Mock mode: simula decodificação após 2s.
// Prod: usar jsQR ou ZXing via lazy import quando disponível.
//
// Features: viewfinder animado, toggle câmera, flash, vibração, som
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Camera, CameraOff, RefreshCw, Zap, ZapOff, X } from 'lucide-react';
import type { CheckInQR } from '@/lib/api/contracts';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (data: CheckInQR) => void;
  onClose?: () => void;
  mockMode?: boolean;
}

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

// ── Audio feedback via Web Audio API ──
function playBeep(success: boolean) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (success) {
      osc.frequency.value = 880;
      gain.gain.value = 0.15;
      osc.start();
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      osc.stop(ctx.currentTime + 0.15);
    } else {
      osc.frequency.value = 300;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }

    setTimeout(() => ctx.close(), 500);
  } catch {
    // Audio not available — silent
  }
}

function vibrate(pattern: number | number[]) {
  try {
    navigator?.vibrate?.(pattern);
  } catch {
    // Vibration not available
  }
}

// ── Mock QR hash generator (same as QRGenerator) ──
function generateHash(alunoId: string, timestamp: number): string {
  const raw = `${alunoId}:${timestamp}:blackbelt-secret`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(8, '0');
}

export function QRScanner({ onScan, onClose, mockMode = true }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Handle QR detection (moved up for reference) ──
  const handleDetection = useCallback((data: CheckInQR) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setScanState('success');
    playBeep(true);
    vibrate([100, 50, 100]);
    onScan(data);
    setTimeout(() => setScanState('scanning'), 3000);
  }, [onScan]);

  // ── jsQR scan loop ──
  const startScanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const tick = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code?.data) {
          try {
            const parsed = JSON.parse(code.data) as CheckInQR;
            if (parsed.alunoId) {
              handleDetection(parsed);
              return;
            }
          } catch {
            // Not a valid BlackBelt QR, keep scanning
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [handleDetection]);

  // ── Start camera ──
  const startCamera = useCallback(async () => {
    setCameraError('');
    try {
      // Stop previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      setScanState('scanning');

      if (mockMode) {
        // Mock mode: simulate QR detection after 2s
        scanTimeoutRef.current = setTimeout(() => {
          const ts = Date.now();
          const mockAlunos = ['u1', 'u2', 'u3', 'u5', 'u7'];
          const alunoId = mockAlunos[Math.floor(Math.random() * mockAlunos.length)];
          const mockQR: CheckInQR = {
            alunoId, nome: 'Lucas Mendes', unidadeId: 'unit_01',
            timestamp: ts, hash: generateHash(alunoId, ts),
          };
          handleDetection(mockQR);
        }, 2000);
      } else {
        // Real mode: scan video frames with jsQR
        startScanLoop();
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(
        'Não foi possível acessar a câmera. Verifique as permissões do navegador.'
      );
      setCameraActive(false);

      // Fallback: mock scan without camera
      if (mockMode) {
        setScanState('scanning');
        scanTimeoutRef.current = setTimeout(() => {
          const ts = Date.now();
          const mockQR: CheckInQR = {
            alunoId: 'u1',
            nome: 'Lucas Mendes',
            unidadeId: 'unit_01',
            timestamp: ts,
            hash: generateHash('u1', ts),
          };
          handleDetection(mockQR);
        }, 2000);
      }
    }
  }, [facingMode, mockMode]);

  // ── Stop camera on unmount ──
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      }
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // ── Toggle camera facing ──
  const toggleCamera = useCallback(() => {
    setFacingMode((prev: 'environment' | 'user') => prev === 'environment' ? 'user' : 'environment');
  }, []);

  // Restart camera when facing changes
  useEffect(() => {
    if (cameraActive || scanState === 'scanning') {
      startCamera();
    }
  }, [facingMode]);

  // ── Toggle flash ──
  const toggleFlash = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const capabilities = track.getCapabilities?.() as { torch?: boolean } | undefined;
      if (capabilities?.torch) {
        const newFlash = !flashOn;
        await track.applyConstraints({ advanced: [{ torch: newFlash } as MediaTrackConstraintSet] });
        setFlashOn(newFlash);
      }
    } catch {
      // Flash not supported
    }
  }, [flashOn]);

  // ── Rescan ──
  const handleRescan = useCallback(() => {
    setScanState('idle');
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    startCamera();
  }, [startCamera]);

  const stateColors: Record<ScanState, string> = {
    idle: 'border-white/30',
    scanning: 'border-blue-400/60',
    success: 'border-green-400',
    error: 'border-red-400',
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Hidden canvas for jsQR frame processing */}
      <canvas ref={canvasRef} className="hidden" />
      {/* Camera Viewfinder */}
      <div className={`relative aspect-square rounded-2xl overflow-hidden border-2 ${stateColors[scanState as ScanState]} transition-colors duration-500`}>
        {/* Video feed */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Overlay when no camera */}
        {!cameraActive && !cameraError && scanState === 'idle' && (
          <div className="absolute inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Camera size={36} className="text-white/40" />
            </div>
            <p className="text-white/50 text-sm text-center px-6">
              Aponte a câmera para o QR Code do aluno
            </p>
            <button
              onClick={startCamera}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Iniciar Scanner
            </button>
          </div>
        )}

        {/* Camera error fallback */}
        {cameraError && (
          <div className="absolute inset-0 bg-[#0d0d1a] flex flex-col items-center justify-center gap-3 p-6">
            <CameraOff size={36} className="text-yellow-400/60" />
            <p className="text-white/50 text-sm text-center">{cameraError}</p>
            {mockMode && scanState === 'scanning' && (
              <div className="flex items-center gap-2 text-blue-400 text-xs">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Simulando leitura QR...
              </div>
            )}
          </div>
        )}

        {/* Viewfinder frame (animated corners) */}
        {(scanState === 'scanning' || scanState === 'success') && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Scan area overlay */}
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-[15%] bg-transparent rounded-xl"
              style={{
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)',
              }}
            />

            {/* Animated corners */}
            <div className="absolute inset-[15%]">
              {/* Top-left */}
              <div className={`absolute -top-0.5 -left-0.5 w-8 h-8 border-t-3 border-l-3 rounded-tl-lg transition-colors duration-500 ${
                scanState === 'success' ? 'border-green-400' : 'border-white'
              }`} />
              {/* Top-right */}
              <div className={`absolute -top-0.5 -right-0.5 w-8 h-8 border-t-3 border-r-3 rounded-tr-lg transition-colors duration-500 ${
                scanState === 'success' ? 'border-green-400' : 'border-white'
              }`} />
              {/* Bottom-left */}
              <div className={`absolute -bottom-0.5 -left-0.5 w-8 h-8 border-b-3 border-l-3 rounded-bl-lg transition-colors duration-500 ${
                scanState === 'success' ? 'border-green-400' : 'border-white'
              }`} />
              {/* Bottom-right */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-8 h-8 border-b-3 border-r-3 rounded-br-lg transition-colors duration-500 ${
                scanState === 'success' ? 'border-green-400' : 'border-white'
              }`} />

              {/* Scanning line animation */}
              {scanState === 'scanning' && (
                <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan-line" />
              )}
            </div>

            {/* Success overlay */}
            {scanState === 'success' && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-fade-in">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border-2 border-green-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round">
                    <path d="M5 12l5 5L20 7" className="animate-check-draw" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-4">
        <button
          onClick={toggleCamera}
          disabled={!cameraActive}
          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center transition-all"
          title="Trocar câmera"
        >
          <RefreshCw size={18} className="text-white/70" />
        </button>

        <button
          onClick={handleRescan}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2"
        >
          <Camera size={16} />
          {scanState === 'idle' ? 'Iniciar' : 'Escanear novamente'}
        </button>

        <button
          onClick={toggleFlash}
          disabled={!cameraActive}
          className="w-12 h-12 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-30 flex items-center justify-center transition-all"
          title="Flash"
        >
          {flashOn ? (
            <Zap size={18} className="text-yellow-400" />
          ) : (
            <ZapOff size={18} className="text-white/70" />
          )}
        </button>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all z-10"
        >
          <X size={18} className="text-white/70" />
        </button>
      )}

      {/* Status text */}
      <p className={`text-center text-sm mt-3 transition-colors duration-300 ${
        scanState === 'success' ? 'text-green-400 font-bold' :
        scanState === 'scanning' ? 'text-blue-400' :
        'text-white/40'
      }`}>
        {scanState === 'idle' && 'Pressione iniciar para escanear'}
        {scanState === 'scanning' && 'Procurando QR Code...'}
        {scanState === 'success' && 'QR Code detectado!'}
        {scanState === 'error' && 'Erro ao ler QR Code'}
      </p>

      <style jsx>{`
        @keyframes scan-line {
          0%, 100% { top: 5%; }
          50% { top: 90%; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
          position: absolute;
        }
        @keyframes check-draw {
          from { stroke-dashoffset: 30; }
          to { stroke-dashoffset: 0; }
        }
        .animate-check-draw {
          stroke-dasharray: 30;
          animation: check-draw 0.4s ease-out forwards;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default QRScanner;
