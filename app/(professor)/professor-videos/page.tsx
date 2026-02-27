'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Eye, Clock, Upload, Film, VideoOff, Pencil, Trash2, MoreVertical, Plus, Search, Copy, FileVideo } from 'lucide-react';
import * as professorService from '@/lib/api/instrutor.service';
import * as videoMgmt from '@/lib/api/video-management.service';
import * as videoUploadService from '@/lib/api/video-upload.service';
import type { VideoRecente } from '@/lib/api/instrutor.service';
import type { Video } from '@/lib/__mocks__/content.mock';
import type { UploadedVideo } from '@/lib/api/video-provider.types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PageSkeleton } from '@/components/shared/SkeletonLoader';
import { VideoFormModal } from '@/components/professor/VideoFormModal';
import { PlaylistFormModal } from '@/components/professor/PlaylistFormModal';
import * as playlistService from '@/lib/api/playlist.service';
import type { Playlist } from '@/lib/api/playlist.service';

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  aula: { label: 'Sessão', color: 'text-sky-300 bg-sky-500/15' },
  analise: { label: 'Análise', color: 'text-amber-300 bg-amber-500/15' },
  demonstracao: { label: 'Demo', color: 'text-emerald-300 bg-emerald-500/15' },
};

const STATUS_BADGES: Record<string, { label: string; color: string }> = {
  published: { label: 'Publicado', color: 'text-green-300 bg-green-500/15' },
  draft: { label: 'Rascunho', color: 'text-amber-300 bg-amber-500/15' },
  processing: { label: 'Processando', color: 'text-blue-300 bg-blue-500/15 animate-pulse' },
  error: { label: 'Erro', color: 'text-red-300 bg-red-500/15' },
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  aula: 'Aula',
  demonstracao: 'Demo',
  analise_luta: 'Análise',
  aquecimento: 'Aquecimento',
  outro: 'Outro',
};

// ── Turmas mock for multi-select ──
const TURMAS_OPTIONS = [
  { id: 'TUR001', nome: 'Gi Avançado' },
  { id: 'TUR002', nome: 'Fundamentos' },
  { id: 'TUR005', nome: 'No-Gi / Submission' },
];

type FilterStatus = 'all' | 'published' | 'draft' | 'processing';

