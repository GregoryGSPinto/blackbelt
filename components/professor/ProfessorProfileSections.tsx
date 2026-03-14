// ============================================================
// InstrutorProfileSections — Bio, Certs, Social, Stats
// ============================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BookOpen, Award, Instagram, Youtube, Facebook,
  Plus, X, Save, BarChart3, Loader2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  getProfessorPerfil, updateProfessorPerfil,
  type ProfessorPerfil, type Certificacao,
} from '@/lib/__mocks__/professor-profile.mock';

const ESPECIALIDADES_PRESET = [
  'Guard', 'Leg Lock', 'Takedown', 'Submissions', 'Sweeps',
  'Half Guard', 'Mount', 'Back Control', 'Self Defense',
];

// ── Section wrapper ──

function Section({ title, icon: Icon, delay, children }: {
  title: string; icon: typeof BookOpen; delay: number; children: React.ReactNode;
}) {
  return (
    <section
      className="prof-glass-card p-5 space-y-4"
      style={{ animationDelay: `${delay}ms`, animation: 'fadeSlideIn 0.4s ease both' }}
    >
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-amber-400/60" />
        <h3 className="text-xs font-semibold text-amber-400/60 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </section>
  );
}

// ── Main component ──

export function ProfessorProfileSections() {
  const t = useTranslations('professor.profile');
  const tCommon = useTranslations('common');
  const [data, setData] = useState<ProfessorPerfil | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    setData(getProfessorPerfil());
  }, []);

  const save = useCallback(async (section: string, partial: Partial<ProfessorPerfil>) => {
    setSaving(section);
    await new Promise(r => setTimeout(r, 300));
    const updated = updateProfessorPerfil(partial);
    setData(updated);
    setSaving(null);
  }, []);

  if (!data) return null;

  const anoAtual = new Date().getFullYear();
  const anosProf = data.anoInicioArtesMarciais ? anoAtual - data.anoInicioArtesMarciais : 0;

  return (
    <div className="space-y-4 mt-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}} />

      {/* ── Sobre Mim ── */}
      <Section title={t('aboutMe')} icon={BookOpen} delay={0}>
        <textarea
          value={data.bio}
          onChange={(e: { target: { value: string } }) => setData({ ...data, bio: e.target.value })}
          maxLength={500}
          rows={3}
          placeholder={t('aboutMePlaceholder')}
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white/70 placeholder:text-white/15 resize-none outline-none focus-visible:ring-2 focus-visible:ring-white/20"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/20">{data.bio.length}/500</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-[10px] text-white/30 w-32">{t('startYear')}:</label>
          <input
            type="number"
            value={data.anoInicioArtesMarciais || ''}
            onChange={(e: { target: { value: string } }) => setData({ ...data, anoInicioArtesMarciais: parseInt(e.target.value) || 0 })}
            min={1970} max={anoAtual}
            className="w-20 px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          />
          {anosProf > 0 && <span className="text-[10px] text-amber-400/40">{anosProf} {t('years')}</span>}
        </div>

        {/* Especialidades */}
        <div>
          <p className="text-[10px] text-white/30 mb-2">{t('specialties')}:</p>
          <div className="flex flex-wrap gap-1.5">
            {ESPECIALIDADES_PRESET.map((esp) => {
              const active = data.especialidades.includes(esp);
              return (
                <button
                  key={esp}
                  onClick={() => {
                    const next = active
                      ? data.especialidades.filter((e: string) => e !== esp)
                      : [...data.especialidades, esp];
                    setData({ ...data, especialidades: next });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    active ? 'text-amber-200 bg-amber-500/15 border-amber-400/20' : 'text-white/25 bg-white/[0.02] border-white/[0.04]'
                  }`}
                  style={{ border: `1px solid ${active ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)'}` }}
                >
                  {esp}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => save('bio', { bio: data.bio, anoInicioArtesMarciais: data.anoInicioArtesMarciais, especialidades: data.especialidades })}
          disabled={saving === 'bio'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-600/20 hover:bg-amber-600/30 transition-colors"
        >
          {saving === 'bio' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {tCommon('actions.save')}
        </button>
      </Section>

      {/* ── Certificações ── */}
      <Section title={t('certifications')} icon={Award} delay={100}>
        <div className="space-y-2">
          {data.certificacoes.map((cert: Certificacao, idx: number) => (
            <div key={cert.id} className="flex items-center gap-2">
              <input
                value={cert.titulo}
                onChange={(e: { target: { value: string } }) => {
                  const next = [...data.certificacoes];
                  next[idx] = { ...next[idx], titulo: e.target.value };
                  setData({ ...data, certificacoes: next });
                }}
                placeholder={t('certTitle')}
                className="flex-1 px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <input
                value={cert.instituicao}
                onChange={(e: { target: { value: string } }) => {
                  const next = [...data.certificacoes];
                  next[idx] = { ...next[idx], instituicao: e.target.value };
                  setData({ ...data, certificacoes: next });
                }}
                placeholder={t('certInstitution')}
                className="w-28 px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <input
                type="number"
                value={cert.ano}
                onChange={(e: { target: { value: string } }) => {
                  const next = [...data.certificacoes];
                  next[idx] = { ...next[idx], ano: parseInt(e.target.value) || 0 };
                  setData({ ...data, certificacoes: next });
                }}
                className="w-16 px-2 py-1.5 rounded-lg text-xs text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-white/20 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
              <button
                onClick={() => setData({ ...data, certificacoes: data.certificacoes.filter((_: Certificacao, i: number) => i !== idx) })}
                className="p-1 hover:bg-red-500/10 rounded-lg"
              >
                <X size={12} className="text-red-400/40" />
              </button>
            </div>
          ))}
        </div>
        {data.certificacoes.length < 10 && (
          <button
            onClick={() => setData({ ...data, certificacoes: [...data.certificacoes, { id: `cert-${Date.now()}`, titulo: '', instituicao: '', ano: anoAtual }] })}
            className="flex items-center gap-1.5 text-[10px] text-amber-400/50 hover:text-amber-400/70 transition-colors"
          >
            <Plus size={10} /> {t('addCertification')}
          </button>
        )}
        <button
          onClick={() => save('certs', { certificacoes: data.certificacoes })}
          disabled={saving === 'certs'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-600/20 hover:bg-amber-600/30 transition-colors"
        >
          {saving === 'certs' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {tCommon('actions.save')}
        </button>
      </Section>

      {/* ── Redes Sociais ── */}
      <Section title={t('socialMedia')} icon={Instagram} delay={200}>
        <div className="space-y-2.5">
          {[
            { key: 'instagram' as const, Icon: Instagram, placeholder: '@seuusuario' },
            { key: 'youtube' as const, Icon: Youtube, placeholder: 'URL do canal' },
            { key: 'facebook' as const, Icon: Facebook, placeholder: 'URL do perfil' },
          ].map(({ key, Icon, placeholder }) => (
            <div key={key} className="flex items-center gap-2">
              <Icon size={14} className="text-white/20 flex-shrink-0" />
              <input
                value={data.redesSociais[key] || ''}
                onChange={(e: { target: { value: string } }) => setData({
                  ...data,
                  redesSociais: { ...data.redesSociais, [key]: e.target.value },
                })}
                placeholder={placeholder}
                className="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-white/70 placeholder:text-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              />
            </div>
          ))}
        </div>
        <button
          onClick={() => save('social', { redesSociais: data.redesSociais })}
          disabled={saving === 'social'}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-amber-200 bg-amber-600/20 hover:bg-amber-600/30 transition-colors"
        >
          {saving === 'social' ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {tCommon('actions.save')}
        </button>
      </Section>

      {/* ── Estatísticas ── */}
      <Section title={t('statistics')} icon={BarChart3} delay={300}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: t('sessionsTaught'), value: data.totalSessõesMinistradas, color: '#D97706' },
            { label: t('activeClassesCount'), value: data.turmasAtivas, color: '#3B82F6' },
            { label: t('graduatedStudents'), value: data.alunosGraduados, color: '#22C55E' },
            { label: t('yearsTeaching'), value: anosProf, color: '#8B5CF6' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 rounded-xl text-center"
              style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}12` }}
            >
              <p className="text-xl font-medium" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[9px] text-white/30 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
