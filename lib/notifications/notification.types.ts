/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  NOTIFICATION TYPES — Sistema de Notificações BlackBelt   ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║  Tipos:                                                     ║
 * ║  • NOVO_ALUNO      — Novo aluno matriculado                 ║
 * ║  • AVALIACAO        — Avaliação pendente                    ║
 * ║  • VIDEO_ENVIADO    — Aluno enviou vídeo                    ║
 * ║  • AVISO_ACADEMIA   — Comunicado institucional              ║
 * ║  • GRADUACAO        — Atualização de graduação/nivel        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

export type NotificationType =
  | 'NOVO_ALUNO'
  | 'AVALIACAO'
  | 'VIDEO_ENVIADO'
  | 'AVISO_ACADEMIA'
  | 'GRADUACAO';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  /** Optional deep-link route */
  href?: string;
  /** Optional related entity (aluno name, turma, etc) */
  meta?: string;
}

/** Visual config per notification type */
export const NOTIFICATION_CONFIG: Record<NotificationType, {
  icon: string;
  color: string;
  bgColor: string;
}> = {
  NOVO_ALUNO: {
    icon: '👤',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/15',
  },
  AVALIACAO: {
    icon: '📋',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/15',
  },
  VIDEO_ENVIADO: {
    icon: '🎬',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/15',
  },
  AVISO_ACADEMIA: {
    icon: '📢',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/15',
  },
  GRADUACAO: {
    icon: '🥋',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/15',
  },
};

/** Mock notifications for development */
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n001',
    type: 'NOVO_ALUNO',
    title: 'Novo aluno matriculado',
    message: 'Lucas Mendes completou a matrícula na turma Iniciantes.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
    read: false,
    href: '/usuarios',
    meta: 'Lucas Mendes',
  },
  {
    id: 'n002',
    type: 'AVALIACAO',
    title: 'Avaliação pendente',
    message: 'Rafael Santos aguarda avaliação de graduação para nível básico.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min ago
    read: false,
    href: '/turmas',
    meta: 'Rafael Santos',
  },
  {
    id: 'n003',
    type: 'VIDEO_ENVIADO',
    title: 'Vídeo recebido',
    message: 'Ana Silva enviou vídeo de treino para revisão.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    read: false,
    href: '/aulas',
    meta: 'Ana Silva',
  },
  {
    id: 'n004',
    type: 'AVISO_ACADEMIA',
    title: 'Horário alterado',
    message: 'A turma Gi Avançado de sexta foi antecipada para 18h30.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    meta: 'Gi Avançado',
  },
  {
    id: 'n005',
    type: 'GRADUACAO',
    title: 'Graduação atualizada',
    message: 'Pedro Almeida foi promovido para nível intermediário — 2 subniveis.',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    href: '/usuarios',
    meta: 'Pedro Almeida',
  },
  {
    id: 'n006',
    type: 'NOVO_ALUNO',
    title: 'Novo aluno Kids',
    message: 'Enzo (8 anos) foi inscrito por Maria Fernanda.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    href: '/usuarios',
    meta: 'Enzo',
  },
  {
    id: 'n007',
    type: 'AVALIACAO',
    title: 'Avaliação técnica',
    message: 'Juliana Ferreira completou 6 meses — avaliar progressão.',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    href: '/turmas',
    meta: 'Juliana Ferreira',
  },
];

/**
 * Formata timestamp relativo (estilo Slack):
 * - < 1min: "agora"
 * - < 60min: "Xmin"
 * - < 24h: "Xh"
 * - < 48h: "ontem"
 * - else: "Xd"
 */
export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'agora';
  if (mins < 60) return `${mins}min`;
  if (hours < 24) return `${hours}h`;
  if (hours < 48) return 'ontem';
  return `${days}d`;
}
