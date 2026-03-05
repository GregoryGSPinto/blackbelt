'use client';

import { useState, useEffect } from 'react';
import { Shield, Check, X , ShieldOff} from 'lucide-react';
import * as adminService from '@/lib/api/admin.service';
import { type PerfilAcesso, type PerfilPermissoes, type Permissao } from '@/lib/api/admin.service';
import { PageError, PageEmpty, handleServiceError } from '@/components/shared/DataStates';
import { PremiumLoader } from '@/components/shared/PremiumLoader';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function PermissoesPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: `1px solid ${tokens.cardBorder}`, backdropFilter: 'blur(12px) saturate(1.2)', WebkitBackdropFilter: 'blur(12px) saturate(1.2)', borderRadius: '4px' } as const;

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
    return <PremiumLoader text="Carregando..." />;
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
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('permissions.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Controle de acesso baseado em perfis</p>
      </div>

      {/* Info Alert */}
      <div style={{ ...glass, padding: '1rem' }}>
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-white/70 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm" style={{ color: tokens.textMuted }}>
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
            <p className="text-xs" style={{ color: tokens.textMuted }}>{perfil.descricao}</p>
          </button>
        ))}
      </div>

      {/* Permissões do Perfil Selecionado */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text, marginBottom: '1.5rem' }}>
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
                          <p className="text-xs" style={{ color: tokens.textMuted }}>{perm.descricao}</p>
                        </div>
                      </div>
                      
                      <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          hasPermission
                            ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30'
                            : 'bg-white/5 text-green-400 hover:bg-white/10 border border-white/10/30'
                        }`}
                      >
                        {hasPermission ? t('permissions.revoke') : t('permissions.grant')}
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
