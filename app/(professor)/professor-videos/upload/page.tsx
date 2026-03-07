'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useVideoUpload } from '@/hooks/useVideoUpload';
import { VideoDropZone } from '@/components/professor/VideoDropZone';
import { VideoUploadProgress } from '@/components/professor/VideoUploadProgress';
import { TagsInput } from '@/components/professor/TagsInput';
import type {
  VideoUploadInput,
  VideoContentType,
  VideoTurmaCategory,
  VideoVisibility,
} from '@/lib/api/video-provider.types';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

// ── Constants ──

const CATEGORIES = ['Fundamentos', 'Passagens', 'Finalizações', 'Defesa', 'Drills', 'Guarda'];
const LEVELS: ('Iniciante' | 'Intermediário' | 'Avançado')[] = ['Iniciante', 'Intermediário', 'Avançado'];

const CONTENT_TYPES: { value: VideoContentType; label: string }[] = [
  { value: 'aula', label: 'Aula' },
  { value: 'demonstracao', label: 'Demonstração' },
  { value: 'analise_luta', label: 'Análise de Luta' },
  { value: 'aquecimento', label: 'Aquecimento' },
  { value: 'outro', label: 'Outro' },
];

const TURMA_CATEGORIES: { value: VideoTurmaCategory; label: string }[] = [
  { value: 'todas', label: 'Todas' },
  { value: 'adulto_fundamentos', label: 'Adulto Fundamentos' },
  { value: 'adulto_avancado', label: 'Adulto Avançado' },
  { value: 'teen', label: 'Teen' },
  { value: 'kids', label: 'Kids' },
];

const TURMAS_OPTIONS = [
  { id: 'TUR001', nome: 'Gi Avançado' },
  { id: 'TUR002', nome: 'Fundamentos' },
  { id: 'TUR005', nome: 'No-Gi / Submission' },
];

// ── Component ──

