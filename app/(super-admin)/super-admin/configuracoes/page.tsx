'use client';

import { useState } from 'react';
import { Save, Building2, Bell, Shield, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function SuperAdminConfiguracoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const card = { background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' } as const;

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Platform settings
  const [platformName, setPlatformName] = useState('BlackBelt Platform');
  const [maxAcademias, setMaxAcademias] = useState('100');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);

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
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Configuracoes
        </h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' }}>
          <Save size={16} />
          {saving ? 'Salvando...' : showSuccess ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Platform Settings */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Configuracoes da Plataforma</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Nome da Plataforma</label>
            <input value={platformName} onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Limite de Academias</label>
            <input type="number" value={maxAcademias} onChange={(e) => setMaxAcademias(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Feature Flags</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Modo Manutencao</span>
            <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Registro de Novas Academias</span>
            <input type="checkbox" checked={registrationOpen} onChange={(e) => setRegistrationOpen(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notificacoes</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Notificacoes por Email</span>
            <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Notificacoes Push</span>
            <input type="checkbox" checked={notifPush} onChange={(e) => setNotifPush(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
          </label>
        </div>
      </div>

      {/* Language & Theme */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Idioma e Tema</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Idioma detectado automaticamente. Tema segue preferencia do sistema.
        </p>
      </div>
    </div>
  );
}
