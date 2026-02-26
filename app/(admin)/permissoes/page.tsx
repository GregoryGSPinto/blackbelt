'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X , ShieldOff} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import { type PerfilAcesso, type PerfilPermissoes, type Permissao } from '@/lib/api/admin.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';

export default function PermissoesPage() {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [perfilPermissoes, setPerfilPermissoes] = useState<PerfilPermissoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilAcesso>('INSTRUTOR');

  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        const [permData, perfilData] = await Promise.all([
          adminService.getPermissoes(),
          adminService.getPerfilPermissoes(),
        ]);
        setPermissoes(permData);
        setPerfilPermissoes(perfilData);
      } catch (err) {
        setError(handleServiceError(err, 'Permissoes'));

      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }
  if (permissoes.length === 0) {
    return <PageEmpty icon={ShieldOff} title="Nenhuma permissão configurada" message="As permissões do sistema ainda não foram configuradas." />;
  }


  const perfis: { id: PerfilAcesso; nome: string; descricao: string; color: string }[] = [
    { id: 'INSTRUTOR', nome: 'Instrutor', descricao: 'Acesso limitado às próprias turmas', color: 'from-white/20 to-white/10' },
    { id: 'COORDENADOR', nome: 'Coordenador', descricao: 'Gerenciar turmas e horários', color: 'from-green-600 to-green-800' },
    { id: 'GESTOR', nome: 'Gestor', descricao: 'Acesso administrativo completo', color: 'from-white/20 to-white/10' },
    { id: 'ADMINISTRADOR', nome: 'Administrador', descricao: 'Gerenciar usuários e sistema', color: 'from-white/20 to-white/10' },
    { id: 'SUPER_ADMIN', nome: 'Super Admin', descricao: 'Acesso total ao sistema', color: 'from-red-600 to-red-800' },
  ];

  const perfilSelecionado = perfilPermissoes.find(p => p.perfil === selectedPerfil);
  const permissoesDoPerfilSet = new Set(perfilSelecionado?.permissoes || []);

  // Agrupar permissões por categoria
  const permissoesPorCategoria = permissoes.reduce((acc, perm) => {
    if (!acc[perm.categoria]) {
      acc[perm.categoria] = [];
    }
    acc[perm.categoria].push(perm);
    return acc;
  }, {} as Record<string, typeof permissoes>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Permissões (RBAC)</h1>
        <p className="text-white/50">Controle de acesso baseado em perfis</p>
      </div>

      {/* Info Alert */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white/50">
              As permissões são simuladas visualmente neste painel. 
              Selecione um perfil para visualizar suas permissões disponíveis.
            </p>
          </div>
        </div>
      </div>

      {/* Perfis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {perfis.map((perfil) => (
          <button
            key={perfil.id}
            onClick={() => setSelectedPerfil(perfil.id)}
            className={`text-left p-4 rounded-xl transition-all ${
              selectedPerfil === perfil.id
                ? 'bg-white/10 border-2 border-white/20 shadow-lg shadow-white/5'
                : 'bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/15'
            }`}
          >
            <div className={`w-12 h-12 bg-gradient-to-br ${perfil.color} rounded-lg flex items-center justify-center mb-3`}>
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">{perfil.nome}</h3>
            <p className="text-xs text-white/50">{perfil.descricao}</p>
          </button>
        ))}
      </div>

      {/* Permissões do Perfil Selecionado */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-6">
          Permissões do Perfil: {perfis.find(p => p.id === selectedPerfil)?.nome}
        </h3>

        <div className="space-y-6">
          {Object.entries(permissoesPorCategoria).map(([categoria, perms]) => (
            <div key={categoria}>
              <h4 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">
                {categoria}
              </h4>
              <div className="space-y-2">
                {perms.map((perm) => {
                  const hasPermission = permissoesDoPerfilSet.has(perm.id);
                  
                  return (
                    <div
                      key={perm.id}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        hasPermission
                          ? 'bg-white/5 border border-white/10'
                          : 'bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          hasPermission
                            ? 'bg-white/10 border border-white/10'
                            : 'bg-white/10'
                        }`}>
                          {hasPermission ? (
                            <Check className="w-5 h-5 text-white" />
                          ) : (
                            <X className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${
                            hasPermission ? 'text-white' : 'text-white/50'
                          }`}>
                            {perm.nome}
                          </p>
                          <p className="text-xs text-white/40">{perm.descricao}</p>
                        </div>
                      </div>
                      
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasPermission
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-white/5 text-green-400 hover:bg-white/10 border border-white/10/30'
                        }`}
                      >
                        {hasPermission ? 'Remover' : 'Conceder'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
