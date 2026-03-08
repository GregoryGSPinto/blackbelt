// ============================================================
// AlunoCheckinCard — Contextual 1-tap check-in for students
// ============================================================
// Appears at the top of the student home page when a class is
// in progress or starting within 30 minutes.
// Auto-detects the relevant turma by schedule.
// ============================================================
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Clock, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useFormatting } from '@/hooks/useFormatting';
import * as turmasService from '@/lib/api/minhas-turmas.service';
import type { TurmaAluno } from '@/lib/api/minhas-turmas.service';
import * as checkinService from '@/lib/api/checkin.service';

// ── Types ──

interface ActiveTurma extends TurmaAluno {
  status: 'em_andamento' | 'em_breve';
  minutosRestantes: number;
}

// ── Day / time helpers ──

const DIAS_MAP: Record<number, string> = {
  0: 'Domingo', 1: 'Segunda', 2: 'Terça', 3: 'Quarta',
  4: 'Quinta', 5: 'Sexta', 6: 'Sábado',
};

function parseHorario(horario: string): { inicio: number; fim: number } {
  const parts = horario.split(/\s*[–-]\s*/);
  const parse = (s: string) => {
    const [h, m] = (s || '0:0').trim().split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  return { inicio: parse(parts[0]), fim: parse(parts[1] || '23:59') };
}

function getTurmasAtivas(turmas: TurmaAluno[], now: Date): ActiveTurma[] {
  const diaHoje = DIAS_MAP[now.getDay()];
  const minutosAgora = now.getHours() * 60 + now.getMinutes();
  const result: ActiveTurma[] = [];

  for (const turma of turmas) {
    const runsToday = turma.diasSemana.includes(diaHoje);
    if (!runsToday) continue;

    const { inicio, fim } = parseHorario(turma.horario);

    if (minutosAgora >= inicio && minutosAgora <= fim) {
      result.push({ ...turma, status: 'em_andamento', minutosRestantes: 0 });
    } else if (inicio - minutosAgora > 0 && inicio - minutosAgora <= 30) {
      result.push({ ...turma, status: 'em_breve', minutosRestantes: inicio - minutosAgora });
    }
  }

  // Sort: em_andamento first, then by closest start
  return result.sort((a, b) => {
    if (a.status === 'em_andamento' && b.status !== 'em_andamento') return -1;
    if (b.status === 'em_andamento' && a.status !== 'em_andamento') return 1;
    return a.minutosRestantes - b.minutosRestantes;
  });
}

// ── Storage key for "already checked in" state ──

const CHECKIN_KEY = 'blackbelt_aluno_checkin';

function getCheckedIn(turmaId: string, date: string): boolean {
  try {
    const raw = sessionStorage.getItem(CHECKIN_KEY);
    if (raw) {
      const map = JSON.parse(raw);
      return !!map[`${turmaId}_${date}`];
    }
  } catch { /* ignore */ }
  return false;
}

function setCheckedIn(turmaId: string, date: string) {
  try {
    const raw = sessionStorage.getItem(CHECKIN_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[`${turmaId}_${date}`] = true;
    sessionStorage.setItem(CHECKIN_KEY, JSON.stringify(map));
  } catch { /* ignore */ }
}

// ── Styles ──

const CARD_STYLES = `
  @keyframes checkin-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.15); }
  }
  @keyframes checkin-pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }
`;

// ── Component ──

export function AlunoCheckinCard() {
  const { user } = useAuth();
  const [turmas, setTurmas] = useState<TurmaAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  // Fetch turmas
  useEffect(() => {
    turmasService.getMinhasTurmas()
      .then(setTurmas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Refresh time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const ativas = useMemo(() => getTurmasAtivas(turmas, now), [turmas, now]);

  if (loading || ativas.length === 0) return null;

  const today = now.toISOString().split('T')[0];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CARD_STYLES }} />
      <div className="space-y-2">
        {ativas.map((turma: ActiveTurma) => (
          <SingleCheckinCard
            key={turma.id}
            turma={turma}
            userId={user?.id || ''}
            today={today}
          />
        ))}
      </div>
    </>
  );
}

// ── Single turma card ──

function SingleCheckinCard({
  turma,
  userId,
  today,
}: {
  turma: ActiveTurma;
  userId: string;
  today: string;
}) {
  const { formatTime } = useFormatting();
  const [confirmed, setConfirmed] = useState(() => getCheckedIn(turma.id, today));
  const [confirming, setConfirming] = useState(false);
  const [confirmTime, setConfirmTime] = useState<string | null>(null);

  const handleCheckin = useCallback(async () => {
    if (confirmed || confirming) return;
    setConfirming(true);
    try {
      await checkinService.registerCheckin(userId, turma.id, 'APP');
      const timeStr = formatTime(new Date());
      setConfirmTime(timeStr);
      setConfirmed(true);
      setCheckedIn(turma.id, today);
    } catch {
      // Could show error toast here
    } finally {
      setConfirming(false);
    }
  }, [confirmed, confirming, userId, turma.id, today]);

  const isActive = turma.status === 'em_andamento';

  return (
    <div
      className="relative rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: confirmed
          ? 'rgba(34,197,94,0.06)'
          : isActive
            ? 'rgba(34,197,94,0.08)'
            : 'rgba(59,130,246,0.06)',
        border: `1px solid ${confirmed ? 'rgba(34,197,94,0.15)' : isActive ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.10)'}`,
      }}
    >
      <div className="p-4 flex items-center gap-3.5">
        {/* Pulse indicator */}
        <div className="relative flex-shrink-0">
          {confirmed ? (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(34,197,94,0.15)',
                animation: 'checkin-pop 400ms ease both',
              }}
            >
              <Check size={18} className="text-green-400" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.10)' }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: isActive ? '#4ADE80' : '#60A5FA',
                  animation: isActive ? 'checkin-pulse 2s ease-in-out infinite' : 'none',
                }}
              />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-white/85 truncate">{turma.nome}</p>
            <span
              className="text-[9px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: isActive ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.12)',
                color: isActive ? '#4ADE80' : '#60A5FA',
              }}
            >
              {isActive ? 'Agora' : `${turma.minutosRestantes}min`}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <Clock size={9} /> {turma.horario}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <User size={9} /> {turma.professorNome}
            </span>
          </div>
        </div>

        {/* Action */}
        {confirmed ? (
          <div className="text-right flex-shrink-0" style={{ animation: 'checkin-pop 300ms ease both' }}>
            <p className="text-xs font-medium text-green-400">Confirmado</p>
            {confirmTime && (
              <p className="text-[9px] text-green-400/50 mt-0.5">às {confirmTime}</p>
            )}
          </div>
        ) : (
          <button
            onClick={handleCheckin}
            disabled={confirming}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            style={{
              background: isActive
                ? 'linear-gradient(135deg, #22C55E, #16A34A)'
                : 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#fff',
              boxShadow: isActive
                ? '0 4px 12px rgba(34,197,94,0.25)'
                : '0 4px 12px rgba(59,130,246,0.2)',
            }}
            aria-label={`Confirmar presença na turma ${turma.nome}`}
          >
            {confirming ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              'Confirmar ✅'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
