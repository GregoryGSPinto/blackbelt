'use client';

import { useState } from 'react';
import { Save, Bell, Shield, Globe, Lock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function DeveloperConfiguracoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;

  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Configuracoes
        </h1>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>
          <Save size={16} />
          {saving ? 'Salvando...' : showSuccess ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      {/* Security */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Seguranca</h3>
        </div>
        <button className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>
          <span className="flex items-center gap-2"><Lock size={14} /> Alterar Senha</span>
        </button>
      </div>

      {/* Notifications */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notificacoes</h3>
        </div>
        <div className="space-y-3">
          {[
            { lbl: 'Notificacoes por Email', checked: notifEmail, onChange: setNotifEmail },
            { lbl: 'Notificacoes Push', checked: notifPush, onChange: setNotifPush },
            { lbl: 'Alertas Criticos do Sistema', checked: notifAlerts, onChange: setNotifAlerts },
          ].map((item) => (
            <label key={item.lbl} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.lbl}</span>
              <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
            </label>
          ))}
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
