'use client';

import { User, Mail, Phone, Calendar, Shield, Code2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

export default function DeveloperPerfilPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const { user } = useAuth();

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;

  const fields = [
    { icon: User, label: 'Nome Completo', value: user?.nome || '' },
    { icon: Mail, label: 'Email', value: user?.email || '' },
    { icon: Phone, label: 'Telefone', value: '(31) 99999-0000' },
    { icon: Calendar, label: 'Data de Nascimento', value: '20/06/1990' },
    { icon: Shield, label: 'Papel no Sistema', value: 'Desenvolvedor' },
    { icon: Code2, label: 'Acesso', value: 'Full Stack · API + Admin' },
    { icon: Calendar, label: 'Membro Desde', value: '2023' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
        Meu Perfil
      </h1>

      <div style={{ ...card, padding: '1.5rem' }}>
        <div className="flex flex-col md:flex-row items-center gap-5 md:gap-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl flex items-center justify-center text-5xl md:text-6xl" style={{ background: 'var(--card-bg)', border: '1px solid black' }}>
            {user?.avatar || '👤'}
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.nome}</h2>
            <p className="text-sm md:text-base mt-1" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            <p className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Desenvolvedor</p>
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Informacoes Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
