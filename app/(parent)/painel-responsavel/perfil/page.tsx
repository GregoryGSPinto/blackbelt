// ============================================================
// Perfil do Responsavel — View personal data only
// ============================================================
'use client';

import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PerfilParentPage() {
  const t = useTranslations('parent.profile');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const label = { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, fontWeight: 400 } as const;

  const fields = [
    { icon: User, label: t('fullName'), value: user?.nome || '' },
    { icon: Mail, label: t('email'), value: user?.email || '' },
    { icon: Phone, label: t('phone'), value: '(31) 99999-8888' },
    { icon: Calendar, label: 'Data de Nascimento', value: '12/05/1982' },
    { icon: Shield, label: 'Papel no Sistema', value: 'Responsavel' },
    { icon: Calendar, label: 'Membro Desde', value: '2024' },
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        <Link href="/painel-responsavel" className="text-xs flex items-center gap-1 mb-2 transition-colors" style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft size={14} /> {t('backToPanel')}
        </Link>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
          {t('title')}
        </h1>

        {/* Avatar + Name */}
        <div className="mt-6" style={{ ...card, padding: '1.5rem' }}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl" style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
              {user?.avatar || '👤'}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.nome}</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Responsavel</p>
            </div>
          </div>
        </div>

        {/* Personal Info */}
        <div className="mt-6" style={{ ...card, padding: '1.5rem' }}>
          <h3 style={{ ...label, marginBottom: '1rem' }}>Informacoes Pessoais</h3>
          <div className="space-y-4">
            {fields.map((f) => (
              <div key={f.label} className="flex items-center gap-4 px-3 py-3 rounded-xl" style={{ border: '1px solid black' }}>
                <f.icon size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
