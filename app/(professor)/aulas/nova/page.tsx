'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import { getAcademyModalities, type AcademyModality } from '@/lib/api/modality.service';

const FALLBACK_MODALITIES = ['BJJ', 'Muay Thai', 'Boxe', 'Judo', 'Wrestling', 'MMA'];
const levels = ['Iniciante', 'Intermediário', 'Avançado', 'Competição'];

export default function NovaAulaPage() {
  const router = useRouter();
  const [academyModalities, setAcademyModalities] = useState<AcademyModality[]>([]);

  useEffect(() => {
    getAcademyModalities().then(setAcademyModalities).catch(() => {});
  }, []);

  const modalityOptions = academyModalities.length > 0
    ? academyModalities.map(m => ({ id: m.id, label: m.icon ? `${m.icon} ${m.name}` : m.name }))
    : FALLBACK_MODALITIES.map(name => ({ id: name, label: name }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    modality: '',
    date: '',
    time: '',
    duration: '60',
    capacity: '20',
    level: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = 'Título é obrigatório';
    if (!formData.modality) newErrors.modality = 'Modalidade é obrigatória';
    if (!formData.date) newErrors.date = 'Data é obrigatória';
    if (!formData.time) newErrors.time = 'Horário é obrigatório';
    if (!formData.level) newErrors.level = 'Nível é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simular API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    router.push('/professor-dashboard');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="rounded-full p-2 text-slate-400 transition hover:bg-white/10"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Nova Aula</h1>
              <p className="text-sm text-slate-400">Crie uma nova aula para sua turma</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Título da Aula
            </label>
            <input
              type="text"
              placeholder="Ex: Aula de Guarda Fechada"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Modality */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Modalidade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {modalityOptions.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => updateField('modality', mod.id)}
                  className={`rounded-xl border py-3 text-sm font-medium transition ${
                    formData.modality === mod.id
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </div>
            {errors.modality && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.modality}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Calendar className="h-4 w-4" />
                Data
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              />
              {errors.date && (
                <p className="mt-1 text-sm text-red-400">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Clock className="h-4 w-4" />
                Horário
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => updateField('time', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              />
              {errors.time && (
                <p className="mt-1 text-sm text-red-400">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Duration and Capacity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Duração (minutos)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => updateField('duration', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
                <option value="120">120 minutos</option>
              </select>
            </div>
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Users className="h-4 w-4" />
                Vagas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => updateField('capacity', e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Nível da Turma
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {levels.map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => updateField('level', level)}
                  className={`rounded-xl border py-3 text-sm font-medium transition ${
                    formData.level === level
                      ? 'border-amber-400 bg-amber-400/10 text-amber-400'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            {errors.level && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.level}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <BookOpen className="h-4 w-4" />
              Descrição (opcional)
            </label>
            <textarea
              placeholder="Descreva o conteúdo da aula..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 py-4 font-semibold text-white transition hover:bg-white/10"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-amber-400 py-4 font-semibold text-slate-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950 border-t-transparent" />
                  Criando...
                </span>
              ) : (
                'Criar Aula'
              )}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
