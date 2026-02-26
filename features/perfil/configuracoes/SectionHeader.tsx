// ============================================================
// SectionHeader — Header padrão de cada seção de configurações
// ============================================================

import type { LucideIcon } from 'lucide-react';

export interface SectionHeaderProps {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  description?: string;
}

export function SectionHeader({ icon: Icon, iconClassName, title, subtitle, description }: SectionHeaderProps) {
  const sub = subtitle || description;
  return (
    <div>
      <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
        {Icon && <Icon size={32} className={iconClassName} />}
        {title}
      </h2>
      {sub && <p className="text-white/40">{sub}</p>}
    </div>
  );
}
