'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award } from 'lucide-react';
import { getChildrenModalities } from '@/lib/api/modality.service';

interface ChildModality {
  membershipId: string;
  profileId: string;
  fullName: string;
  avatarUrl: string | null;
  modalities: Array<{
    id: string;
    belt_rank: string;
    stripes: number;
    status: string;
    academy_modalities?: { name: string; icon?: string };
  }>;
}

export function ChildModalitiesList() {
  const [children, setChildren] = useState<ChildModality[]>([]);
  const [loading, setLoading] = useState(true);

  const card = { background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12 } as const;

  const fetchData = useCallback(async () => {
    try {
      const data = await getChildrenModalities();
      setChildren(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return null;
  if (children.length === 0 || children.every(c => c.modalities.length === 0)) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
        <Award size={14} /> Modalidades dos filhos
      </h3>
      {children.map(child => (
        <div key={child.membershipId}>
          {child.modalities.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{child.fullName}</p>
              {child.modalities.map((mod) => (
                <div key={mod.id} style={{ ...card, padding: '0.75rem 1rem' }} className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {mod.academy_modalities?.icon && <span className="mr-1">{mod.academy_modalities.icon}</span>}
                    {mod.academy_modalities?.name || 'Modalidade'}
                  </p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                    Faixa {mod.belt_rank || 'branca'} • {mod.stripes} grau(s)
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
