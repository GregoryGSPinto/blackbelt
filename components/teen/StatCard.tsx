import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  color?: 'ocean' | 'purple' | 'emerald' | 'energy';
}

const accentMap = {
  ocean:   { icon: 'teen-accent-icon-ocean',   ring: 'teen-accent-ring-ocean' },
  purple:  { icon: 'teen-accent-icon-purple',  ring: 'teen-accent-ring-purple' },
  emerald: { icon: 'teen-accent-icon-emerald', ring: 'teen-accent-ring-emerald' },
  energy:  { icon: 'teen-accent-icon-energy',  ring: 'teen-accent-ring-energy' },
};

export default function StatCard({ icon, value, label, color = 'ocean' }: StatCardProps) {
  const accent = accentMap[color];

  return (
    <div className="teen-card rounded-2xl p-4 flex flex-col items-center text-center gap-2.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent.icon}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold font-teen teen-text-heading">
          {value}
        </p>
        <p className="text-xs font-teen teen-text-muted mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}
