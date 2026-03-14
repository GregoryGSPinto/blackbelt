'use client';

import { useState, useCallback } from 'react';
import { createAcademyOnboardingAction } from '@/app/actions/onboarding';
import { Building2 } from 'lucide-react';

const MODALITIES = [
  'Jiu-Jitsu',
  'Judo',
  'Karate',
  'Taekwondo',
  'Muay Thai',
  'Boxing',
  'MMA',
  'Capoeira',
  'Kung Fu',
  'Wrestling',
  'Outra',
];

interface StepAcademyProps {
  onComplete: (academyId: string) => void;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export default function StepAcademy({ onComplete, tokens }: StepAcademyProps) {
  const [name, setName] = useState('');
  const [modality, setModality] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !modality) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await createAcademyOnboardingAction({
        name: name.trim(),
        modality,
        address: address.trim() || undefined,
      });

      if (result.success) {
        onComplete(result.data.id);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Nao foi possivel criar a academia. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }, [name, modality, address, onComplete]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: tokens.text }}>
          Crie sua academia
        </h2>
        <p className="text-sm mt-1" style={{ color: tokens.textMuted }}>
          Comece com os dados basicos para liberar o painel inicial
        </p>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
          Nome da academia *
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: BlackBelt Moema"
          className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
          Modalidade principal *
        </label>
        <select
          value={modality}
          onChange={(e) => setModality(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        >
          <option value="">Selecione a modalidade</option>
          {MODALITIES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
          Endereco
        </label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Rua, cidade e estado"
          className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        />
      </div>

      {error && (
        <p className="text-sm" style={{ color: tokens.error }}>
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || !name.trim() || !modality}
        className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
      >
        {submitting ? 'Criando academia...' : 'Continuar para a primeira turma'}
      </button>
    </div>
  );
}
