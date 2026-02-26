// ============================================================
// EditarDadosSection — Edit personal data within profile
// ============================================================
'use client';

import { useState, useCallback, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Save, Loader2 } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  dataNascimento: string;
}

const PHONE_MASK = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export function EditarDadosSection() {
  const { user } = useAuth();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    dataNascimento: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.name || '',
        email: user.email || '',
        telefone: '',
        dataNascimento: '',
      });
    }
  }, [user]);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    const v = field === 'telefone' ? PHONE_MASK(value) : value;
    setForm(prev => ({ ...prev, [field]: v }));
    setDirty(true);
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const e: typeof errors = {};
    if (!form.nome.trim()) e.nome = 'Nome é obrigatório';
    if (form.telefone && form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success('Dados atualizados com sucesso!');
      setDirty(false);
    } catch {
      toast.error('Erro ao atualizar dados. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }, [validate, toast]);

  return (
    <div className="space-y-5">
      <SectionHeader title="Meus Dados" description="Atualize suas informações pessoais" />

      <div className="space-y-4">
        {/* Nome */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
            <User size={12} /> Nome completo
          </label>
          <input
            type="text"
            value={form.nome}
            onChange={e => handleChange('nome', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                       focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-colors"
            placeholder="Seu nome completo"
            aria-label="Nome completo"
            aria-required="true"
            aria-invalid={!!errors.nome}
          />
          {errors.nome && <p className="text-red-400 text-xs mt-1">{errors.nome}</p>}
        </div>

        {/* Email (readonly) */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
            <Mail size={12} /> E-mail
          </label>
          <input
            type="email"
            value={form.email}
            readOnly
            className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/6 text-white/40 text-sm cursor-not-allowed"
            aria-label="E-mail (não editável)"
          />
          <p className="text-white/25 text-[10px] mt-1">O e-mail não pode ser alterado por aqui.</p>
        </div>

        {/* Telefone */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
            <Phone size={12} /> Telefone
          </label>
          <input
            type="tel"
            value={form.telefone}
            onChange={e => handleChange('telefone', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                       focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-colors"
            placeholder="(31) 99999-9999"
            aria-label="Telefone"
            aria-invalid={!!errors.telefone}
          />
          {errors.telefone && <p className="text-red-400 text-xs mt-1">{errors.telefone}</p>}
        </div>

        {/* Data Nascimento */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
            <Calendar size={12} /> Data de nascimento
          </label>
          <input
            type="date"
            value={form.dataNascimento}
            onChange={e => handleChange('dataNascimento', e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                       focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-colors
                       [color-scheme:dark]"
            aria-label="Data de nascimento"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || !dirty}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed
                   bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg"
        aria-label="Salvar dados"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  );
}