export default function ProfessorVideosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  // ── State ──
  const [videos, setVideos] = useState<VideoRecente[]>([]);
  const [managedVideos, setManagedVideos] = useState<Video[]>([]);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [tab, setTab] = useState<'todos' | 'meus' | 'playlists'>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editPlaylist, setEditPlaylist] = useState<Playlist | null>(null);

  // ── Filter state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const profId = user?.id || 'prof-001';

  // ── Fetch ──
  useEffect(() => {
    setError(null);
    setLoading(true);
    Promise.all([
      professorService.getVideos(),
      videoMgmt.getVideosByProfessor(profId),
      playlistService.getPlaylistsByProfessor(profId),
      videoUploadService.getUploadedVideos(profId),
    ])
      .then(([v, mv, pl, uv]) => {
        setVideos(v);
        setManagedVideos(mv);
        setPlaylists(pl);
        setUploadedVideos(uv);
      })
      .catch((err) => {
        setError(handleServiceError(err, 'ProfVideos'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [retryCount, profId]);

  // ── Merged "Meus Vídeos" (YouTube + Uploaded) ──
  const allMyVideos = useMemo(() => {
    const youtube = managedVideos.map((v) => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnail,
      duration: v.duration,
      category: v.category,
      level: v.level,
      views: v.views,
      status: 'published' as const,
      source: 'youtube' as const,
      contentType: null as string | null,
      turmasAssociadas: v.turmasAssociadas || [],
      criadoEm: v.criadoEm || '',
      original: v,
    }));
    const uploaded = uploadedVideos.map((v) => ({
      id: v.id,
      title: v.title,
      thumbnail: v.thumbnailUrl,
      duration: v.duration,
      category: v.category,
      level: v.level,
      views: v.views,
      status: v.status,
      source: 'upload' as const,
      contentType: v.contentType,
      turmasAssociadas: v.turmasAssociadas,
      criadoEm: v.criadoEm,
      original: v,
    }));
    return [...youtube, ...uploaded].sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''));
  }, [managedVideos, uploadedVideos]);

  // ── Filtered "Meus Vídeos" ──
  const filteredMyVideos = useMemo(() => {
    let result = allMyVideos;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((v) => v.title.toLowerCase().includes(q));
    }
    if (filterStatus !== 'all') {
      result = result.filter((v) => v.status === filterStatus);
    }
    return result;
  }, [allMyVideos, searchQuery, filterStatus]);

  // ── Callbacks ──
  const handleVideoSaved = useCallback((saved: Video) => {
    setManagedVideos((prev: Video[]) => {
      const exists = prev.findIndex((v: Video) => v.id === saved.id);
      if (exists >= 0) {
        const next = [...prev];
        next[exists] = saved;
        return next;
      }
      return [saved, ...prev];
    });
    setEditVideo(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      // Check if it's an uploaded video
      if (id.startsWith('uv-')) {
        await videoUploadService.deleteUploadedVideo(id);
        setUploadedVideos((prev) => prev.filter((v) => v.id !== id));
      } else {
        await videoMgmt.deleteVideo(id);
        setManagedVideos((prev: Video[]) => prev.filter((v: Video) => v.id !== id));
      }
    } catch { /* */ }
    setDeleteConfirm(null);
  }, []);

  const openYoutubeAdd = useCallback(() => {
    setEditVideo(null);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((video: Video) => {
    setEditVideo(video);
    setModalOpen(true);
    setMenuOpen(null);
  }, []);

  const handleCopyLink = useCallback((video: { id: string; source: string }) => {
    const url = `${window.location.origin}/professor-videos?v=${video.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copiado!');
    }).catch(() => {
      toast.error('Falha ao copiar link');
    });
    setMenuOpen(null);
  }, [toast]);

  // ── Search ──
  const searchItems = useMemo<SearchItem[]>(() =>
    videos.map((v: VideoRecente) => ({
      id: `video-${v.id}`,
      label: v.titulo,
      sublabel: `${v.turma} · ${v.duracao} · ${v.visualizacoes} views`,
      categoria: 'Vídeo',
      icon: '🎬',
      href: '/professor-videos',
      keywords: [v.tipo, v.turma, TIPO_LABELS[v.tipo]?.label || ''],
    })),
  [videos]);

  useSearchRegistration('videos', searchItems);

  // ── Loading / Error / Empty ──
  if (loading) return <PageSkeleton variant="grid" />;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;

  const totalViews = videos.reduce((a: number, v: VideoRecente) => a + v.visualizacoes, 0)
    + uploadedVideos.reduce((a, v) => a + v.views, 0);

  const totalVideos = videos.length + managedVideos.length + uploadedVideos.length;

  // ── Status counts for filter chips ──
  const statusCounts = allMyVideos.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-8 pt-6 pb-8">
      {/* Header */}
      <section className="prof-enter-1">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">Biblioteca</p>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">Vídeos</h1>
            <p className="text-white/55 text-sm mt-2">
              {totalVideos} vídeos · {totalViews} visualizações totais
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openYoutubeAdd}
              className="flex items-center gap-2 px-4 py-2.5 text-white/40 text-xs font-medium rounded-xl transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Plus size={14} />
              YouTube
            </button>
            <button
              onClick={() => router.push('/professor-videos/upload')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/80 hover:to-amber-600/80 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-amber-900/30 hover:shadow-amber-900/40 hover:scale-[1.02]"
            >
              <Upload size={16} />
              Enviar Vídeo
            </button>
          </div>
        </div>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 prof-enter-2">
        {[
          { label: 'Total de Vídeos', value: totalVideos, icon: Film },
          { label: 'Visualizações', value: totalViews, icon: Eye },
          { label: 'Horas de Conteúdo', value: '2.4h', icon: Clock },
        ].map((stat) => (
          <div key={stat.label} className="prof-glass-card p-4 text-center">
            <stat.icon size={18} className="mx-auto text-amber-400/40 mb-2" />
            <p className="prof-stat-value text-xl font-bold">{stat.value}</p>
            <p className="text-[10px] text-white/50 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl prof-enter-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
        {(['todos', 'meus', 'playlists'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab === t
                ? 'bg-amber-600/20 text-amber-200'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            {t === 'todos' ? `Todos (${videos.length})` : t === 'meus' ? `Meus Vídeos (${allMyVideos.length})` : `Playlists (${playlists.length})`}
          </button>
        ))}
      </div>

      {/* Search & Filters (for "meus" tab) */}
      {tab === 'meus' && (
        <section className="space-y-3 prof-enter-2">
          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm text-white/80 placeholder:text-white/15 outline-none"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>

          {/* Status filter chips */}
          <div className="flex flex-wrap gap-1.5">
            {([
              { value: 'all' as FilterStatus, label: 'Todos' },
              { value: 'published' as FilterStatus, label: 'Publicados' },
              { value: 'draft' as FilterStatus, label: 'Rascunhos' },
              { value: 'processing' as FilterStatus, label: 'Processando' },
            ]).map((f) => {
              const count = f.value === 'all' ? allMyVideos.length : (statusCounts[f.value] || 0);
              const active = filterStatus === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilterStatus(f.value)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    active ? 'text-amber-200' : 'text-white/30 hover:text-white/40'
                  }`}
                  style={{
                    background: active ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${active ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Videos Grid */}
      <section className="prof-enter-3">
        {tab === 'todos' ? (
          /* ── TAB: All Videos (read-only, existing behavior) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.length === 0 ? (
              <PageEmpty icon={VideoOff} title="Nenhum vídeo" message="Sem vídeos para exibir." />
            ) : (
              videos.map((video: VideoRecente) => {
                const tipoConf = TIPO_LABELS[video.tipo] || TIPO_LABELS.aula;
                return (
                  <div key={video.id} className="prof-glass-card overflow-hidden group cursor-pointer">
                    <div className="relative h-40 md:h-44 bg-gradient-to-br from-black/60 to-black/30 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${video.thumbnail})`, opacity: 0.25 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-amber-500/20 group-hover:border-amber-500/30 group-hover:scale-110 transition-all duration-400">
                          <Play size={22} className="text-white/70 ml-0.5 group-hover:text-amber-200" fill="currentColor" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded-lg text-[11px] text-white/80 font-mono">
                        {video.duracao}
                      </div>
                      <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${tipoConf.color}`}>
                        {tipoConf.label}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-white/80 truncate group-hover:text-amber-200 transition-colors duration-300">
                        {video.titulo}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-white/55">{video.turma}</span>
                        <div className="flex items-center gap-3 text-[10px] text-white/45">
                          <span className="flex items-center gap-1"><Eye size={10} />{video.visualizacoes}</span>
                          <span>{video.dataEnvio}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : tab === 'meus' ? (
          /* ── TAB: Meus Vídeos (YouTube + Uploaded, with CRUD) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMyVideos.length === 0 ? (
              <div className="col-span-full">
                <PageEmpty
                  icon={VideoOff}
                  title={searchQuery || filterStatus !== 'all' ? 'Nenhum resultado' : 'Nenhum vídeo'}
                  message={searchQuery || filterStatus !== 'all' ? 'Tente alterar os filtros.' : 'Adicione seu primeiro vídeo!'}
                />
              </div>
            ) : (
              filteredMyVideos.map((video) => {
                const statusConf = STATUS_BADGES[video.status] || STATUS_BADGES.published;
                const isUpload = video.source === 'upload';

                return (
                  <div key={video.id} className="prof-glass-card overflow-hidden group relative">
                    {/* Thumbnail */}
                    <div className="relative h-40 md:h-44 bg-gradient-to-br from-black/60 to-black/30 overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${video.thumbnail})`, opacity: 0.3 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-all">
                          {isUpload ? (
                            <FileVideo size={22} className="text-white/70" />
                          ) : (
                            <Play size={22} className="text-white/70 ml-0.5" fill="currentColor" />
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 rounded-lg text-[11px] text-white/80 font-mono">
                        {video.duration}
                      </div>

                      {/* Source + Category badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold text-amber-300 bg-amber-500/15">
                          {video.category}
                        </span>
                        {isUpload && video.contentType && (
                          <span className="px-2 py-1 rounded-lg text-[9px] font-medium text-sky-300 bg-sky-500/15">
                            {CONTENT_TYPE_LABELS[video.contentType] || video.contentType}
                          </span>
                        )}
                      </div>

                      {/* ── Actions menu ── */}
                      <div className="absolute top-3 right-3">
                        <button
                          onClick={() => setMenuOpen(menuOpen === video.id ? null : video.id)}
                          className="w-7 h-7 rounded-lg bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
                        >
                          <MoreVertical size={14} className="text-white/60" />
                        </button>
                        {menuOpen === video.id && (
                          <div
                            className="absolute right-0 top-8 w-36 rounded-xl overflow-hidden shadow-xl z-20"
                            style={{ background: 'rgba(20,20,30,0.95)', border: '1px solid rgba(255,255,255,0.08)' }}
                          >
                            {!isUpload && (
                              <button
                                onClick={() => openEdit(video.original as Video)}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 transition-colors"
                              >
                                <Pencil size={12} /> Editar
                              </button>
                            )}
                            <button
                              onClick={() => handleCopyLink(video)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-white/60 hover:bg-white/5 transition-colors"
                            >
                              <Copy size={12} /> Copiar link
                            </button>
                            <button
                              onClick={() => { setDeleteConfirm(video.id); setMenuOpen(null); }}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-xs text-red-400/70 hover:bg-red-500/5 transition-colors"
                            >
                              <Trash2 size={12} /> Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white/80 truncate flex-1">{video.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-semibold whitespace-nowrap ${statusConf.color}`}>
                          {statusConf.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-white/40">{video.level}</span>
                        <div className="flex items-center gap-2">
                          {video.source === 'upload' && (
                            <span className="text-[9px] text-white/20 bg-white/5 px-1.5 py-0.5 rounded">Upload</span>
                          )}
                          {video.turmasAssociadas.length > 0 && (
                            <span className="text-[10px] text-white/30">
                              {video.turmasAssociadas.length} turma{video.turmasAssociadas.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete confirmation */}
                    {deleteConfirm === video.id && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-10">
                        <div className="text-center">
                          <p className="text-sm text-white/70 mb-3">Excluir este vídeo?</p>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 rounded-lg text-xs text-white/40 bg-white/5 hover:bg-white/10"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleDelete(video.id)}
                              className="px-4 py-2 rounded-lg text-xs text-white bg-red-600/80 hover:bg-red-500"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Upload CTA */}
            <div
              onClick={() => router.push('/professor-videos/upload')}
              className="prof-glass-card overflow-hidden flex items-center justify-center min-h-[240px] border-2 border-dashed border-white/5 hover:border-amber-500/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 transition-all duration-300">
                  <Upload size={20} className="text-white/60 group-hover:text-amber-400/60" />
                </div>
                <p className="text-sm text-white/45 mt-3 group-hover:text-white/40 transition-colors">Enviar novo vídeo</p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* ── Playlists Tab ── */}
      {tab === 'playlists' && (
        <section className="prof-enter-3 space-y-4">
          <button
            onClick={() => { setEditPlaylist(null); setPlaylistModalOpen(true); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                       bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white hover:from-blue-500 hover:to-blue-400
                       transition-all"
            aria-label="Criar nova playlist"
          >
            <Plus size={16} /> Nova Playlist
          </button>

          {playlists.length === 0 ? (
            <div className="prof-glass-card p-8 text-center">
              <Film size={32} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/30 text-sm">Nenhuma playlist ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.map(pl => (
                <div key={pl.id} className="prof-glass-card p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white/80">{pl.titulo}</h3>
                      <p className="text-xs text-white/35 mt-0.5">{pl.videoIds.length} vídeos · {pl.tipo}</p>
                      {pl.turmasAssociadas && pl.turmasAssociadas.length > 0 && (
                        <p className="text-[10px] text-white/20 mt-1">{pl.turmasAssociadas.length} turma(s) vinculada(s)</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditPlaylist(pl); setPlaylistModalOpen(true); }}
                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 rounded-lg text-white/50 transition-colors"
                        aria-label={`Editar playlist ${pl.titulo}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await playlistService.deletePlaylist(pl.id);
                            setPlaylists(prev => prev.filter(p => p.id !== pl.id));
                          } catch {}
                        }}
                        className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400/70 transition-colors"
                        aria-label={`Excluir playlist ${pl.titulo}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <PlaylistFormModal
            isOpen={playlistModalOpen}
            onClose={() => { setPlaylistModalOpen(false); setEditPlaylist(null); }}
            onSaved={(saved) => {
              setPlaylists(prev => {
                const idx = prev.findIndex(p => p.id === saved.id);
                if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
                return [saved, ...prev];
              });
            }}
            editPlaylist={editPlaylist}
            availableVideos={managedVideos.map(v => ({ id: v.id, titulo: v.title, thumbnail: v.thumbnail }))}
            turmas={TURMAS_OPTIONS}
            profId={profId}
          />
        </section>
      )}

      {/* Close any open menu on click outside */}
      {menuOpen && (
        <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(null)} />
      )}

      {/* Modal */}
      <VideoFormModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditVideo(null); }}
        onSaved={handleVideoSaved}
        editVideo={editVideo}
        turmas={TURMAS_OPTIONS}
        profId={profId}
      />
    </div>
  );
}
