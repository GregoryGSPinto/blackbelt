'use client';

import { User, Mail, Phone, Calendar, Award, Shield, Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function AdminPerfilPage() {
  const t = useTranslations('admin');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const label = { fontSize: '0.65rem', letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: tokens.textMuted, fontWeight: 400 } as const;

  const fields = [
    { icon: User, label: 'Nome Completo', value: user?.nome || '' },
    { icon: Mail, label: 'Email', value: user?.email || '' },
    { icon: Phone, label: 'Telefone', value: '(31) 99999-0000' },
    { icon: Calendar, label: 'Data de Nascimento', value: '15/03/1985' },
    { icon: Shield, label: 'Papel no Sistema', value: 'Administrador' },
    { icon: Building2, label: 'Unidade', value: user?.unidade || 'BlackBelt Centro' },
    { icon: Award, label: 'Graduacao', value: user?.graduacao || 'Faixa Preta 2o Dan' },
    { icon: Calendar, label: 'Membro Desde', value: '2019' },
  ];

  return (
    <div className="space-y-6">
      <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>
        Meu Perfil
      </h1>

      {/* Avatar + Name */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-xl flex items-center justify-center text-4xl"
            style={{ background: 'var(--card-bg)', border: '1px solid black' }}
          >
            {user?.avatar || '👤'}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.nome}</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Administrador</p>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ ...card, padding: '1.5rem' }}>
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
  );
}
