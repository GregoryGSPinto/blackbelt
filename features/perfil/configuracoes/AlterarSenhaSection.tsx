// ============================================================
// AlterarSenhaSection — Change password within profile settings
// ============================================================
'use client';

import { useState, useCallback, useMemo } from 'react';
import { Lock, Eye, EyeOff, Save, Loader2, ShieldCheck } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { useToast } from '@/contexts/ToastContext';

interface PasswordForm {
  current: string;
  newPass: string;
  confirm: string;
}

type Strength = 'fraca' | 'media' | 'forte';

function getStrength(pw: string): { level: Strength; percent: number; color: string } {
  if (!pw) return { level: 'fraca', percent: 0, color: '#EF4444' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { level: 'fraca', percent: 33, color: '#EF4444' };
  if (score <= 3) return { level: 'media', percent: 66, color: '#FBBF24' };
  return { level: 'forte', percent: 100, color: '#22C55E' };
}

const STRENGTH_LABEL: Record<Strength, string> = { fraca: 'Fraca', media: 'Média', forte: 'Forte' };

export function AlterarSenhaSection() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PasswordForm>({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordForm, string>>>({});

  const strength = useMemo(() => getStrength(form.newPass), [form.newPass]);

  const handleChange = useCallback((field: keyof PasswordForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const toggleShow = useCallback((field: keyof typeof show) => {
    setShow(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const validate = useCallback((): boolean => {
    const e: typeof errors = {};
    if (!form.current) e.current = 'Senha atual é obrigatória';
    if (!form.newPass) e.newPass = 'Nova senha é obrigatória';
    else if (form.newPass.length < 8) e.newPass = 'Mínimo 8 caracteres';
    else if (!/[a-zA-Z]/.test(form.newPass) || !/\d/.test(form.newPass)) e.newPass = 'Use letras e números';
    if (form.newPass !== form.confirm) e.confirm = 'As senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Senha alterada com sucesso!');
      setForm({ current: '', newPass: '', confirm: '' });
    } catch {
      toast.error('Erro ao alterar senha. Verifique a senha atual.');
    } finally {
      setSaving(false);
    }
  }, [validate, toast]);

  const renderField = (field: keyof PasswordForm, label: string, placeholder: string) => (
    <div>
      <label className="flex items-center gap-2 text-xs font-medium text-white/50 mb-1.5">
        <Lock size={12} /> {label}
      </label>
      <div className="relative">
        <input
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={e => handleChange(field, e.target.value)}
          className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white/90 text-sm
                     focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/10 transition-colors"
          placeholder={placeholder}
          aria-label={label}
          aria-required="true"
          aria-invalid={!!errors[field]}
          aria-describedby={errors[field] ? `${field}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => toggleShow(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          aria-label={show[field] ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      {errors[field] && <p id={`${field}-error`} className="text-red-400 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <SectionHeader title="Alterar Senha" description="Atualize sua senha de acesso" />

      <div className="space-y-4">
        {renderField('current', 'Senha atual', '••••••••')}
        {renderField('newPass', 'Nova senha', 'Mínimo 8 caracteres')}

        {/* Strength meter */}
        {form.newPass && (
          <div className="space-y-1.5">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={11} style={{ color: strength.color }} />
              <span className="text-[10px] font-medium" style={{ color: strength.color }}>
                Força: {STRENGTH_LABEL[strength.level]}
              </span>
            </div>
          </div>
        )}

        {renderField('confirm', 'Confirmar nova senha', 'Repita a nova senha')}
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !form.current || !form.newPass || !form.confirm}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                   disabled:opacity-40 disabled:cursor-not-allowed
                   bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg"
        aria-label="Alterar senha"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {saving ? 'Alterando...' : 'Alterar Senha'}
      </button>
    </div>
  );
}
