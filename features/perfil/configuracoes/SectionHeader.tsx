// ============================================================
// SectionHeader — Header padrão de cada seção de configurações
// ============================================================

import type { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle: string;
}

export function SectionHeader({ icon: Icon, iconClassName, title, subtitle }: SectionHeaderProps) {
  return (
    <div>
      <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
        <Icon size={32} className={iconClassName} />
        {title}
      </h2>
      <p className="text-white/40">{subtitle}</p>
    </div>
  );
}
