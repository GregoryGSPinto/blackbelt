// ============================================================
// PlaylistFormModal — Create/Edit playlists (Professor)
// ============================================================
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Plus, Loader2, ChevronUp, ChevronDown, Trash2, ListMusic } from 'lucide-react';
import * as playlistService from '@/lib/api/playlist.service';
import type { Playlist, PlaylistCreateInput } from '@/lib/api/playlist.service';
import { useToast } from '@/contexts/ToastContext';

interface PlaylistFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (playlist: Playlist) => void;
  editPlaylist?: Playlist | null;
  availableVideos: { id: string; titulo: string; thumbnail?: string }[];
  turmas?: { id: string; nome: string }[];
  profId: string;
}

const TIPOS: Playlist['tipo'][] = ['semanal', 'tecnica', 'campeonato', 'individual', 'custom'];

const TIPO_LABELS: Record<string, string> = {
  semanal: 'Semanal',
  tecnica: 'Técnica',
  campeonato: 'Campeonato',
  individual: 'Individual',
  custom: 'Custom',
};

export function PlaylistFormModal({
  isOpen, onClose, onSaved, editPlaylist, availableVideos, turmas = [], profId,
}: PlaylistFormModalProps) {
  const toast = useToast();
  const isEdit = !!editPlaylist;
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<Playlist['tipo']>('semanal');
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedTurmaIds, setSelectedTurmaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (editPlaylist) {
      setNome(editPlaylist.nome);
      setTipo(editPlaylist.tipo);
      setSelectedVideoIds(editPlaylist.videoIds);
      setSelectedTurmaIds(editPlaylist.turmaIds || []);
    } else {
      setNome('');
      setTipo('semanal');
      setSelectedVideoIds([]);
      setSelectedTurmaIds([]);
    }
  }, [isOpen, editPlaylist]);

  const toggleVideo = useCallback((id: string) => {
    setSelectedVideoIds(prev => prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]);
  }, []);

  const toggleTurma = useCallback((id: string) => {
    setSelectedTurmaIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  }, []);

  const moveVideo = useCallback((index: number, dir: -1 | 1) => {
    setSelectedVideoIds(prev => {
      const next = [...prev];
      const newIndex = index + dir;
      if (newIndex < 0 || newIndex >= next.length) return next;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }, []);

  const removeVideo = useCallback((id: string) => {
    setSelectedVideoIds(prev => prev.filter(v => v !== id));
  }, []);

  const videoMap = useMemo(() => new Map(availableVideos.map(v => [v.id, v])), [availableVideos]);

  const handleSave = useCallback(async () => {
    if (!nome.trim()) { toast.warning('Nome da playlist é obrigatório'); return; }
    if (selectedVideoIds.length === 0) { toast.warning('Selecione pelo menos um vídeo'); return; }

    setSaving(true);
    try {
      const input: PlaylistCreateInput = {
        nome: nome.trim(),
        tipo,
        videoIds: selectedVideoIds,
        turmaIds: selectedTurmaIds.length > 0 ? selectedTurmaIds : undefined,
      };

      let result: Playlist;
      if (isEdit && editPlaylist) {
        result = await playlistService.updatePlaylist(editPlaylist.id, input);
      } else {
        result = await playlistService.createPlaylist(profId, input);
      }

      toast.success(isEdit ? 'Playlist atualizada!' : 'Playlist criada!');
      onSaved(result);
      onClose();
    } catch {
      toast.error('Erro ao salvar playlist');
    } finally {
      setSaving(false);
    }
  }, [nome, tipo, selectedVideoIds, selectedTurmaIds, isEdit, editPlaylist, profId, onSaved, onClose, toast]);

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden"
        style={{ background: 'rgba(20,18,14,0.97)', border: '1px solid rgba(255,255,255,0.08)' }}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Editar playlist' : 'Nova playlist'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListMusic size={18} className="text-blue-400" />
            {isEdit ? 'Editar Playlist' : 'Nova Playlist'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors" aria-label="Fechar">
            <X size={18} className="text-white/50" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Nome */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Nome da Playlist</label>
            <input
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: Técnicas da Semana"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                         focus:outline-none focus:border-white/25 transition-colors"
              aria-label="Nome da playlist"
              aria-required="true"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">Tipo</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map(t => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${tipo === t ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  aria-pressed={tipo === t}
                >
                  {TIPO_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div>
            <label className="text-xs font-medium text-white/50 mb-1.5 block">
              Vídeos ({selectedVideoIds.length} selecionados)
            </label>

            {/* Selected - Reorderable */}
            {selectedVideoIds.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {selectedVideoIds.map((vid, i) => {
                  const v = videoMap.get(vid);
                  if (!v) return null;
                  return (
                    <div key={vid} className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/8 border border-blue-500/15">
                      <span className="text-[10px] text-white/30 w-4">{i + 1}</span>
                      <Play size={12} className="text-blue-400 flex-shrink-0" />
                      <span className="text-xs text-white/70 flex-1 truncate">{v.titulo}</span>
                      <button onClick={() => moveVideo(i, -1)} disabled={i === 0} className="p-0.5 text-white/20 hover:text-white/50 disabled:opacity-20" aria-label="Mover para cima">
                        <ChevronUp size={14} />
                      </button>
                      <button onClick={() => moveVideo(i, 1)} disabled={i === selectedVideoIds.length - 1} className="p-0.5 text-white/20 hover:text-white/50 disabled:opacity-20" aria-label="Mover para baixo">
                        <ChevronDown size={14} />
                      </button>
                      <button onClick={() => removeVideo(vid)} className="p-0.5 text-red-400/50 hover:text-red-400" aria-label="Remover vídeo">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Available to add */}
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {availableVideos.filter(v => !selectedVideoIds.includes(v.id)).map(v => (
                <button
                  key={v.id}
                  onClick={() => toggleVideo(v.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left bg-white/3 hover:bg-white/6 transition-colors"
                >
                  <Plus size={14} className="text-white/30 flex-shrink-0" />
                  <span className="text-xs text-white/50 truncate">{v.titulo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Turmas */}
          {turmas.length > 0 && (
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Vincular a Turmas</label>
              <div className="flex flex-wrap gap-2">
                {turmas.map(t => (
                  <button
                    key={t.id}
                    onClick={() => toggleTurma(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${selectedTurmaIds.includes(t.id) ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                    aria-pressed={selectedTurmaIds.includes(t.id)}
                  >
                    {t.nome}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400
                       disabled:opacity-40 transition-all shadow-lg"
            aria-label={isEdit ? 'Salvar alterações' : 'Criar playlist'}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ListMusic size={16} />}
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Playlist'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
