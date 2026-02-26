'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, type TipoPerfil } from '@/contexts/AuthContext';

export function useRequireRole(
  allowedRoles: TipoPerfil[],
  redirectTo = '/login'
) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const hasRole = user ? allowedRoles.includes(user.tipo) : false;

  useEffect(() => {
    if (!loading && !hasRole) {
      router.replace(redirectTo);
    }
  }, [loading, hasRole, router, redirectTo]);

  return { hasRole, loading, user };
}