export default function VideoUploadPage() {
  const t = useTranslations('professor.videoUpload');
  const tCommon = useTranslations('common');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const upload = useVideoUpload();

  // ── Form state ──
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [contentType, setContentType] = useState<VideoContentType>('aula');
  const [turmaCategory, setTurmaCategory] = useState<VideoTurmaCategory>('todas');
  const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<VideoVisibility>('public');

  const profId = user?.id || 'prof-001';
  const isUploading = upload.phase !== 'idle' && upload.phase !== 'error';
  const isDone = upload.phase === 'done';

  const toggleTurma = useCallback((id: string) => {
    setSelectedTurmas((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  }, []);

  const buildInput = useCallback(
    (status: 'published' | 'draft'): VideoUploadInput => ({
      title: title.trim(),
      description: description.trim(),
      category,
      level,
      contentType,
      turmaCategory,
      visibility: status === 'draft' ? 'private' : visibility,
      turmasAssociadas: selectedTurmas,
      tags,
    }),
    [title, description, category, level, contentType, turmaCategory, visibility, selectedTurmas, tags],
  );

  const handleSubmit = useCallback(
    async (asDraft: boolean) => {
      if (!videoFile) {
        toast.error(t('selectVideoFile'));
        return;
      }
      if (!title.trim()) {
        toast.error(t('titleRequired'));
        return;
      }

      const input = buildInput(asDraft ? 'draft' : 'published');
      await upload.startUpload(profId, videoFile, thumbnailFile, input);
    },
    [videoFile, thumbnailFile, title, profId, buildInput, upload, toast],
  );

  // Redirect after success
  const handleDone = useCallback(() => {
    toast.success(t('success'));
    router.push('/professor-videos');
  }, [toast, router]);

  // Video preview URL
  const previewUrl = useMemo(() => {
    if (!videoFile) return null;
    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  // ── Input style helpers ──
  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const labelClass = 'block text-[10px] font-medium text-white/30 uppercase tracking-wider mb-1.5';

  return (
    <div className="space-y-6 pt-6 pb-8 max-w-2xl mx-auto">
      {/* Header */}
      <section className="prof-enter-1">
        <button
          onClick={() => router.push('/professor-videos')}
          className="flex items-center gap-1.5 text-xs text-white/35 hover:text-white/50 transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          Vídeos
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Upload size={18} className="text-amber-400/60" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('title')}</h1>
            <p className="text-white/35 text-xs">{t('subtitle')}</p>
          </div>
        </div>
        <div className="prof-gold-line mt-5" />
      </section>

      {/* Upload Progress */}
      {upload.phase !== 'idle' && (
        <section className="prof-enter-2">
          <VideoUploadProgress
            phase={upload.phase}
            progress={upload.progress}
            error={upload.error}
            onCancel={upload.abort}
            onRetry={() => {
              upload.reset();
            }}
          />
        </section>
      )}

      {/* Done state — redirect */}
      {isDone && (
        <section className="prof-enter-2 text-center space-y-4">
          <p className="text-sm text-green-300/80">{t('success')}</p>
          <button
            onClick={handleDone}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/80 hover:to-amber-600/80 transition-all shadow-lg shadow-amber-900/30"
          >
            {t('backToVideos')}
          </button>
        </section>
      )}

      {/* Form — hidden during upload/done */}
      {!isUploading && !isDone && (
        <>
          {/* Video Drop Zone */}
          <section className="prof-enter-2">
            <label className={labelClass}>{t('fileLabel')}</label>
            <VideoDropZone
              accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
              label={t('dragDrop')}
              hint={t('formats')}
              file={videoFile}
              onFileSelect={setVideoFile}
              variant="video"
            />
          </section>

          {/* Video Preview */}
          {previewUrl && (
            <section className="prof-enter-2">
              <label className={labelClass}>{t('preview')}</label>
              <div className="rounded-xl overflow-hidden border border-white/[0.06]">
                <video
                  src={previewUrl}
                  controls
                  className="w-full max-h-[300px] bg-black"
                />
              </div>
            </section>
          )}

          {/* Thumbnail Drop Zone */}
          <section className="prof-enter-2">
            <label className={labelClass}>{t('thumbnailLabel')}</label>
            <VideoDropZone
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              label={t('thumbnailDrag')}
              hint={t('thumbnailFormats')}
              file={thumbnailFile}
              onFileSelect={setThumbnailFile}
              variant="thumbnail"
            />
          </section>

          {/* Title */}
          <section className="prof-enter-2">
            <label className={labelClass}>{t('titleLabel')}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('titlePlaceholder')}
              maxLength={100}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none"
              style={inputStyle}
            />
          </section>

          {/* Description */}
          <section className="prof-enter-3">
            <label className={labelClass}>{t('descLabel')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('descPlaceholder')}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none resize-none"
              style={inputStyle}
            />
          </section>

          {/* Category + Level */}
          <section className="prof-enter-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('categoryLabel')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('levelLabel')}</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value as typeof level)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Content Type + Turma Category */}
          <section className="prof-enter-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{t('contentType')}</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value as VideoContentType)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {CONTENT_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t('classCategory')}</label>
                <select
                  value={turmaCategory}
                  onChange={(e) => setTurmaCategory(e.target.value as VideoTurmaCategory)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-white/80 outline-none appearance-none cursor-pointer"
                  style={inputStyle}
                >
                  {TURMA_CATEGORIES.map((tc) => (
                    <option key={tc.value} value={tc.value}>{tc.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Turmas Associadas */}
          <section className="prof-enter-3">
            <label className={labelClass}>{t('linkedClasses')}</label>
            <div className="flex flex-wrap gap-1.5">
              {TURMAS_OPTIONS.map((t) => {
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
          </section>

          {/* Tags */}
          <section className="prof-enter-3">
            <label className={labelClass}>{t('tags')}</label>
            <TagsInput
              tags={tags}
              onChange={setTags}
              max={10}
              maxLength={30}
              placeholder={t('tagsPlaceholder')}
            />
          </section>

          {/* Visibility Toggle */}
          <section className="prof-enter-3">
            <label className={labelClass}>{t('visibility')}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  visibility === 'public'
                    ? 'text-amber-200'
                    : 'text-white/30 hover:text-white/40'
                }`}
                style={{
                  background:
                    visibility === 'public'
                      ? 'rgba(251,191,36,0.1)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    visibility === 'public'
                      ? 'rgba(251,191,36,0.25)'
                      : 'rgba(255,255,255,0.06)'
                  }`,
                }}
              >
                <Eye size={14} />
                {t('public')}
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`flex items-center gap-2 flex-1 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  visibility === 'private'
                    ? 'text-amber-200'
                    : 'text-white/30 hover:text-white/40'
                }`}
                style={{
                  background:
                    visibility === 'private'
                      ? 'rgba(251,191,36,0.1)'
                      : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    visibility === 'private'
                      ? 'rgba(251,191,36,0.25)'
                      : 'rgba(255,255,255,0.06)'
                  }`,
                }}
              >
                <EyeOff size={14} />
                {t('private')}
              </button>
            </div>
          </section>

          {/* Actions */}
          <section className="prof-enter-3 flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white/40 hover:bg-white/5 transition-colors"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {tCommon('actions.saveDraft')}
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-medium text-white transition-all hover:scale-[1.02] active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #D97706, #B45309)',
                boxShadow: '0 4px 12px rgba(217,119,6,0.25)',
              }}
            >
              {tCommon('actions.publish')}
            </button>
          </section>
        </>
      )}
    </div>
  );
}
