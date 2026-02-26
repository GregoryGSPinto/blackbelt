'use client';

import { useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { ErrorAlert } from './ErrorAlert';
import { AVATARES } from './constants';
import { useCamera } from './useCamera';
import type { DadosUsuario, StepBaseProps } from './types';

interface StepAvatarProps extends StepBaseProps {
  dados: DadosUsuario;
  setDados: (d: DadosUsuario) => void;
  onContinue: () => void;
}

export function StepAvatar({ dados, setDados, onContinue, error, setError }: StepAvatarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { showCamera, videoRef, canvasRef, openCamera, capturePhoto, closeCamera } = useCamera();

  const selectAvatar = (av: string) => {
    setDados({ ...dados, avatar: av, avatarFile: undefined });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => {
        setDados({ ...dados, avatarFile: r.result as string, avatar: undefined });
      };
      r.readAsDataURL(file);
    }
  };

  const handleOpenCamera = async () => {
    const err = await openCamera();
    if (err) setError(err);
  };

  const handleCapture = () => {
    const dataUrl = capturePhoto();
    if (dataUrl) {
      setDados({ ...dados, avatarFile: dataUrl, avatar: undefined });
    }
  };

  const perfilKey = dados.perfilAutomatico || 'adulto';

  return (
    <div className="space-y-6">
      {/* Indicação de perfil */}
      {dados.idade && (
        <div className="text-center mb-2">
          <p className="text-white/70">
            Seu perfil: <span className="font-bold text-white">
              {dados.perfilAutomatico === 'adulto' ? 'Adulto' :
               dados.perfilAutomatico === 'adolescente' ? 'Adolescente' : 'Kids'}
            </span>
          </p>
          <p className="text-sm text-white/50 mt-1">Baseado na sua idade ({dados.idade} anos)</p>
        </div>
      )}

      {/* Preview do avatar selecionado */}
      {(dados.avatar || dados.avatarFile) && (
        <div className="flex justify-center mb-6">
          <div className="relative">
            {dados.avatarFile ? (
              <img src={dados.avatarFile} alt="Avatar" className="w-32 h-32 rounded-full object-cover border-4 border-white/20" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center text-6xl">
                {dados.avatar}
              </div>
            )}
            <button onClick={() => setDados({ ...dados, avatar: undefined, avatarFile: undefined })}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600">
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Grid de emojis */}
      {!dados.avatarFile && (
        <div>
          <p className="text-sm text-white/70 mb-3 text-center">Escolha um avatar:</p>
          <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
            {AVATARES[perfilKey].map(e => (
              <button key={e} onClick={() => selectAvatar(e)}
                className={`aspect-square rounded-xl border-2 text-4xl md:text-5xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                  dados.avatar === e ? 'border-white bg-white/20 shadow-lg' : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Foto / Upload */}
      <div className="space-y-3 pt-6 border-t border-white/10">
        <p className="text-sm text-white/60 text-center mb-3">Ou use sua própria foto:</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={handleOpenCamera}
            className="py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Camera size={18} /> Tirar Foto
          </button>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm font-medium">
            <Upload size={18} /> Escolher Arquivo
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>

        {/* Camera viewfinder overlay */}
        {showCamera && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md aspect-square">
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-full object-cover rounded-2xl"
                style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 rounded-full border-2 border-white/40" />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-8">
              <button onClick={closeCamera}
                className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <X size={24} className="text-white" />
              </button>
              <button onClick={handleCapture}
                className="w-20 h-20 rounded-full bg-white border-4 border-white/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                <div className="w-16 h-16 rounded-full bg-white border-2 border-black/10" />
              </button>
              <div className="w-14" />
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      <ErrorAlert message={error} />
      <button onClick={onContinue} className="w-full py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all">
        Continuar
      </button>
    </div>
  );
}
