'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';

const AVATARS = ['🥋', '🐯', '🐉', '🦁', '🐻', '🦊', '🐼', '🐨', '🦄', '🐸', '🐵', '🐰'];

export default function KidsConfiguracoesPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const [selectedAvatar, setSelectedAvatar] = useState('🥋');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <h1
        className="text-center text-lg font-bold"
        style={{ color: tokens.text }}
      >
        Meu Perfil
      </h1>

      {/* Avatar Selection */}
      <div
        className="rounded-2xl p-6"
        style={{ background: tokens.cardBg, border: '1px solid black' }}
      >
        <p
          className="text-center text-sm font-medium mb-4"
          style={{ color: tokens.text }}
        >
          Escolha seu avatar
        </p>
        <div className="flex justify-center mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', border: '2px solid black' }}
          >
            {selectedAvatar}
          </div>
        </div>
        <div className="grid grid-cols-6 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform hover:scale-110"
              style={{
                background: selectedAvatar === avatar
                  ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)')
                  : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                border: selectedAvatar === avatar ? '2px solid black' : '1px solid black',
              }}
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div
        className="rounded-2xl p-6"
        style={{ background: tokens.cardBg, border: '1px solid black' }}
      >
        <p
          className="text-center text-sm font-medium mb-2"
          style={{ color: tokens.text }}
        >
          Tema
        </p>
        <p
          className="text-center text-xs"
          style={{ color: tokens.textMuted }}
        >
          O tema segue automaticamente o seu dispositivo.
        </p>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full py-3 rounded-xl text-sm font-bold transition-colors"
        style={{
          background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          border: '1px solid black',
          color: tokens.text,
        }}
      >
        {saved ? 'Salvo!' : 'Salvar'}
      </button>
    </div>
  );
}
