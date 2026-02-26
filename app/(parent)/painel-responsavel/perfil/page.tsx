// ============================================================
// Perfil do Responsável — Edit profile, password, notifications
// ============================================================
'use client';

import { useState, useCallback } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, Bell, Save, Loader2, ArrowLeft, Camera } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { NotificationPreferences } from '@/components/shared/NotificationPreferences';

type Tab = 'dados' | 'senha' | 'notificacoes';

export default function PerfilParentPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('dados');

  // ── Dados form ──
  const [nome, setNome] = useState(user?.name || 'Carlos Silva');
  const [telefone, setTelefone] = useState('(31) 99999-8888');
  const [savingDados, setSavingDados] = useState(false);

  const handleSaveDados = useCallback(async () => {
    setSavingDados(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      toast.success('Dados atualizados!');
    } catch { toast.error('Erro ao salvar'); }
    finally { setSavingDados(false); }
  }, [toast]);

  // ── Senha form ──
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [savingSenha, setSavingSenha] = useState(false);

  const handleSaveSenha = useCallback(async () => {
    if (!senhaAtual || !novaSenha) { toast.warning('Preencha todos os campos'); return; }
    if (novaSenha.length < 8) { toast.warning('Mínimo 8 caracteres'); return; }
    if (novaSenha !== confirmar) { toast.warning('Senhas não conferem'); return; }
    setSavingSenha(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Senha alterada!');
      setSenhaAtual(''); setNovaSenha(''); setConfirmar('');
    } catch { toast.error('Erro ao alterar senha'); }
    finally { setSavingSenha(false); }
  }, [senhaAtual, novaSenha, confirmar, toast]);

  const TABS: { id: Tab; label: string }[] = [
    { id: 'dados', label: 'Meus Dados' },
    { id: 'senha', label: 'Senha' },
    { id: 'notificacoes', label: 'Notificações' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <Link href="/painel-responsavel" className="text-white/40 text-xs flex items-center gap-1 mb-2 hover:text-white/60 transition-colors">
          <ArrowLeft size={14} /> Voltar ao Painel
        </Link>
        <h1 className="text-2xl font-bold text-white mb-6">Meu Perfil</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-teal-600/20 flex items-center justify-center">
              <User size={28} className="text-teal-400" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center" aria-label="Trocar foto">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <p className="text-white/80 font-semibold">{user?.name || 'Carlos Silva'}</p>
            <p className="text-white/40 text-xs">{user?.email || 'carlos@email.com'}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                ${tab === t.id ? 'bg-teal-600/20 text-teal-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          {tab === 'dados' && (
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
                  <User size={12} /> Nome completo
                </label>
                <input
                  type="text" value={nome} onChange={e => setNome(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                             focus:outline-none focus:border-white/25 transition-colors"
                  aria-label="Nome"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
                  <Mail size={12} /> E-mail
                </label>
                <input
                  type="email" value={user?.email || ''} readOnly
                  className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/6 text-white/40 text-sm cursor-not-allowed"
                  aria-label="E-mail"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
                  <Phone size={12} /> Telefone
                </label>
                <input
                  type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                             focus:outline-none focus:border-white/25 transition-colors"
                  aria-label="Telefone"
                />
              </div>
              <button onClick={handleSaveDados} disabled={savingDados}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                           bg-gradient-to-r from-teal-600 to-teal-500 text-white disabled:opacity-40 transition-all">
                {savingDados ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingDados ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          )}

          {tab === 'senha' && (
            <div className="space-y-4">
              {['Senha atual', 'Nova senha', 'Confirmar nova senha'].map((label, i) => {
                const val = [senhaAtual, novaSenha, confirmar][i];
                const setter = [setSenhaAtual, setNovaSenha, setConfirmar][i];
                return (
                  <div key={i}>
                    <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
                      <Lock size={12} /> {label}
                    </label>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'} value={val} onChange={e => setter(e.target.value)}
                        className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                                   focus:outline-none focus:border-white/25 transition-colors"
                        placeholder="••••••••" aria-label={label}
                      />
                      <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                        aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })}
              <button onClick={handleSaveSenha} disabled={savingSenha}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
                           bg-gradient-to-r from-teal-600 to-teal-500 text-white disabled:opacity-40 transition-all">
                {savingSenha ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingSenha ? 'Alterando...' : 'Alterar Senha'}
              </button>
            </div>
          )}

          {tab === 'notificacoes' && (
            <NotificationPreferences />
          )}
        </div>
      </div>
    </div>
  );
}
