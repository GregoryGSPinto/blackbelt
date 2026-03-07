'use client';

/**
 * RoleGuard — Componente de controle de acesso por role/permissão
 *
 * Uso em layouts:
 *   <RoleGuard roles={['SYS_AUDITOR']} fallback="/login">
 *     {children}
 *   </RoleGuard>
 *
 * Uso inline (mostrar/ocultar UI):
 *   <RoleGuard roles={['INSTRUTOR']} silent>
 *     <button>Ação restrita</button>
 *   </RoleGuard>
 */

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_PERMISSIONS } from '@/lib/api/contracts';
import type { SecurityRole, SecurityPermission } from '@/lib/api/contracts';
import { Shield, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface RoleGuardProps {
  children: ReactNode;
  /** Roles permitidas (OR — qualquer uma) */
  roles: SecurityRole[];
  /** Permissões específicas necessárias (AND — todas) */
  permissions?: SecurityPermission[];
  /** Rota de redirect se acesso negado (default: /login) */
  fallback?: string;
  /** Se true, apenas oculta children sem redirect */
  silent?: boolean;
  /** Mensagem customizada de acesso negado */
  deniedMessage?: string;
}

export function RoleGuard({
  children,
  roles,
  permissions,
  fallback = '/login',
  silent = false,
  deniedMessage,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!silent) router.replace(fallback);
      setChecked(true);
      setAllowed(false);
      return;
    }

    // Check role
    const userRole = mapUserToRole(user.tipo);
    const hasRole = roles.includes(userRole) || userRole === 'ADMIN';

    if (!hasRole) {
      if (!silent) router.replace(fallback);
      setChecked(true);
      setAllowed(false);
      return;
    }

    // Check specific permissions
    if (permissions && permissions.length > 0) {
      const rolePerms = ROLE_PERMISSIONS[userRole] || [];
      const hasAllPerms = permissions.every((p) => rolePerms.includes(p));
      if (!hasAllPerms) {
        if (!silent) router.replace(fallback);
        setChecked(true);
        setAllowed(false);
        return;
      }
    }

    setChecked(true);
    setAllowed(true);
  }, [user, loading, roles, permissions, fallback, silent, router]);

  // Loading state
  if (loading || !checked) {
    if (silent) return null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a]">
        <div className="animate-pulse flex items-center gap-3 text-white/40">
          <Shield className="w-5 h-5" />
          <span className="text-sm">{t('profileSelection.verifyingAccess')}</span>
        </div>
      </div>
    );
  }

  // Silent mode: just hide
  if (silent && !allowed) return null;

  // Access denied (non-silent, before redirect)
  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">{t('profileSelection.accessRestricted')}</h2>
          <p className="text-sm text-white/60 max-w-sm">
            {deniedMessage || t('profileSelection.noPermission')}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Helper ──

function mapUserToRole(tipo: string): SecurityRole {
  const map: Record<string, SecurityRole> = {
    ALUNO_ADULTO: 'ALUNO_ADULTO',
    ALUNO_KIDS: 'ALUNO_KIDS',
    ALUNO_TEEN: 'ALUNO_ADOLESCENTE',
    RESPONSAVEL: 'RESPONSAVEL',
    INSTRUTOR: 'INSTRUTOR',
    // Corporativo
    SUPPORT: 'SUPPORT',
    UNIT_OWNER: 'UNIT_OWNER',
    // Legacy → canônico
    GESTOR: 'UNIT_OWNER',
    ADMINISTRADOR: 'UNIT_OWNER',
    // SUPER_ADMIN mantém como ADMIN (acesso total) — compatibilidade
    SUPER_ADMIN: 'ADMIN',
    SYS_AUDITOR: 'SUPPORT',
  };
  return map[tipo] || 'ALUNO_ADULTO';
}
