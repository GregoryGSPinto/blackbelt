'use client';
import { useState } from 'react';
import { Users, Star, Clock, DollarSign, Award, Phone, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { PROFESSORES, STAFF, CUSTO_FOLHA } from '@/lib/__mocks__/unit-owner.mock';

// ── Helpers ───────────────────────────────────────────────────
function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function metricColor(value: number): string {
  if (value >= 80) return '#22C55E';
  if (value >= 60) return '#F59E0B';
  return '#EF4444';
}

function initials(nome: string): string {
  return nome
    .replace(/^(Mestre|Prof\.|Dr\.)\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ── Component ─────────────────────────────────────────────────
export default function EquipePage() {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  // Computed from mock data
  const totalProfessores = PROFESSORES.length;
  const totalStaff = STAFF.length;
  const totalEquipe = totalProfessores + totalStaff;

  const cargaHorariaTotal = PROFESSORES.reduce((s, p) => s + p.cargaHoraria, 0);
  const avaliacaoMedia =
    PROFESSORES.reduce((s, p) => s + p.avaliacaoMedia, 0) / totalProfessores;

  const salarioProfessores = PROFESSORES.reduce((s, p) => s + p.salario, 0);
  const salarioStaff = STAFF.reduce((s, p) => s + p.salario, 0);
  const encargos = CUSTO_FOLHA * 0.3;
  const custoTotal = CUSTO_FOLHA + encargos;

  // Card style helper
  const card: React.CSSProperties = {
    background: 'var(--card-bg)',
    border: '1px solid black',
    borderRadius: 12,
  };

  return (
    <div className="space-y-8">
      {/* ── 1. Header ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Gestao de Pessoas
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {totalEquipe} membros na equipe &middot; Folha mensal {formatBRL(CUSTO_FOLHA)}
        </p>
      </div>

      {/* ── 2. Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: 'Total Professores', value: String(totalProfessores) },
          { icon: Clock, label: 'Carga Horaria Total', value: `${cargaHorariaTotal}h/sem` },
          { icon: Star, label: 'Avaliacao Media', value: avaliacaoMedia.toFixed(1) },
          { icon: DollarSign, label: 'Custo Folha Mensal', value: formatBRL(CUSTO_FOLHA) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl p-4 flex flex-col gap-2" style={card}>
            <div className="flex items-center gap-2">
              <s.icon size={18} style={{ color: 'var(--text-secondary)' }} />
              <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                {s.label}
              </span>
            </div>
            <span className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── 3. Ranking de Professores ──────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Ranking de Professores
        </h2>

        {PROFESSORES.map((prof) => {
          const expanded = expandedIds.has(prof.id);
          return (
            <div key={prof.id} className="rounded-xl overflow-hidden" style={card}>
              {/* Summary row */}
              <button
                type="button"
                onClick={() => toggle(prof.id)}
                className="w-full flex items-center justify-between gap-4 p-4 text-left"
                style={{ background: 'transparent' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Initials avatar */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: 'var(--text-secondary)',
                      color: 'var(--card-bg)',
                    }}
                  >
                    {initials(prof.nome)}
                  </div>

                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {prof.nome}
                    </p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {prof.modalidades.map((m) => (
                        <span
                          key={m}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: '#3B82F6', color: '#fff' }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Star rating */}
                  <span className="flex items-center gap-1 text-sm" style={{ color: '#F59E0B' }}>
                    <Star size={14} fill="#F59E0B" /> {prof.avaliacaoMedia.toFixed(1)}
                  </span>

                  {/* Contract status */}
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase"
                    style={{
                      background: prof.contratoStatus === 'ativo' ? '#22C55E22' : '#EF444422',
                      color: prof.contratoStatus === 'ativo' ? '#22C55E' : '#EF4444',
                    }}
                  >
                    {prof.contratoStatus}
                  </span>

                  {expanded ? (
                    <ChevronUp size={18} style={{ color: 'var(--text-secondary)' }} />
                  ) : (
                    <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
                  )}
                </div>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div
                  className="px-4 pb-4 pt-0 grid grid-cols-2 md:grid-cols-3 gap-4"
                  style={{ borderTop: '1px solid var(--text-secondary)', opacity: 0.95 }}
                >
                  {/* Turmas */}
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
                      Turmas
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {prof.turmas.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: '#6B728022', color: 'var(--text-primary)' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <DetailCell label="Carga Horaria" value={`${prof.cargaHoraria}h/sem`} />
                  <DetailCell label="Tipo Remuneracao" value={prof.tipoRemuneracao} />
                  <DetailCell label="Salario" value={formatBRL(prof.salario)} />
                  <DetailCell label="CREF" value={prof.cref} />

                  {/* Color-coded metrics */}
                  <MetricCell label="Retencao Alunos" value={prof.retencaoAlunos} suffix="%" />
                  <MetricCell label="Frequencia Media" value={prof.frequenciaMedia} suffix="%" />
                  <MetricCell
                    label="Satisfacao"
                    value={prof.satisfacao}
                    suffix="/5"
                    raw={prof.satisfacao * 20}
                  />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── 4. Staff / Recepcionistas ──────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Staff / Recepcionistas
        </h2>

        {STAFF.map((s) => (
          <div key={s.id} className="rounded-xl p-4 flex flex-wrap items-center gap-4" style={card}>
            {/* Avatar */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: '#6B7280', color: '#fff' }}
            >
              {initials(s.nome)}
            </div>

            <div className="flex-1 min-w-[140px]">
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {s.nome}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {s.funcao}
              </p>
            </div>

            <div className="text-sm flex flex-wrap gap-x-6 gap-y-1">
              <span style={{ color: 'var(--text-secondary)' }}>
                <Clock size={13} className="inline mr-1 -mt-0.5" />
                {s.horario}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <DollarSign size={13} className="inline mr-1 -mt-0.5" />
                {formatBRL(s.salario)}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>
                <Phone size={13} className="inline mr-1 -mt-0.5" />
                {s.contato}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 5. Organograma Visual ──────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Organograma
        </h2>

        <div className="flex flex-col items-center gap-0">
          {/* Owner */}
          <div
            className="rounded-xl px-6 py-3 text-center font-semibold"
            style={{
              ...card,
              borderColor: '#F59E0B',
              borderWidth: 2,
              color: 'var(--text-primary)',
            }}
          >
            <Shield size={18} className="inline mr-2 -mt-0.5" style={{ color: '#F59E0B' }} />
            Dono / Owner
          </div>

          {/* Connector line */}
          <div style={{ width: 2, height: 32, background: 'var(--text-secondary)' }} />

          {/* Professores row */}
          <div className="flex flex-wrap justify-center gap-3">
            {PROFESSORES.map((p) => (
              <div
                key={p.id}
                className="rounded-xl px-4 py-2 text-center text-sm"
                style={{
                  ...card,
                  borderColor: '#3B82F6',
                  borderWidth: 2,
                  color: 'var(--text-primary)',
                }}
              >
                <Award size={14} className="inline mr-1 -mt-0.5" style={{ color: '#3B82F6' }} />
                {p.nome}
              </div>
            ))}
          </div>

          {/* Connector line */}
          <div style={{ width: 2, height: 32, background: 'var(--text-secondary)' }} />

          {/* Staff row */}
          <div className="flex flex-wrap justify-center gap-3">
            {STAFF.map((s) => (
              <div
                key={s.id}
                className="rounded-xl px-4 py-2 text-center text-sm"
                style={{
                  ...card,
                  borderColor: '#6B7280',
                  borderWidth: 2,
                  color: 'var(--text-primary)',
                }}
              >
                <Users size={14} className="inline mr-1 -mt-0.5" style={{ color: '#6B7280' }} />
                {s.nome}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Custo Total da Folha ────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Custo Total da Folha
        </h2>

        <div className="rounded-xl p-5 space-y-3" style={card}>
          <CustoRow label="Professores" value={salarioProfessores} />
          <CustoRow label="Staff" value={salarioStaff} />
          <CustoRow label="Encargos estimados (30%)" value={encargos} />

          <div
            className="pt-3 flex items-center justify-between font-semibold text-lg"
            style={{ borderTop: '1px solid var(--text-secondary)', color: 'var(--text-primary)' }}
          >
            <span>Total</span>
            <span>{formatBRL(custoTotal)}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function DetailCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}

function MetricCell({
  label,
  value,
  suffix,
  raw,
}: {
  label: string;
  value: number;
  suffix: string;
  raw?: number;
}) {
  const score = raw ?? value;
  return (
    <div>
      <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <p className="text-sm font-semibold mt-0.5" style={{ color: metricColor(score) }}>
        {value}
        {suffix}
      </p>
    </div>
  );
}

function CustoRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{formatBRL(value)}</span>
    </div>
  );
}
