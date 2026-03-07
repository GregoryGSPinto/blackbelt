'use client';

import { X, ShieldCheck } from 'lucide-react';

interface PurchaseApprovalModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

export function PurchaseApprovalModal({ open, onClose, productName }: PurchaseApprovalModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-xl p-6 space-y-4"
        style={{ background: 'var(--card-bg)', border: '1px solid black' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: 'var(--text-secondary)' }}>
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--card-bg)', border: '1px solid black' }}
          >
            <ShieldCheck size={32} style={{ color: 'var(--text-primary)' }} />
          </div>

          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Solicitar aprovacao do responsavel
          </h3>

          {productName && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Produto: <strong>{productName}</strong>
            </p>
          )}

          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Seu responsavel recebera uma notificacao para aprovar esta compra.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
            style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}
          >
            Solicitar
          </button>
        </div>
      </div>
    </div>
  );
}
