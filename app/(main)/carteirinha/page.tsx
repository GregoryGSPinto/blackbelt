'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { PageError, PageLoading, handleServiceError } from '@/components/shared/DataStates';
import CarteirinhaDigital from '@/components/aluno/CarteirinhaDigital';
import * as carteirinhaService from '@/lib/api/carteirinha.service';
import type { CarteirinhaDigital as CarteirinhaData } from '@/lib/api/contracts';

export default function CarteirinhaPage() {
  const [carteirinha, setCarteirinha] = useState<CarteirinhaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setError(null);
    setLoading(true);
    carteirinhaService.getMinhaCarteirinha()
      .then(setCarteirinha)
      .catch((err: unknown) => setError(handleServiceError(err, 'Carteirinha')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto" />
          <p className="text-white/60 text-sm">Carregando carteirinha...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <PageError error={error} onRetry={() => setRetryCount(c => c + 1)} />;
  }

  if (!carteirinha) return <PageLoading message="Carregando carteirinha..." />;

  return (
    <div className="min-h-screen px-4 md:px-8 py-8 md:py-12">
      <div className="max-w-lg mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={24} className="text-blue-400" />
            <h1 className="text-3xl font-black text-white">
              Carteirinha Digital
            </h1>
          </div>
          <p className="text-white/40 text-sm">
            Sua identificação no BlackBelt
          </p>
        </div>

        {/* Card */}
        <CarteirinhaDigital carteirinha={carteirinha} />

        {/* Link para perfil público */}
        <div className="text-center">
          <button
            onClick={() => router.push(`/atleta/${carteirinha.alunoId}`)}
            className="text-xs text-white/30 hover:text-white/50 transition-colors underline underline-offset-2"
          >
            Ver meu perfil público
          </button>
        </div>

        {/* Info adicional */}
        <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-3">
          <p className="text-xs text-white/50 font-medium">Informações</p>
          <div className="space-y-2 text-xs text-white/35">
            <p>
              Apresente o QR code na recepção para realizar o check-in.
              A carteirinha é atualizada automaticamente.
            </p>
            <p>
              O botão de carteira digital (Apple/Google Wallet) será ativado
              após integração com o backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
