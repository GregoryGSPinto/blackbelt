'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, UserPlus, Eye, Edit2, Ban, CheckCircle, AlertCircle, XCircle, Snowflake, UserX } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario, StatusOperacional, TipoUsuario } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useFormatting } from '@/hooks/useFormatting';

export default function UsuariosPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { formatDate } = useFormatting();
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '12px' } as const;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusOperacional | 'TODOS'>('TODOS');
  const [tipoFilter, setTipoFilter] = useState<TipoUsuario | 'TODOS'>('TODOS');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function loadUsuarios() {
      try {
        setError(null);
        const data = await adminService.getUsuarios({
          status: statusFilter,
          tipo: tipoFilter,
          search: searchTerm
        });
        setUsuarios(data);
      } catch (err) {
        setError(handleServiceError(err, 'Usuarios'));

      } finally {
        setLoading(false);
      }
    }
    loadUsuarios();
  }, [statusFilter, tipoFilter, searchTerm, retryCount]);

  // ─── Search Registration ──────────────────────────────────
  const globalSearchItems = useMemo<SearchItem[]>(() =>
    usuarios.map(u => ({
      id: `usuario-${u.id}`,
      label: u.nome,
      sublabel: `${u.email} · ${u.tipo} · ${u.status}`,
      categoria: 'Usuário',
      icon: u.status === 'ATIVO' ? '🟢' : u.status === 'EM_ATRASO' ? '🟡' : u.status === 'CONGELADO' ? '🧊' : u.status === 'INATIVO' ? '⚪' : '🔴',
      href: '/usuarios',
      keywords: [u.email, u.tipo, u.status, u.telefone || ''],
    })),
  [usuarios]);

  useSearchRegistration('admin-usuarios', globalSearchItems);

  if (loading) {
    return <PremiumLoader text={t('users.loading')} />;
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  const alunos = usuarios.filter(u => u.tipo === 'ALUNO');
  
  const filteredUsers = alunos;

  const getStatusBadge = (status: StatusOperacional) => {
    const config = {
      ATIVO: {
        bg: 'bg-white/5',
        border: 'border-white/10',
        text: 'text-green-400',
        icon: CheckCircle,
        label: t('users.statusActive')
      },
      EM_ATRASO: {
        bg: 'bg-yellow-600/20',
        border: 'border-yellow-600/30',
        text: 'text-yellow-400',
        icon: AlertCircle,
        label: t('users.statusOverdue')
      },
      BLOQUEADO: {
        bg: 'bg-red-600/20',
        border: 'border-red-600/30',
        text: 'text-red-400',
        icon: XCircle,
        label: t('users.statusBlocked')
      },
      CONGELADO: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        icon: Snowflake,
        label: t('users.statusFrozen')
      },
      INATIVO: {
        bg: 'bg-black/30',
        border: 'border-white/[0.06]',
        text: 'text-white/30',
        icon: UserX,
        label: t('users.statusInactive')
      }
    };

    const { bg, border, text, icon: Icon, label } = config[status];

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 ${bg} border ${border} rounded-full`}>
        <Icon className={`w-3.5 h-3.5 ${text}`} />
        <span className={`text-xs font-medium ${text}`}>{label}</span>
      </div>
    );
  };

  const stats = {
    ativos: alunos.filter(a => a.status === 'ATIVO').length,
    emAtraso: alunos.filter(a => a.status === 'EM_ATRASO').length,
    bloqueados: alunos.filter(a => a.status === 'BLOQUEADO').length,
  };
  const isSearching = searchTerm.trim().length > 0 || statusFilter !== 'TODOS' || tipoFilter !== 'TODOS';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Alunos</h1>
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>
            Gerencie a base ativa de alunos da academia, acompanhe status e encontre registros rapidamente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/minha-academia"
            className="flex items-center gap-2 transition-all"
            style={{ background: 'transparent', border: `1px solid ${tokens.cardBorder}`, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem', borderRadius: '12px' }}
          >
            <UserPlus className="w-5 h-5" />
            <span>Link e aprovações</span>
          </Link>
          <Link
            href="/equipe"
            className="flex items-center gap-2 transition-all"
            style={{ background: 'transparent', border: `1px solid ${tokens.cardBorder}`, color: tokens.text, padding: '0.75rem 1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const, fontSize: '0.75rem', borderRadius: '12px' }}
          >
            <UserPlus className="w-5 h-5" />
            <span>Professores</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="hover-card" style={{ ...glass, padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.activeStudents')}</p>
              <p className="text-green-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.ativos}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.statusOverdue')}</p>
              <p className="text-yellow-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.emAtraso}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-white/30" />
          </div>
        </div>

        <div className="hover-card" style={{ ...glass, padding: '1rem' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.statusBlocked')}</p>
              <p className="text-red-400" style={{ fontSize: '2rem', fontWeight: 200, letterSpacing: '-0.02em' }}>{stats.bloqueados}</p>
            </div>
            <Ban className="w-10 h-10 text-white/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="premium-card" style={{ ...glass, padding: '1.5rem' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('users.search')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('users.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-2.5 focus:outline-none" style={{ background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${tokens.inputBorder}`, color: tokens.text, borderRadius: 0 }}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusOperacional | 'TODOS')}
              className="w-full px-4 py-2.5 focus:outline-none" style={{ background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${tokens.inputBorder}`, color: tokens.text, borderRadius: 0 }}
            >
              <option value="TODOS">{t('users.allStatuses')}</option>
              <option value="ATIVO">{t('users.statusActive')}</option>
              <option value="EM_ATRASO">{t('users.statusOverdue')}</option>
              <option value="BLOQUEADO">{t('users.statusBlocked')}</option>
              <option value="CONGELADO">{t('users.statusFrozen')}</option>
              <option value="INATIVO">{t('users.statusInactive')}</option>
            </select>
          </div>

          {/* Tipo Filter */}
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>
              {t('users.thCategory')}
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoUsuario | 'TODOS')}
              className="w-full px-4 py-2.5 focus:outline-none" style={{ background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: `1px solid ${tokens.inputBorder}`, color: tokens.text, borderRadius: 0 }}
            >
              <option value="TODOS">{t('users.allCategories')}</option>
              <option value="ALUNO">{t('users.students')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="th-premium">
                  {t('users.thStudent')}
                </th>
                <th className="th-premium">
                  {t('users.thCategory')}
                </th>
                <th className="th-premium">
                  {t('users.thGraduation')}
                </th>
                <th className="th-premium">
                  {t('users.thStatus')}
                </th>
                <th className="th-premium">
                  {t('users.thDueDate')}
                </th>
                <th className="th-premium">
                  {t('users.thActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: tokens.text }}>{user.nome}</p>
                        <p className="text-xs" style={{ color: tokens.textMuted }}>{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.categoria === 'ADULTO'
                        ? 'bg-white/10 text-white'
                        : 'bg-pink-600/20 text-pink-400'
                    }`}>
                      {user.categoria === 'ADULTO' ? t('users.categoryAdult') : 'Kids'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className="text-sm" style={{ color: tokens.text }}>{user.graduacao}</span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <span className={`text-sm ${
                      user.status === 'EM_ATRASO' || user.status === 'BLOQUEADO'
                        ? 'text-red-400 font-medium'
                        : 'text-white/50'
                    }`}>
                      {user.proximoVencimento
                        ? formatDate(user.proximoVencimento, 'short')
                        : '-'
                      }
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title={t('users.viewDetails')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title={t('users.edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                        title={t('users.changeStatus')}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="empty-state-premium text-center py-12">
            <Filter className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p style={{ fontWeight: 300, color: tokens.textMuted }}>
              {isSearching
                ? 'Nenhum aluno encontrado com os filtros atuais.'
                : 'Sua academia ainda nao tem alunos cadastrados nesta lista.'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{selectedUser.nome}</h2>
                  <p style={{ fontWeight: 300, color: tokens.textMuted }}>{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-white/50 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.phone')}</p>
                    <p style={{ color: tokens.text, fontWeight: 500 }}>{selectedUser.telefone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>Status</p>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.thCategory')}</p>
                    <p style={{ color: tokens.text, fontWeight: 500 }}>{selectedUser.categoria}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.thGraduation')}</p>
                    <p style={{ color: tokens.text, fontWeight: 500 }}>{selectedUser.graduacao}</p>
                  </div>
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.registrationDate')}</p>
                    <p style={{ color: tokens.text, fontWeight: 500 }}>
                      {formatDate(selectedUser.dataCadastro, 'short')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-normal mb-1" style={{ color: 'var(--text-secondary)' }}>{t('users.nextDueDate')}</p>
                    <p style={{ color: tokens.text, fontWeight: 500 }}>
                      {selectedUser.proximoVencimento
                        ? formatDate(selectedUser.proximoVencimento, 'short')
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {selectedUser.observacoes && (
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
                    <p className="text-sm text-yellow-400">{selectedUser.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-xl transition-colors font-medium">
                    {t('users.editStudent')}
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                    {t('users.viewHistory')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
