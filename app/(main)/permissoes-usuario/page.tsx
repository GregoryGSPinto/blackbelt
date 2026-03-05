'use client';

import { useUserProfile, PERMISSOES, PERFIL_INFO } from '@/contexts/AuthContext';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function PermissoesUsuarioPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { perfil } = useUserProfile();

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>Você precisa estar logado para ver as permissões</p>
        </div>
      </div>
    );
  }

  const info = PERFIL_INFO[perfil.tipo];

  const todasPermissoes = [
    { id: PERMISSOES.VALIDAR_CHECKIN, nome: 'Validar Check-in', descricao: 'Pode validar presença de alunos' },
    { id: PERMISSOES.BLOQUEAR_ALUNO, nome: 'Bloquear Aluno', descricao: 'Pode bloquear acesso de alunos' },
    { id: PERMISSOES.EDITAR_TURMAS, nome: 'Editar Turmas', descricao: 'Pode editar e gerenciar turmas' },
    { id: PERMISSOES.ACESSAR_FINANCEIRO, nome: 'Acessar Financeiro', descricao: 'Pode ver informações financeiras' },
    { id: PERMISSOES.EDITAR_PAGAMENTOS, nome: 'Editar Pagamentos', descricao: 'Pode validar pagamentos' },
    { id: PERMISSOES.VER_RELATORIOS, nome: 'Ver Relatórios', descricao: 'Pode acessar relatórios e analytics' },
    { id: PERMISSOES.GERENCIAR_USUARIOS, nome: 'Gerenciar Usuários', descricao: 'Pode criar, editar e remover usuários' },
    { id: PERMISSOES.ACESSAR_CONFIGURACOES, nome: 'Acessar Configurações', descricao: 'Pode alterar configurações do sistema' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>Minhas Permissões</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>Visualize suas permissões e nível de acesso no sistema</p>
      </div>

      {/* Perfil Atual */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${info.cor} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
            {info.icone}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">{perfil.nome}</h3>
            <p className="text-white/40 mb-3">{perfil.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm" style={{ color: tokens.textMuted }}>Perfil Ativo</span>
                <p style={{ color: tokens.text, fontWeight: 500 }}>{info.label}</p>
              </div>
              {perfil.graduacao && (
                <div>
                  <span className="text-sm" style={{ color: tokens.textMuted }}>Graduação</span>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{perfil.graduacao}</p>
                </div>
              )}
              {perfil.unidade && (
                <div>
                  <span className="text-sm" style={{ color: tokens.textMuted }}>Unidade</span>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{perfil.unidade}</p>
                </div>
              )}
              <div>
                <span className="text-sm" style={{ color: tokens.textMuted }}>Nível de Acesso</span>
                <p style={{ color: tokens.text, fontWeight: 500 }}>
                  {perfil.tipo === 'SUPER_ADMIN' && 'Acesso Total'}
                  {perfil.tipo === 'ADMINISTRADOR' && 'Acesso Administrativo'}
                  {perfil.tipo === 'GESTOR' && 'Acesso Gestão'}
                  {perfil.tipo === 'INSTRUTOR' && 'Acesso Professor'}
                  {perfil.tipo === 'ALUNO_ADULTO' && 'Acesso Aluno'}
                  {perfil.tipo === 'ALUNO_KIDS' && 'Acesso Kids'}
                  {perfil.tipo === 'RESPONSAVEL' && 'Acesso Responsável'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerta Informativo */}
      <div className="bg-blue-900/20 border border-blue-800/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-300">
              As permissões são definidas pelo seu perfil de acesso. Se você precisar de permissões adicionais, entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Permissões */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-elevated">
          <h3 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Permissões do Sistema</h3>
        </div>
        
        <div className="divide-y divide-dark-elevated">
          {todasPermissoes.map((permissao) => {
            const hasPermission = perfil.permissoes.includes(permissao.id);
            
            return (
              <div key={permissao.id} className="p-6 flex items-center justify-between hover:bg-dark-elevated/30 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasPermission ? 'bg-green-600/20' : 'bg-dark-elevated'
                  }`}>
                    {hasPermission ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white/30" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">
                      {permissao.nome}
                    </h4>
                    <p className="text-sm" style={{ color: tokens.textMuted }}>
                      {permissao.descricao}
                    </p>
                  </div>
                </div>
                
                <div>
                  {hasPermission ? (
                    <span className="px-3 py-1 bg-green-600/20 border border-green-600/30 text-green-400 text-xs font-medium rounded-full">
                      Concedida
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-dark-elevated border border-dark-surface text-white/35 text-xs font-medium rounded-full">
                      Não Concedida
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total de Permissões */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Resumo de Permissões</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>Total de permissões concedidas ao seu perfil</p>
          </div>
          <div className="text-right">
            <p className="text-purple-400" style={{ fontSize: '2.5rem', fontWeight: 200, letterSpacing: '-0.03em' }}>{perfil.permissoes.length}</p>
            <p className="text-sm" style={{ color: tokens.textMuted }}>de {todasPermissoes.length} possíveis</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-dark-elevated rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all"
            style={{ width: `${(perfil.permissoes.length / todasPermissoes.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
