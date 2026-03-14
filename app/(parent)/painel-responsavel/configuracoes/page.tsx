'use client';

import { useState, useCallback } from 'react';
import { Save, Bell, Lock, Eye, EyeOff, Globe, Loader2, Users } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import { useToast } from '@/contexts/ToastContext';

export default function ParentConfiguracoesPage() {
  const t = useTranslations('parent.profile');
  const tc = useTranslations('common.actions');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();

  const card = { background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' } as const;

  // Notifications
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [notifCheckin, setNotifCheckin] = useState(true);

  // Password
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingSenha, setSavingSenha] = useState(false);

  const handleSaveSenha = useCallback(async () => {
    if (!senhaAtual || !novaSenha) { toast.warning('Preencha todos os campos'); return; }
    if (novaSenha.length < 8) { toast.warning('Minimo 8 caracteres'); return; }
    if (novaSenha !== confirmar) { toast.warning('Senhas nao conferem'); return; }
    setSavingSenha(true);
    await new Promise(r => setTimeout(r, 800));
    setSavingSenha(false);
    toast.success(tc('saved'));
    setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
  }, [senhaAtual, novaSenha, confirmar, toast, tc]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4 pt-6 pb-20">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        Configuracoes
      </h1>

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
            { lbl: 'Alertas de Check-in dos filhos', checked: notifCheckin, onChange: setNotifCheckin },
          ].map((item) => (
            <label key={item.lbl} className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{item.lbl}</span>
              <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
            </label>
          ))}
        </div>
      </div>

      {/* Children Settings */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Users size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Configuracoes dos Filhos</h3>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Gerencie permissoes e notificacoes dos filhos cadastrados na plataforma.
        </p>
      </div>

      {/* Change Password */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Alterar Senha</h3>
        </div>
        <div className="space-y-4">
          {[
            { lbl: 'Senha Atual', val: senhaAtual, set: setSenhaAtual },
            { lbl: 'Nova Senha', val: novaSenha, set: setNovaSenha },
            { lbl: 'Confirmar Nova Senha', val: confirmar, set: setConfirmar },
          ].map((f) => (
            <div key={f.lbl}>
              <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>{f.lbl}</label>
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
          <button onClick={handleSaveSenha} disabled={savingSenha}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: 'var(--card-bg)', border: `1px solid ${tokens.cardBorder}`, color: 'var(--text-primary)' }}>
            {savingSenha ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {savingSenha ? 'Salvando...' : 'Alterar Senha'}
          </button>
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
