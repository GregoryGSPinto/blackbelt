'use client';

/**
 * RoleGuard — Guard baseado em TipoPerfil (novo sistema de permissões)
 *
 * Uso:
 *   <RoleGuard roles={['SUPER_ADMIN']}>{children}</RoleGuard>
 *   <RoleGuard roles={['SUPER_ADMIN', 'SUPPORT']} fallback="/login">{children}</RoleGuard>
 *   <RoleGuard roles={['INSTRUTOR']} silent>{children}</RoleGuard>
 */

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getRedirectForProfile } from '@/contexts/AuthContext';
import type { TipoPerfil } from '@/lib/api/contracts';
import { Shield, Lock } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  /** Roles permitidas (OR — qualquer uma) */
  roles: TipoPerfil[];
  /** Rota de redirect se acesso negado */
  fallback?: string;
  /** Se true, apenas oculta children sem redirect */
  silent?: boolean;
  /** Mensagem customizada de acesso negado */
  deniedMessage?: string;
}

export function RoleGuard({
  children,
  roles,
  fallback,
  silent = false,
  deniedMessage,
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (!silent) router.replace(fallback || '/login');
      setChecked(true);
      setAllowed(false);
      return;
    }

    // SUPER_ADMIN tem acesso a tudo
    if (user.tipo === 'SUPER_ADMIN') {
      setChecked(true);
      setAllowed(true);
      return;
    }

    const hasRole = roles.includes(user.tipo);
    if (!hasRole) {
      if (!silent) {
        const dest = fallback || getRedirectForProfile(user.tipo);
        router.replace(dest);
      }
      setChecked(true);
      setAllowed(false);
      return;
    }

    setChecked(true);
    setAllowed(true);
  }, [user, loading, roles, fallback, silent, router]);

  if (loading || !checked) {
    if (silent) return null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-pulse flex items-center gap-3 text-white/40">
          <Shield className="w-5 h-5" />
          <span className="text-sm">Verificando acesso...</span>
        </div>
      </div>
    );
  }

  if (silent && !allowed) return null;

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Acesso Restrito</h2>
          <p className="text-sm text-white/60 max-w-sm">
            {deniedMessage || 'Você não tem permissão para acessar esta área. Redirecionando...'}
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
