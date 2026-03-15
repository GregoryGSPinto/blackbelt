// ============================================================
// VideoFormModal — Add/Edit video modal for professors
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Play, Upload, Loader2, AlertCircle } from 'lucide-react';
import * as videoMgmt from '@/lib/api/video-management.service';
import type { Video } from '@/lib/__mocks__/content.mock';
import type { VideoCreateInput } from '@/lib/__mocks__/video-management.mock';
import { useTranslations } from 'next-intl';

// ── Types ──

interface VideoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (video: Video) => void;
  editVideo?: Video | null;
  turmas?: { id: string; nome: string }[];
  profId: string;
}

const CATEGORIES = ['Fundamentos', 'Passagens', 'Finalizações', 'Defesa', 'Drills', 'Guarda'];
const LEVELS: Video['level'][] = ['Iniciante', 'Intermediário', 'Avançado'];
const YT_REGEX = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;

// ── Component ──

export function VideoFormModal({ isOpen, onClose, onSaved, editVideo, turmas = [], profId }: VideoFormModalProps) {
  const tActions = useTranslations('common.actions');
  const isEdit = !!editVideo;

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<Video['level']>('Iniciante');
  const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill for edit
  useEffect(() => {
    if (editVideo) {
      setUrl(`https://youtube.com/watch?v=${editVideo.youtubeId}`);
      setTitle(editVideo.title);
      setDescription(editVideo.description);
      setCategory(editVideo.category);
      setLevel(editVideo.level);
      setSelectedTurmas(editVideo.turmasAssociadas || []);
    } else {
      setUrl('');
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      setLevel('Iniciante');
      setSelectedTurmas([]);
    }
    setError('');
  }, [editVideo, isOpen]);

  // Extract youtubeId from URL
  const youtubeId = url.match(YT_REGEX)?.[1] || null;

  const toggleTurma = useCallback((id: string) => {
    setSelectedTurmas((prev: string[]) =>
      prev.includes(id) ? prev.filter((t: string) => t !== id) : [...prev, id]
    );
  }, []);

  const handleSave = async () => {
    // Validate
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    if (!isEdit && !youtubeId) { setError('URL do YouTube inválida'); return; }

    setSaving(true);
    setError('');
    try {
      let saved: Video;
      if (isEdit && editVideo) {
        saved = await videoMgmt.updateVideo(editVideo.id, {
          title: title.trim(),
          description: description.trim(),
          category,
          level,
          turmasAssociadas: selectedTurmas,
        });
      } else {
        const input: VideoCreateInput = {
          title: title.trim(),
          description: description.trim(),
          youtubeUrl: url,
          category,
          level,
          turmasAssociadas: selectedTurmas,
        };
        saved = await videoMgmt.createVideo(profId, input);
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl"
        style={{
          background: 'rgba(20,20,30,0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-white/[0.06]"
          style={{ background: 'rgba(20,20,30,0.98)' }}
        >
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white/80">
              {isEdit ? 'Editar Vídeo' : 'Adicionar Vídeo'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={16} className="text-white/40" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* YouTube URL */}
          <div>
            <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
              URL do YouTube
            </label>
            <input
              type="url"
              value={url}
              onChange={(e: { target: { value: string } }) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              disabled={isEdit}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/20 transition-colors disabled:opacity-40"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {/* YouTube Preview */}
          {youtubeId && (
            <div className="rounded-xl overflow-hidden border border-white/[0.06]">
              <div className="relative aspect-video bg-black/50">
                <img
                  src={`https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-red-600/80 flex items-center justify-center">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e: { target: { value: string } }) => setTitle(e.target.value)}
              placeholder="Ex: Guard Retention — Conceitos Chave"
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e: { target: { value: string } }) => setDescription(e.target.value)}
              placeholder="Breve descrição do conteúdo..."
              maxLength={300}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/20 resize-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {/* Category + Level row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                Categoria
              </label>
              <select
                value={category}
                onChange={(e: { target: { value: string } }) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-white/20 appearance-none cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                Nível
              </label>
              <select
                value={level}
                onChange={(e: { target: { value: string } }) => setLevel(e.target.value as Video['level'])}
                className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none focus-visible:ring-2 focus-visible:ring-white/20 appearance-none cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Turmas */}
          {turmas.length > 0 && (
            <div>
              <label className="block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5">
                Turmas Associadas
              </label>
              <div className="flex flex-wrap gap-1.5">
                {turmas.map(t => {
                  const selected = selectedTurmas.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTurma(t.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        selected
                          ? 'text-amber-200 border-amber-400/30'
                          : 'text-white/30 border-white/[0.06] hover:border-white/10'
                      }`}
                      style={{
                        background: selected ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${selected ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {t.nome}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-xs text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #D97706, #B45309)',
                boxShadow: '0 4px 12px rgba(217,119,6,0.25)',
              }}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin mx-auto" />
              ) : isEdit ? tActions('saveChanges') : tActions('addVideo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
