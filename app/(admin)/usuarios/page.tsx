'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, UserPlus, Eye, Edit2, Ban, CheckCircle, AlertCircle, XCircle, Snowflake, UserX } from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import type { Usuario, StatusOperacional, TipoUsuario } from '@/lib/api/admin.service';
import { useSearchRegistration, type SearchItem } from '@/contexts/GlobalSearchContext';
import { PageError, handleServiceError } from '@/components/shared/DataStates';

export default function UsuariosPage() {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Carregando usuários...</p>
        </div>
      </div>
    );
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
        label: 'Ativo'
      },
      EM_ATRASO: {
        bg: 'bg-yellow-600/20',
        border: 'border-yellow-600/30',
        text: 'text-yellow-400',
        icon: AlertCircle,
        label: 'Em Atraso'
      },
      BLOQUEADO: {
        bg: 'bg-red-600/20',
        border: 'border-red-600/30',
        text: 'text-red-400',
        icon: XCircle,
        label: 'Bloqueado'
      },
      CONGELADO: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        text: 'text-cyan-400',
        icon: Snowflake,
        label: 'Congelado'
      },
      INATIVO: {
        bg: 'bg-black/30',
        border: 'border-white/[0.06]',
        text: 'text-white/30',
        icon: UserX,
        label: 'Inativo'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Usuários</h1>
          <p className="text-white/50">Gerenciar alunos, instrutores e usuários do sistema</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium">
          <UserPlus className="w-5 h-5" />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Alunos Ativos</p>
              <p className="text-3xl font-bold text-green-400">{stats.ativos}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-white/40" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Em Atraso</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.emAtraso}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-white/30" />
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50 mb-1">Bloqueados</p>
              <p className="text-3xl font-bold text-red-400">{stats.bloqueados}</p>
            </div>
            <Ban className="w-10 h-10 text-white/30" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-white/50 mb-2">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou e-mail..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusOperacional | 'TODOS')}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">Ativos</option>
              <option value="EM_ATRASO">Em Atraso</option>
              <option value="BLOQUEADO">Bloqueados</option>
              <option value="CONGELADO">Congelados</option>
              <option value="INATIVO">Inativos</option>
            </select>
          </div>

          {/* Tipo Filter */}
          <div>
            <label className="block text-sm font-medium text-white/50 mb-2">
              Categoria
            </label>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value as TipoUsuario | 'TODOS')}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            >
              <option value="TODOS">Todas as Categorias</option>
              <option value="ALUNO">Alunos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Graduação
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-white/50 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{user.nome}</p>
                        <p className="text-xs text-white/40">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.categoria === 'ADULTO' 
                        ? 'bg-white/10 text-white' 
                        : 'bg-pink-600/20 text-pink-400'
                    }`}>
                      {user.categoria === 'ADULTO' ? 'Adulto' : 'Kids'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/70">{user.graduacao}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${
                      user.status === 'EM_ATRASO' || user.status === 'BLOQUEADO'
                        ? 'text-red-400 font-medium'
                        : 'text-white/50'
                    }`}>
                      {user.proximoVencimento 
                        ? new Date(user.proximoVencimento).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                        title="Alterar Status"
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
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <p className="text-white/50">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedUser.nome}</h2>
                  <p className="text-white/50">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-white/50 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-white/50 mb-1">Telefone</p>
                    <p className="text-white font-medium">{selectedUser.telefone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Status</p>
                    {getStatusBadge(selectedUser.status)}
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Categoria</p>
                    <p className="text-white font-medium">{selectedUser.categoria}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Graduação</p>
                    <p className="text-white font-medium">{selectedUser.graduacao}</p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Data de Cadastro</p>
                    <p className="text-white font-medium">
                      {new Date(selectedUser.dataCadastro).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-white/50 mb-1">Próximo Vencimento</p>
                    <p className="text-white font-medium">
                      {selectedUser.proximoVencimento 
                        ? new Date(selectedUser.proximoVencimento).toLocaleDateString('pt-BR')
                        : '-'
                      }
                    </p>
                  </div>
                </div>

                {selectedUser.observacoes && (
                  <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg p-4">
                    <p className="text-sm text-yellow-400">{selectedUser.observacoes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-2 bg-white/10 border border-white/10 hover:bg-white/15 text-white rounded-lg transition-colors font-medium">
                    Editar Aluno
                  </button>
                  <button className="px-4 py-2 bg-white/10 hover:bg-white/10 text-white rounded-lg transition-colors font-medium">
                    Ver Histórico
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
