'use client';

import { useState } from 'react';
import { Save, User, Bell, Globe, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function DeveloperConfiguracoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const glass = { background: tokens.cardBg, border: '1px solid black', borderRadius: '12px' } as const;

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [nome, setNome] = useState('Developer');
  const [email, setEmail] = useState('dev@blackbelt.com');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifAlerts, setNotifAlerts] = useState(true);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>
          Configuracoes
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: tokens.cardBg, border: '1px solid black', color: tokens.text }}
        >
          <Save size={16} />
          {saving ? 'Salvando...' : showSuccess ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Personal Data */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} style={{ color: tokens.textMuted }} />
          <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Dados Pessoais</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
              Nome
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: tokens.text }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, marginBottom: '0.5rem', fontWeight: 400 }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: tokens.text }}
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: tokens.textMuted }} />
          <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Seguranca</h3>
        </div>
        <button
          className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: tokens.text }}
        >
          Alterar Senha
        </button>
      </div>

      {/* Notifications */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} style={{ color: tokens.textMuted }} />
          <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Notificacoes</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: tokens.text }}>Notificacoes por Email</span>
            <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: tokens.text }}>Notificacoes Push</span>
            <input type="checkbox" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: tokens.text }}>Alertas Criticos do Sistema</span>
            <input type="checkbox" checked={notifAlerts} onChange={(e) => setNotifAlerts(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
        </div>
      </div>

      {/* Language & Theme */}
      <div style={{ ...glass, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} style={{ color: tokens.textMuted }} />
          <h3 style={{ fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.text }}>Idioma e Tema</h3>
        </div>
        <p className="text-sm" style={{ color: tokens.textMuted }}>
          Idioma detectado automaticamente. Tema segue preferencia do sistema.
        </p>
      </div>
    </div>
  );
}
