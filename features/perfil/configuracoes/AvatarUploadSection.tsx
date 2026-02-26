// ============================================================
// AvatarUploadSection — Avatar upload within profile settings
// ============================================================
'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Check, Loader2, User } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

const AVATARES_PREDEFINIDOS = [
  '/blackbelt-lion-logo.png',
  '/blackbelt-badge.png',
  '/blackbelt-logo-circle.jpg',
];

const STORAGE_KEY = 'blackbelt_user_avatar';

function getStoredAvatar(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

export function AvatarUploadSection() {
  const { user } = useAuth();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(getStoredAvatar);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Imagem deve ter no máximo 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }, [toast]);

  const selectPreset = useCallback((url: string) => {
    setPreview(url);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      localStorage.setItem(STORAGE_KEY, preview);
      setCurrentAvatar(preview);
      setPreview(null);
      toast.success('Foto atualizada!');
    } catch {
      toast.error('Erro ao salvar foto.');
    } finally {
      setSaving(false);
    }
  }, [preview, toast]);

  const handleCancel = useCallback(() => {
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const displayImage = preview || currentAvatar;

  return (
    <div className="space-y-5">
      <SectionHeader title="Foto de Perfil" description="Personalize sua foto de avatar" />

      {/* Current / Preview avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
            {displayImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={displayImage} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-white/20" />
            )}
          </div>
          {preview && (
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">NEW</span>
            </div>
          )}
        </div>

        {user?.name && (
          <p className="text-white/60 text-sm">{user.name}</p>
        )}
      </div>

      {/* Action buttons */}
      {!preview ? (
        <div className="flex gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                       bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Enviar foto da galeria"
          >
            <Upload size={16} /> Galeria
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                       bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Tirar foto com câmera"
          >
            <Camera size={16} /> Câmera
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                       bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            aria-label="Cancelar alteração de foto"
          >
            <X size={16} /> Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium
                       bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-500 hover:to-green-400
                       disabled:opacity-40 transition-all"
            aria-label="Confirmar nova foto"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {saving ? 'Salvando...' : 'Confirmar'}
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" aria-hidden="true" />

      {/* Preset avatars */}
      <div>
        <p className="text-xs text-white/30 mb-3">Ou escolha um avatar:</p>
        <div className="flex gap-3 justify-center">
          {AVATARES_PREDEFINIDOS.map((av, i) => (
            <button
              key={i}
              onClick={() => selectPreset(av)}
              className={`w-14 h-14 rounded-full overflow-hidden border-2 transition-all hover:scale-110
                ${preview === av ? 'border-blue-400 ring-2 ring-blue-400/30' : 'border-white/10 hover:border-white/25'}`}
              aria-label={`Selecionar avatar ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={av} alt={`Avatar ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
