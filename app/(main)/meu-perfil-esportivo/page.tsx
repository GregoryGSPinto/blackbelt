'use client';

// ============================================================
// MEU PERFIL ESPORTIVO — Modalidades, Peso, Atestado, Termos
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Award, Scale, FileCheck, FileText, Target, AlertTriangle,
  CheckCircle, Clock, XCircle, Heart, Dumbbell,
} from 'lucide-react';
import * as perfilService from '@/lib/api/perfil-estendido.service';
import type { PerfilEstendido, Modalidade, StatusDocumento } from '@/lib/api/contracts';
import { PageError, PageLoading, handleServiceError } from '@/components/shared/DataStates';

const MODALIDADES_INFO: Record<string, { label: string; emoji: string }> = {
  pratica_gi: { label: 'Prática Gi', emoji: '🥋' },
  pratica_nogi: { label: 'Prática No-Gi', emoji: '💪' },
  mma: { label: 'MMA', emoji: '🥊' },
  muay_thai: { label: 'Muay Thai', emoji: '🦵' },
  wrestling: { label: 'Wrestling', emoji: '🤼' },
  judo: { label: 'Judô', emoji: '🏋️' },
};

const CATEGORIAS_PESO: Record<string, { label: string; pesoMax: string }> = {
  galo: { label: 'Galo', pesoMax: '57.5 kg' },
  pluma: { label: 'Pluma', pesoMax: '64 kg' },
  pena: { label: 'Pena', pesoMax: '70 kg' },
  leve: { label: 'Leve', pesoMax: '76 kg' },
  medio: { label: 'Médio', pesoMax: '82.3 kg' },
  meio_pesado: { label: 'Meio-Pesado', pesoMax: '88.3 kg' },
  pesado: { label: 'Pesado', pesoMax: '94.3 kg' },
  super_pesado: { label: 'Super-Pesado', pesoMax: '100.5 kg' },
  pesadissimo: { label: 'Pesadíssimo', pesoMax: 'Sem limite' },
};

const STATUS_DOC: Record<StatusDocumento, { label: string; color: string; icon: React.ReactNode }> = {
  pendente: { label: 'Pendente', color: 'text-amber-400', icon: <Clock size={14} className="text-amber-400" /> },
  enviado: { label: 'Enviado', color: 'text-blue-400', icon: <Clock size={14} className="text-blue-400" /> },
  aprovado: { label: 'Aprovado', color: 'text-green-400', icon: <CheckCircle size={14} className="text-green-400" /> },
  vencido: { label: 'Vencido', color: 'text-red-400', icon: <AlertTriangle size={14} className="text-red-400" /> },
  rejeitado: { label: 'Rejeitado', color: 'text-red-400', icon: <XCircle size={14} className="text-red-400" /> },
};

export default function PerfilEsportivoPage() {
  const [perfil, setPerfil] = useState<PerfilEstendido | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setError(null); setLoading(true);
    perfilService.getPerfilEstendido()
      .then((data: PerfilEstendido) => setPerfil(data))
      .catch((err: unknown) => setError(handleServiceError(err, 'Perfil')))
      .finally(() => setLoading(false));
  }, [retryCount]);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/30 mx-auto mb-4" /><p className="text-white/60">Carregando...</p></div></div>;
  if (error) return <PageError error={error} onRetry={() => setRetryCount((c: number) => c + 1)} />;
  if (!perfil) return <PageLoading message="Carregando perfil..." />;

  const cat = perfil.categoriaCompetidor ? CATEGORIAS_PESO[perfil.categoriaCompetidor] : null;
  const atestado = STATUS_DOC[perfil.atestadoMedico.status as StatusDocumento];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Perfil Esportivo</h1>
        <p className="text-white/50">Modalidades, peso, documentos e objetivos</p>
      </div>

      {/* Modalidades */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4"><Award size={16} className="text-blue-400" />Modalidades</h2>
        <div className="flex flex-wrap gap-2">
          {perfil.modalidades.map((m: Modalidade) => {
            const info = MODALIDADES_INFO[m];
            return (
              <span key={m} className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-lg text-sm font-medium">
                {info?.emoji} {info?.label || m}
              </span>
            );
          })}
        </div>
      </div>

      {/* Peso + Categoria */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4"><Scale size={16} className="text-purple-400" />Peso & Categoria</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/30 text-xs mb-1">Peso Atual</p>
            <p className="text-white text-2xl font-bold">{perfil.peso ? `${perfil.peso} kg` : '—'}</p>
          </div>
          <div>
            <p className="text-white/30 text-xs mb-1">Categoria</p>
            {cat ? (
              <div>
                <p className="text-white text-lg font-bold">{cat.label}</p>
                <p className="text-white/30 text-xs">até {cat.pesoMax}</p>
              </div>
            ) : (
              <p className="text-white/30 text-sm">Não definida</p>
            )}
          </div>
        </div>
      </div>

      {/* Atestado Médico */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4"><FileCheck size={16} className="text-green-400" />Atestado Médico</h2>
        <div className="flex items-center gap-3 mb-3">
          {atestado.icon}
          <span className={`font-bold text-sm ${atestado.color}`}>{atestado.label}</span>
        </div>
        {perfil.atestadoMedico.dataEnvio && (
          <p className="text-white/30 text-xs">Enviado: {new Date(perfil.atestadoMedico.dataEnvio + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
        )}
        {perfil.atestadoMedico.dataValidade && (
          <p className="text-white/30 text-xs">Validade: {new Date(perfil.atestadoMedico.dataValidade + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
        )}
      </div>

      {/* Termos */}
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
        <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-4"><FileText size={16} className="text-amber-400" />Termos & Consentimentos</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Termo de Responsabilidade</span>
            {perfil.termoResponsabilidade.aceito ? (
              <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle size={12} /> Aceito {perfil.termoResponsabilidade.versao && `(${perfil.termoResponsabilidade.versao})`}</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-xs"><Clock size={12} /> Pendente</span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-white/60 text-sm">Termo de Uso de Imagem</span>
            {perfil.termoImagem.aceito ? (
              <span className="flex items-center gap-1 text-green-400 text-xs"><CheckCircle size={12} /> Aceito</span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400 text-xs"><Clock size={12} /> Pendente</span>
            )}
          </div>
        </div>
      </div>

      {/* Objetivos & Saúde */}
      <div className="grid grid-cols-1 gap-4">
        {perfil.objetivos && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-3"><Target size={16} className="text-blue-400" />Objetivos</h2>
            <p className="text-white/60 text-sm">{perfil.objetivos}</p>
          </div>
        )}
        {perfil.lesoes && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-3"><Heart size={16} className="text-red-400" />Lesões / Restrições</h2>
            <p className="text-white/60 text-sm">{perfil.lesoes}</p>
          </div>
        )}
        {perfil.experienciaPrevia && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-bold text-sm flex items-center gap-2 mb-3"><Dumbbell size={16} className="text-purple-400" />Experiência Prévia</h2>
            <p className="text-white/60 text-sm">{perfil.experienciaPrevia}</p>
          </div>
        )}
      </div>
    </div>
  );
}
