'use client';

import { useUserProfile, PERMISSOES, PERFIL_INFO } from '@/features/auth/context/AuthContext';
import { useTranslations } from 'next-intl';
import { Shield, CheckCircle, XCircle, Info } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function PermissoesUsuarioPage() {
  const t = useTranslations('athlete');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { perfil } = useUserProfile();

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('permissions.loginRequired')}</p>
        </div>
      </div>
    );
  }

  const info = PERFIL_INFO[perfil.tipo];

  const todasPermissoes = [
    { id: PERMISSOES.VALIDAR_CHECKIN, nome: t('permissions.items.validateCheckin'), descricao: t('permissions.items.validateCheckinDesc') },
    { id: PERMISSOES.BLOQUEAR_ALUNO, nome: t('permissions.items.blockStudent'), descricao: t('permissions.items.blockStudentDesc') },
    { id: PERMISSOES.EDITAR_TURMAS, nome: t('permissions.items.editClasses'), descricao: t('permissions.items.editClassesDesc') },
    { id: PERMISSOES.ACESSAR_FINANCEIRO, nome: t('permissions.items.accessFinancial'), descricao: t('permissions.items.accessFinancialDesc') },
    { id: PERMISSOES.EDITAR_PAGAMENTOS, nome: t('permissions.items.editPayments'), descricao: t('permissions.items.editPaymentsDesc') },
    { id: PERMISSOES.VER_RELATORIOS, nome: t('permissions.items.viewReports'), descricao: t('permissions.items.viewReportsDesc') },
    { id: PERMISSOES.GERENCIAR_USUARIOS, nome: t('permissions.items.manageUsers'), descricao: t('permissions.items.manageUsersDesc') },
    { id: PERMISSOES.ACESSAR_CONFIGURACOES, nome: t('permissions.items.accessSettings'), descricao: t('permissions.items.accessSettingsDesc') },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{t('permissions.title')}</h1>
        <p style={{ fontWeight: 300, color: tokens.textMuted }}>{t('permissions.subtitle')}</p>
      </div>

      {/* Perfil Atual */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl p-6 hover-card">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${info.cor} rounded-xl flex items-center justify-center text-3xl flex-shrink-0`}>
            {info.icone}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white mb-1">{perfil.nome}</h3>
            <p className="text-white/40 mb-3">{perfil.email}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.activeProfile')}</span>
                <p style={{ color: tokens.text, fontWeight: 500 }}>{info.label}</p>
              </div>
              {perfil.graduacao && (
                <div>
                  <span className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.graduation')}</span>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{perfil.graduacao}</p>
                </div>
              )}
              {perfil.unidade && (
                <div>
                  <span className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.unit')}</span>
                  <p style={{ color: tokens.text, fontWeight: 500 }}>{perfil.unidade}</p>
                </div>
              )}
              <div>
                <span className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.accessLevel')}</span>
                <p style={{ color: tokens.text, fontWeight: 500 }}>
                  {perfil.tipo === 'SUPER_ADMIN' && t('permissions.accessLevels.fullAccess')}
                  {perfil.tipo === 'ADMINISTRADOR' && t('permissions.accessLevels.adminAccess')}
                  {perfil.tipo === 'GESTOR' && t('permissions.accessLevels.managerAccess')}
                  {perfil.tipo === 'INSTRUTOR' && t('permissions.accessLevels.instructorAccess')}
                  {perfil.tipo === 'ALUNO_ADULTO' && t('permissions.accessLevels.studentAccess')}
                  {perfil.tipo === 'ALUNO_KIDS' && t('permissions.accessLevels.kidsAccess')}
                  {perfil.tipo === 'RESPONSAVEL' && t('permissions.accessLevels.guardianAccess')}
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
              {t('permissions.infoAlert')}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Permissões */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl overflow-hidden">
        <div className="p-6 border-b border-dark-elevated">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{t('permissions.systemPermissions')}</h3>
        </div>
        
        <div className="divide-y divide-dark-elevated">
          {todasPermissoes.map((permissao) => {
            const hasPermission = perfil.permissoes.includes(permissao.id);
            
            return (
              <div key={permissao.id} className="p-6 flex items-center justify-between hover:bg-dark-elevated/30 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
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
                      {t('permissions.granted')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-dark-elevated border border-dark-surface text-white/35 text-xs font-medium rounded-full">
                      {t('permissions.notGranted')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total de Permissões */}
      <div className="bg-dark-card border border-dark-elevated rounded-xl p-6 hover-card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{t('permissions.summary')}</h3>
            <p className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.summaryDesc')}</p>
          </div>
          <div className="text-right">
            <p className="text-purple-400" style={{ fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.03em' }}>{perfil.permissoes.length}</p>
            <p className="text-sm" style={{ color: tokens.textMuted }}>{t('permissions.ofTotal', { total: todasPermissoes.length })}</p>
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
