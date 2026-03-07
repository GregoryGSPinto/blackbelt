'use client';

import { useState } from 'react';
import { Save, Bell, Lock, Eye, EyeOff, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useToast } from '@/contexts/ToastContext';

export default function ProfessorConfiguracoesPage() {
  const t = useTranslations('professor.profile');
  const tc = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)' } as const;
  const label = { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, fontWeight: 400 } as const;

  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [visibility, setVisibility] = useState(true);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveSenha = async () => {
    if (!senhaAtual || !novaSenha) { toast.warning('Preencha todos os campos'); return; }
    if (novaSenha.length < 8) { toast.warning('Minimo 8 caracteres'); return; }
    if (novaSenha !== confirmar) { toast.warning('Senhas nao conferem'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success(tc('saved'));
    setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
        Configuracoes
      </h1>

      {/* Notifications */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ ...label, marginBottom: 0 }}>Notificacoes</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Notificacoes por Email', checked: notifEmail, onChange: setNotifEmail },
            { label: 'Notificacoes Push', checked: notifPush, onChange: setNotifPush },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
              <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Eye size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ ...label, marginBottom: 0 }}>Privacidade</h3>
        </div>
        <label className="flex items-center justify-between py-2 cursor-pointer">
          <div>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Perfil visivel para alunos</span>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Alunos podem ver seu perfil e graduacao</p>
          </div>
          <input type="checkbox" checked={visibility} onChange={(e) => setVisibility(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
        </label>
      </div>

      {/* Change Password */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ ...label, marginBottom: 0 }}>Alterar Senha</h3>
        </div>
        <div className="space-y-4">
          {[
            { lbl: 'Senha Atual', val: senhaAtual, set: setSenhaAtual },
            { lbl: 'Nova Senha', val: novaSenha, set: setNovaSenha },
            { lbl: 'Confirmar Nova Senha', val: confirmar, set: setConfirmar },
          ].map((f) => (
            <div key={f.lbl}>
              <label style={{ display: 'block', ...label, marginBottom: '0.5rem' }}>{f.lbl}</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={f.val} onChange={(e) => f.set(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none"
                  style={inputStyle} placeholder="••••••••"
                />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={handleSaveSenha} disabled={saving}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>
            <Save size={16} />
            {saving ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </div>
      </div>

      {/* Language & Theme */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Globe size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 style={{ ...label, marginBottom: 0 }}>Idioma e Tema</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Idioma detectado automaticamente. Tema segue preferencia do sistema.
        </p>
      </div>
    </div>
  );
}
