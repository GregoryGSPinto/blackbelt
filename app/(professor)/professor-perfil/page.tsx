'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  User, Mail, Shield, Award,
  Bell, Lock, Eye, Smartphone, Globe, ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { ProfessorProfileSections } from '@/components/professor/ProfessorProfileSections';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useTranslations } from 'next-intl';

export default function ProfessorPerfilPage() {
  const t = useTranslations('professor.profile');
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);

  const { user } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 pt-6 pb-8 max-w-3xl mx-auto px-4 md:px-0">
      {/* Header */}
      <section className="prof-enter-1">
        <p className="text-amber-400/50 text-xs tracking-[0.25em] uppercase mb-2">{t('settings')}</p>
        <h1 style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, fontWeight: 400, color: tokens.textMuted }}>{t('myProfile')}</h1>
        <div className="prof-gold-line mt-6" />
      </section>

      {/* Profile Card */}
      <section className="prof-glass-card p-6 prof-enter-2">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-5xl shadow-2xl shadow-indigo-900/30 group-hover:scale-105 transition-transform duration-300">
              {user?.avatar || '🧔'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-600 hover:bg-amber-500 rounded-xl flex items-center justify-center transition-colors shadow-lg">
              <User size={14} className="text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="text-center md:text-left flex-1">
            <h2 className="text-xl font-bold text-white">{user?.nome}</h2>
            <p className="text-amber-400/60 text-sm mt-1">{user?.graduacao || t('maxLevel')}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
              <span className="text-[10px] px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-lg font-semibold">Professor</span>
              <span className="text-[10px] px-3 py-1 bg-emerald-500/15 text-emerald-300 rounded-lg font-semibold">Ativo</span>
              <span className="text-[10px] px-3 py-1 bg-white/5 text-white/55 rounded-lg">Desde 2019</span>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Info */}
      <section className="prof-glass-card p-6 prof-enter-3">
        <h3 className="text-sm font-bold text-amber-300/60 tracking-wider uppercase mb-5">{t('personalInfo')}</h3>

        <div className="space-y-4">
          {[
            { icon: User, label: t('fullName'), value: user?.nome || '' },
            { icon: Mail, label: t('email'), value: user?.email || '' },
            { icon: Award, label: t('graduation'), value: user?.graduacao || t('maxLevel') },
            { icon: Globe, label: t('unitName'), value: user?.unidade || t('unitValue') },
          ].map((field) => (
            <div key={field.label} className="flex items-center gap-4 p-3 bg-white/3 rounded-xl">
              <field.icon size={16} className="text-amber-400/70 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">{field.label}</p>
                <p className="text-sm text-white/70 mt-0.5">{field.value}</p>
              </div>
              <ChevronRight size={14} style={{ color: tokens.textMuted }} />
            </div>
          ))}
        </div>
      </section>

      {/* Preferences */}
      <section className="prof-glass-card p-6 prof-enter-4">
        <h3 className="text-sm font-bold text-amber-300/60 tracking-wider uppercase mb-5">{t('preferences')}</h3>

        <div className="space-y-3">
          {[
            { icon: Bell, label: t('notificationsLabel'), desc: t('notificationsDesc'), enabled: true },
            { icon: Eye, label: t('visibilityLabel'), desc: t('visibilityDesc'), enabled: true },
            { icon: Smartphone, label: t('pushLabel'), desc: t('pushDesc'), enabled: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center gap-4 p-3 bg-white/3 rounded-xl">
              <pref.icon size={16} className="text-amber-400/70 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm" style={{ color: tokens.text }}>{pref.label}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{pref.desc}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center transition-all duration-300 cursor-pointer ${
                pref.enabled ? 'bg-amber-600 justify-end' : 'bg-white/10 justify-start'
              }`}>
                <div className="w-4 h-4 bg-white rounded-full mx-1 shadow-sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="prof-glass-card p-6 prof-enter-5">
        <h3 className="text-sm font-bold text-amber-300/60 tracking-wider uppercase mb-5">{t('securityTitle')}</h3>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-4 p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-all duration-300">
            <Lock size={16} className="text-amber-400/60" />
            <div className="flex-1 text-left">
              <p className="text-sm" style={{ color: tokens.text }}>{t('changePasswordLabel')}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{t('lastChange')}</p>
            </div>
            <ChevronRight size={14} style={{ color: tokens.textMuted }} />
          </button>

          <button className="w-full flex items-center gap-4 p-3 bg-white/3 rounded-xl hover:bg-white/5 transition-all duration-300">
            <Shield size={16} className="text-amber-400/60" />
            <div className="flex-1 text-left">
              <p className="text-sm" style={{ color: tokens.text }}>{t('twoFALabel')}</p>
              <p className="text-[10px] text-white/50 mt-0.5">{t('notConfigured')}</p>
            </div>
            <ChevronRight size={14} style={{ color: tokens.textMuted }} />
          </button>
        </div>
      </section>

      {/* ── Expanded Profile Sections (Wave 13.1) ── */}
      <ProfessorProfileSections />

      {/* Save Button */}
      <section className="prof-enter-6">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
            saved
              ? 'bg-emerald-600/80 text-emerald-100'
              : 'bg-gradient-to-r from-amber-600/80 to-amber-700/80 hover:from-amber-500/80 hover:to-amber-600/80 text-white shadow-lg shadow-amber-900/30 hover:scale-[1.01]'
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle size={16} />
              {t('savedSuccess')}
            </span>
          ) : (
            t('saveChanges')
          )}
        </button>
      </section>
    </div>
  );
}
