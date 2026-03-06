'use client';

/**
 * Theme Settings — White-label Academy Theming
 *
 * Admin can customize:
 *   - Primary / Secondary colors
 *   - Logo upload
 *   - Real-time preview
 */

import { useState, useCallback } from 'react';
import { Palette, Upload, Eye, Save, RotateCcw, Check } from 'lucide-react';
import { useAcademyTheme, type AcademyTheme } from '@/contexts/AcademyThemeContext';

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-12 h-12 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
          style={{ padding: 2 }}
        />
      </div>
      <div className="flex-1">
        <p className="text-white/80 text-sm font-medium">{label}</p>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="text-white/50 text-xs bg-transparent border-b border-white/10 outline-none focus:border-white/30 w-24 py-0.5"
          maxLength={7}
        />
      </div>
    </div>
  );
}

function PreviewCard({ draft }: { draft: AcademyTheme }) {
  return (
    <div
      className="rounded-2xl p-6 space-y-4"
      style={{
        background: `linear-gradient(135deg, ${draft.secondaryColor}, ${draft.secondaryColor}dd)`,
        border: `1px solid ${draft.primaryColor}33`,
      }}
    >
      <div className="flex items-center gap-3">
        {draft.logoUrl ? (
          <img src={draft.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
        ) : (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: draft.primaryColor }}
          >
            BB
          </div>
        )}
        <div>
          <p className="text-white font-semibold text-sm">Minha Academia</p>
          <p className="text-white/40 text-xs">Preview em tempo real</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-lg text-white text-xs font-medium"
          style={{ backgroundColor: draft.primaryColor }}
        >
          Botao Primario
        </button>
        <button
          className="px-4 py-2 rounded-lg text-white/70 text-xs font-medium border"
          style={{ borderColor: `${draft.primaryColor}66` }}
        >
          Botao Secundario
        </button>
      </div>

      <div className="flex gap-2">
        <div
          className="h-2 flex-1 rounded-full"
          style={{ backgroundColor: draft.primaryColor }}
        />
        <div
          className="h-2 flex-1 rounded-full opacity-50"
          style={{ backgroundColor: draft.primaryColor }}
        />
        <div
          className="h-2 flex-1 rounded-full opacity-20"
          style={{ backgroundColor: draft.primaryColor }}
        />
      </div>
    </div>
  );
}

export default function ThemeSettingsPage() {
  const { theme, updateTheme, loading } = useAcademyTheme();
  const [draft, setDraft] = useState<AcademyTheme>(theme);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = useCallback((key: keyof AcademyTheme, value: string | null) => {
    setDraft(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await updateTheme(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }, [draft, updateTheme]);

  const handleReset = useCallback(() => {
    setDraft({
      primaryColor: '#C9A227',
      secondaryColor: '#1A1A2E',
      logoUrl: null,
      faviconUrl: null,
      customCSS: null,
    });
    setSaved(false);
  }, []);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(theme);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
          <Palette className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-white text-xl font-bold">Tema da Academia</h1>
          <p className="text-white/40 text-sm">Personalize as cores e o logo da sua academia</p>
        </div>
      </div>

      {/* Color Pickers */}
      <section
        className="rounded-2xl p-6 space-y-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2 className="text-white/80 font-semibold text-sm flex items-center gap-2">
          <Palette size={16} className="text-violet-400" />
          Cores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <ColorInput
            label="Cor Primaria"
            value={draft.primaryColor}
            onChange={v => handleChange('primaryColor', v)}
          />
          <ColorInput
            label="Cor Secundaria"
            value={draft.secondaryColor}
            onChange={v => handleChange('secondaryColor', v)}
          />
        </div>
      </section>

      {/* Logo Upload */}
      <section
        className="rounded-2xl p-6 space-y-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <h2 className="text-white/80 font-semibold text-sm flex items-center gap-2">
          <Upload size={16} className="text-blue-400" />
          Logo
        </h2>

        <div className="flex items-center gap-4">
          {draft.logoUrl ? (
            <img src={draft.logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center">
              <Upload size={20} className="text-white/20" />
            </div>
          )}
          <div className="space-y-2">
            <label className="block">
              <span className="text-xs text-white/40">URL do logo (ou faça upload)</span>
              <input
                type="url"
                value={draft.logoUrl || ''}
                onChange={e => handleChange('logoUrl', e.target.value || null)}
                placeholder="https://..."
                className="w-full mt-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
              />
            </label>
            {draft.logoUrl && (
              <button
                onClick={() => handleChange('logoUrl', null)}
                className="text-red-400 text-xs hover:text-red-300 transition-colors"
              >
                Remover logo
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="space-y-3">
        <h2 className="text-white/80 font-semibold text-sm flex items-center gap-2">
          <Eye size={16} className="text-emerald-400" />
          Preview
        </h2>
        <PreviewCard draft={draft} />
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all
            ${hasChanges && !saving
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-white/5 text-white/30 cursor-not-allowed'}
          `}
        >
          {saved ? (
            <>
              <Check size={16} />
              Salvo!
            </>
          ) : saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Tema
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-all"
        >
          <RotateCcw size={14} />
          Restaurar Padrao
        </button>
      </div>
    </div>
  );
}
