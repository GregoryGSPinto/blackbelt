'use client';

import { Bell } from 'lucide-react';

export default function NotificacoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Notificacoes</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Em desenvolvimento</p>
      </div>
      <div className="rounded-xl p-8 text-center" style={{ background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 }}>
        <Bell size={48} className="mx-auto mb-4 text-white/20" />
        <p className="text-lg font-semibold text-white/40">Em breve</p>
        <p className="text-sm text-white/20 mt-2">Esta funcionalidade esta em desenvolvimento.</p>
      </div>
    </div>
  );
}
