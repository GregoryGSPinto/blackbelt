'use client';

// ============================================================
// /developer-danger — Danger Zone (System Controls)
// ============================================================
// Isolated panel with destructive system actions.
// Red borders. ConfirmModal required for all actions.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle, Power, Shield, GitCommit, Calendar, Server,
  RefreshCw, LogOut, Wrench, Terminal,
} from 'lucide-react';
import { getDangerZoneInfo, forceLogoutAll, toggleMaintenanceMode } from '@/lib/api/developer.service';
import type { DangerZoneInfo } from '@/lib/api/developer.service';
import { ConfirmModal } from '@/components/shared/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function DeveloperDangerPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const [info, setInfo] = useState<DangerZoneInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutAll, setShowLogoutAll] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDangerZoneInfo();
      setInfo(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleForceLogout = async () => {
    setActionLoading(true);
    try {
      const result = await forceLogoutAll();
      toast.success(`Force logout executado. ${result.affected} sessões encerradas.`);
      setShowLogoutAll(false);
      refresh();
    } catch {
      toast.error('Erro ao executar force logout.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleMaintenance = async () => {
    if (!info) return;
    setActionLoading(true);
    try {
      await toggleMaintenanceMode(!info.maintenanceMode);
      toast.success(
        info.maintenanceMode ? 'Modo manutenção desativado.' : 'Modo manutenção ativado.'
      );
      setShowMaintenance(false);
      refresh();
    } catch {
      toast.error('Erro ao alterar modo manutenção.');
    } finally {
      setActionLoading(false);
    }
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="space-y-6 dev-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-red-400">Danger Zone</h1>
            <p className="text-[10px] text-white/30 font-mono">Destructive system actions — use with caution</p>
          </div>
        </div>
        <button onClick={refresh} disabled={loading} className="p-2 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* System Info */}
      {info && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { icon: GitCommit, label: 'Commit', value: info.commitHash },
            { icon: Calendar, label: 'Deploy', value: fmtDate(info.deployDate) },
            { icon: Server, label: 'Environment', value: info.environment.toUpperCase() },
            { icon: Terminal, label: 'Node', value: info.nodeVersion },
            { icon: Terminal, label: 'Next.js', value: info.nextVersion },
            { icon: Power, label: 'Sessions', value: info.activeSessions.toString() },
          ].map((item) => (
            <div key={item.label} className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="w-3 h-3 text-white/30" />
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{item.label}</p>
              </div>
              <p className="text-sm font-mono text-white/80">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Status */}
      {info && (
        <div className={`p-4 rounded-lg border-2 ${
          info.maintenanceMode
            ? 'border-yellow-500/40 bg-yellow-500/5'
            : 'border-emerald-500/20 bg-emerald-500/5'
        }`}>
          <div className="flex items-center gap-2">
            <Wrench className={`w-4 h-4 ${info.maintenanceMode ? 'text-yellow-400' : 'text-emerald-400'}`} />
            <span className="text-sm font-semibold text-white">
              Maintenance Mode: {info.maintenanceMode ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
          <p className="text-[10px] text-white/40 mt-1">
            {info.maintenanceMode
              ? 'O sistema está em manutenção. Apenas SYS_AUDITOR pode acessar.'
              : 'Sistema operando normalmente.'}
          </p>
        </div>
      )}

      {/* Danger Actions */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-red-400/60 uppercase tracking-wider">Ações Destrutivas</h2>

        {/* Force Logout All */}
        <div className="p-4 bg-red-500/[0.03] border-2 border-red-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Force Logout All</h3>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                Encerra TODAS as sessões ativas. Todos os usuários serão forçados a fazer login novamente.
              </p>
            </div>
            <button
              onClick={() => setShowLogoutAll(true)}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors shrink-0"
            >
              Execute
            </button>
          </div>
        </div>

        {/* Toggle Maintenance */}
        <div className="p-4 bg-red-500/[0.03] border-2 border-red-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-white">Toggle Maintenance Mode</h3>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                {info?.maintenanceMode
                  ? 'Desativar modo manutenção. O sistema voltará ao funcionamento normal.'
                  : 'Ativar modo manutenção. Apenas SYS_AUDITOR poderá acessar o sistema.'}
              </p>
            </div>
            <button
              onClick={() => setShowMaintenance(true)}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors shrink-0"
            >
              {info?.maintenanceMode ? 'Disable' : 'Enable'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showLogoutAll}
        onCancel={() => setShowLogoutAll(false)}
        onConfirm={handleForceLogout}
        loading={actionLoading}
        variant="danger"
        title="Force Logout All"
        message={`Tem certeza? Isso encerrará ${info?.activeSessions || 'todas as'} sessões ativas. Todos os usuários serão desconectados imediatamente.`}
        requireTyping="LOGOUT"
        confirmLabel="Executar Force Logout"
      />

      <ConfirmModal
        open={showMaintenance}
        onCancel={() => setShowMaintenance(false)}
        onConfirm={handleToggleMaintenance}
        loading={actionLoading}
        variant="warning"
        title={info?.maintenanceMode ? 'Desativar Manutenção' : 'Ativar Manutenção'}
        message={info?.maintenanceMode
          ? 'O sistema voltará ao funcionamento normal e todos os perfis poderão acessar.'
          : 'O sistema entrará em modo manutenção. Apenas SYS_AUDITOR terá acesso.'}
        confirmLabel={info?.maintenanceMode ? 'Desativar' : 'Ativar Manutenção'}
      />
    </div>
  );
}
