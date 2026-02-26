// ============================================================
// Playlist Mock — Professor creates, Student consumes
// ============================================================

export interface Playlist {
  id: string;
  titulo: string;
  descricao?: string;
  criadoPor: string;
  tipo: 'semanal' | 'tecnica' | 'campeonato' | 'individual' | 'custom';
  videoIds: string[];
  turmasAssociadas: string[];
  alunoEspecifico?: string;
  publica: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PlaylistCreateInput {
  titulo: string;
  descricao?: string;
  tipo: Playlist['tipo'];
  turmasAssociadas?: string[];
  alunoEspecifico?: string;
}

// ── In-memory store ──

let nextId = 200;

const PLAYLISTS: Playlist[] = [
  {
    id: 'pl-1',
    titulo: 'Semana 1 — Fundamentos',
    descricao: 'Base para alunos iniciantes: postura, fuga e controle.',
    criadoPor: 'prof-001',
    tipo: 'semanal',
    videoIds: ['pv-4', 'pv-5', 'pv-3', 'pv-1'],
    turmasAssociadas: ['TUR002'],
    publica: true,
    criadoEm: '2026-01-10T10:00:00Z',
    atualizadoEm: '2026-01-15T10:00:00Z',
  },
  {
    id: 'pl-2',
    titulo: 'Preparação Campeonato',
    descricao: 'Sequências ofensivas e drills de intensidade para competidores.',
    criadoPor: 'prof-001',
    tipo: 'campeonato',
    videoIds: ['pv-1', 'pv-2', 'pv-3', 'pv-5', 'pv-4', 'pv-1'],
    turmasAssociadas: ['TUR001', 'TUR005'],
    publica: true,
    criadoEm: '2026-01-20T08:00:00Z',
    atualizadoEm: '2026-02-01T14:00:00Z',
  },
  {
    id: 'pl-3',
    titulo: 'Guard Passing Completo',
    descricao: 'Todas as passagens de guarda organizadas por dificuldade.',
    criadoPor: 'prof-001',
    tipo: 'tecnica',
    videoIds: ['pv-2', 'pv-1', 'pv-4', 'pv-5', 'pv-3'],
    turmasAssociadas: ['TUR001'],
    publica: true,
    criadoEm: '2026-02-05T09:00:00Z',
    atualizadoEm: '2026-02-10T11:00:00Z',
  },
  {
    id: 'pl-4',
    titulo: 'Playlist do Carlos',
    descricao: 'Conteúdo personalizado para o Carlos trabalhar fuga lateral.',
    criadoPor: 'prof-001',
    tipo: 'individual',
    videoIds: ['pv-4', 'pv-1', 'pv-5'],
    turmasAssociadas: [],
    alunoEspecifico: 'aluno-carlos',
    publica: false,
    criadoEm: '2026-02-12T16:00:00Z',
    atualizadoEm: '2026-02-12T16:00:00Z',
  },
];

// ── CRUD ──

export function getPlaylistsByProfessor(profId: string): Playlist[] {
  return PLAYLISTS.filter(p => p.criadoPor === profId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function getPlaylistsForAluno(_alunoId: string): Playlist[] {
  // Return public playlists + individual ones for this aluno
  return PLAYLISTS.filter(p => p.publica || p.alunoEspecifico === _alunoId)
    .sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
}

export function createPlaylist(profId: string, input: PlaylistCreateInput): Playlist {
  const now = new Date().toISOString();
  const playlist: Playlist = {
    id: `pl-${++nextId}`,
    titulo: input.titulo,
    descricao: input.descricao,
    criadoPor: profId,
    tipo: input.tipo,
    videoIds: [],
    turmasAssociadas: input.turmasAssociadas || [],
    alunoEspecifico: input.alunoEspecifico,
    publica: input.tipo !== 'individual',
    criadoEm: now,
    atualizadoEm: now,
  };
  PLAYLISTS.unshift(playlist);
  return playlist;
}

export function updatePlaylist(id: string, data: Partial<PlaylistCreateInput>): Playlist {
  const pl = PLAYLISTS.find(p => p.id === id);
  if (!pl) throw new Error('Playlist não encontrada');
  if (data.titulo) pl.titulo = data.titulo;
  if (data.descricao !== undefined) pl.descricao = data.descricao;
  if (data.tipo) pl.tipo = data.tipo;
  if (data.turmasAssociadas) pl.turmasAssociadas = data.turmasAssociadas;
  pl.atualizadoEm = new Date().toISOString();
  return pl;
}

export function deletePlaylist(id: string): void {
  const idx = PLAYLISTS.findIndex(p => p.id === id);
  if (idx === -1) throw new Error('Playlist não encontrada');
  PLAYLISTS.splice(idx, 1);
}

export function addVideoToPlaylist(playlistId: string, videoId: string): void {
  const pl = PLAYLISTS.find(p => p.id === playlistId);
  if (!pl) throw new Error('Playlist não encontrada');
  if (!pl.videoIds.includes(videoId)) {
    pl.videoIds.push(videoId);
    pl.atualizadoEm = new Date().toISOString();
  }
}

export function removeVideoFromPlaylist(playlistId: string, videoId: string): void {
  const pl = PLAYLISTS.find(p => p.id === playlistId);
  if (!pl) throw new Error('Playlist não encontrada');
  pl.videoIds = pl.videoIds.filter(v => v !== videoId);
  pl.atualizadoEm = new Date().toISOString();
}

export function reorderPlaylist(playlistId: string, videoIds: string[]): void {
  const pl = PLAYLISTS.find(p => p.id === playlistId);
  if (!pl) throw new Error('Playlist não encontrada');
  pl.videoIds = videoIds;
  pl.atualizadoEm = new Date().toISOString();
}
