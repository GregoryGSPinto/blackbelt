'use client';

/**
 * ModuleGuard — Controle de acesso por módulo administrativo
 *
 * Verifica se o módulo solicitado está dentro de MODULE_ACCESS[user.role].
 * Se não:
 *   1. Registra evento SECURITY_DENIED_ACCESS
 *   2. Exibe tela AccessDenied
 *   3. Nunca renderiza o módulo não autorizado
 *
 * Uso:
 *   <ModuleGuard module="FINANCE">
 *     <FinanceContent />
 *   </ModuleGuard>
 */

import { ReactNode, useEffect, useState, useMemo } from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import type { AdminModule, SecurityRole } from '@/lib/api/contracts';
import { resolveCanonicalRole, MODULE_ACCESS } from '@/lib/api/contracts';
import { MODULE_META } from '@/lib/admin/module-registry';
import { structuredLog } from '@/lib/monitoring/structured-logger';

interface ModuleGuardProps {
  children: ReactNode;
  module: AdminModule;
}

export function ModuleGuard({ children, module }: ModuleGuardProps) {
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);

  const allowed = useMemo(() => {
    if (!user) return false;
    const role = mapTipoToRole(user.tipo);
    const canonical = resolveCanonicalRole(role);
    if (!canonical) return false;
    return MODULE_ACCESS[canonical].includes(module);
  }, [user, module]);

  // Log denied access
  useEffect(() => {
    if (loading || !user) return;
    setChecked(true);

    if (!allowed) {
      const role = mapTipoToRole(user.tipo);
      structuredLog.security.error('SECURITY_DENIED_ACCESS', {
        actor_id: user.id || 'unknown',
        role,
        module,
        action: 'module_access_denied',
        unit_id: (user as unknown as Record<string, unknown>).unidadeId as string || 'unknown',
        timestamp: new Date().toISOString(),
        detail: `Role ${role} attempted to access module ${module}`,
      });
    }
  }, [loading, user, allowed, module]);

  // Loading
  if (loading || !checked) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-3 text-white/30">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Verificando acesso ao módulo...</span>
        </div>
      </div>
    );
  }

  // Access denied
  if (!allowed) {
    const meta = MODULE_META[module];
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-5">
          {/* Icon */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-white">Acesso Negado</h2>
            <p className="text-sm text-white/40 mt-1">
              Módulo <span className={`font-semibold ${meta.color}`}>{meta.label}</span> não está autorizado para seu perfil.
            </p>
          </div>

          {/* Explanation */}
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-left">
            <p className="text-xs text-white/50 leading-relaxed">
              {user?.tipo === 'SUPPORT' || user?.tipo === 'SYS_AUDITOR' ? (
                <>
                  Como <strong className="text-emerald-400">Operador da Plataforma</strong>, você tem acesso apenas aos módulos técnicos (Técnico, Segurança, IA).
                  Dados financeiros e pedagógicos são controlados exclusivamente pelo proprietário da unidade.
                </>
              ) : (
                <>
                  Como <strong className="text-amber-400">Controlador da Unidade</strong>, você tem acesso aos módulos de negócio (Executivo, Financeiro, Operações, Pedagogia).
                  Módulos técnicos e de segurança são gerenciados pela equipe de suporte.
                </>
              )}
            </p>
          </div>

          {/* Security notice */}
          <p className="text-[10px] text-red-400/40 font-mono">
            Este evento foi registrado no audit log de segurança.
          </p>

          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// ── Helper ──

function mapTipoToRole(tipo: string): SecurityRole {
  const map: Record<string, SecurityRole> = {
    SUPPORT: 'SUPPORT',
    UNIT_OWNER: 'UNIT_OWNER',
    GESTOR: 'UNIT_OWNER',
    ADMINISTRADOR: 'UNIT_OWNER',
    SUPER_ADMIN: 'UNIT_OWNER',
    SYS_AUDITOR: 'SUPPORT',
    INSTRUTOR: 'INSTRUTOR',
    ALUNO_ADULTO: 'ALUNO_ADULTO',
    ALUNO_KIDS: 'ALUNO_KIDS',
    ALUNO_TEEN: 'ALUNO_ADOLESCENTE',
    RESPONSAVEL: 'RESPONSAVEL',
  };
  return map[tipo] || 'ALUNO_ADULTO';
}
