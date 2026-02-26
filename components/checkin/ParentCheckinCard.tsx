// ============================================================
// ParentCheckinCard — Confirm child's attendance (1 tap)
// ============================================================
// Shows contextual card when child has class now or within 30min.
// Parses turma string "Kids A - Terça e Quinta, 17:00" for schedule.
// ============================================================
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Check, Clock, Loader2 } from 'lucide-react';
import { useParent, type FilhoUnificado } from '@/contexts/ParentContext';
import * as checkinService from '@/lib/api/checkin.service';

// ── Day helpers ──

const DIAS_MAP: Record<number, string[]> = {
  0: ['Domingo', 'Dom'],
  1: ['Segunda', 'Seg'],
  2: ['Terça', 'Ter'],
  3: ['Quarta', 'Qua'],
  4: ['Quinta', 'Qui'],
  5: ['Sexta', 'Sex'],
  6: ['Sábado', 'Sáb'],
};

/**
 * Parse turma string: "Kids A - Terça e Quinta, 17:00"
 * Returns days array and time in minutes.
 */
function parseTurmaSchedule(turma: string): { dias: string[]; horarioMin: number; horarioStr: string } | null {
  // Extract time: look for HH:MM pattern
  const timeMatch = turma.match(/(\d{1,2}):(\d{2})/);
  if (!timeMatch) return null;
  const h = parseInt(timeMatch[1], 10);
  const m = parseInt(timeMatch[2], 10);
  const horarioMin = h * 60 + m;
  const horarioStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  // Extract days
  const diasNomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  const dias = diasNomes.filter(d => turma.includes(d));

  if (dias.length === 0) return null;
  return { dias, horarioMin, horarioStr };
}

function isClassActive(turma: string, now: Date): { active: boolean; status: 'em_andamento' | 'em_breve' | 'none'; minutosRestantes: number; horarioStr: string } {
  const schedule = parseTurmaSchedule(turma);
  if (!schedule) return { active: false, status: 'none', minutosRestantes: 0, horarioStr: '' };

  const diaHoje = DIAS_MAP[now.getDay()][0]; // Full name
  if (!schedule.dias.includes(diaHoje)) return { active: false, status: 'none', minutosRestantes: 0, horarioStr: schedule.horarioStr };

  const minutosAgora = now.getHours() * 60 + now.getMinutes();
  const diff = schedule.horarioMin - minutosAgora;

  // Class in progress (assume 1h duration)
  if (minutosAgora >= schedule.horarioMin && minutosAgora <= schedule.horarioMin + 60) {
    return { active: true, status: 'em_andamento', minutosRestantes: 0, horarioStr: schedule.horarioStr };
  }
  // Class starting within 30min
  if (diff > 0 && diff <= 30) {
    return { active: true, status: 'em_breve', minutosRestantes: diff, horarioStr: schedule.horarioStr };
  }

  return { active: false, status: 'none', minutosRestantes: 0, horarioStr: schedule.horarioStr };
}

// ── Storage ──

const PARENT_CK_KEY = 'blackbelt_parent_checkin';

function isAlreadyConfirmed(filhoId: string, date: string): boolean {
  try {
    const raw = sessionStorage.getItem(PARENT_CK_KEY);
    if (raw) return !!JSON.parse(raw)[`${filhoId}_${date}`];
  } catch { /* */ }
  return false;
}

function markConfirmed(filhoId: string, date: string) {
  try {
    const raw = sessionStorage.getItem(PARENT_CK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[`${filhoId}_${date}`] = true;
    sessionStorage.setItem(PARENT_CK_KEY, JSON.stringify(map));
  } catch { /* */ }
}

// ── Component ──

export function ParentCheckinCard() {
  const { filhos } = useParent();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const activeFilhos = useMemo(() => {
    return filhos
      .map((filho: FilhoUnificado) => {
        const result = isClassActive(filho.turma, now);
        return { filho, ...result };
      })
      .filter((f: { active: boolean }) => f.active);
  }, [filhos, now]);

  if (activeFilhos.length === 0) return null;

  const today = now.toISOString().split('T')[0];

  return (
    <div className="space-y-2">
      {activeFilhos.map((item: { filho: FilhoUnificado; status: 'em_andamento' | 'em_breve' | 'none'; minutosRestantes: number; horarioStr: string }) => (
        <FilhoCheckinCard
          key={item.filho.id}
          filho={item.filho}
          status={item.status}
          minutosRestantes={item.minutosRestantes}
          horarioStr={item.horarioStr}
          today={today}
        />
      ))}
    </div>
  );
}

// ── Single child card ──

function FilhoCheckinCard({
  filho,
  status,
  minutosRestantes,
  horarioStr,
  today,
}: {
  filho: FilhoUnificado;
  status: 'em_andamento' | 'em_breve' | 'none';
  minutosRestantes: number;
  horarioStr: string;
  today: string;
}) {
  const [confirmed, setConfirmed] = useState(() => isAlreadyConfirmed(filho.id, today));
  const [confirming, setConfirming] = useState(false);
  const [confirmTime, setConfirmTime] = useState<string | null>(null);
  const primeiroNome = filho.nome.split(' ')[0];
  const turmaNome = filho.turma.split(' - ')[0];
  const isActive = status === 'em_andamento';

  const handleConfirm = useCallback(async () => {
    if (confirmed || confirming) return;
    setConfirming(true);
    try {
      await checkinService.registerCheckin(filho.id, filho.id, 'RESPONSAVEL');
      const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setConfirmTime(timeStr);
      setConfirmed(true);
      markConfirmed(filho.id, today);
    } catch { /* */ }
    finally { setConfirming(false); }
  }, [confirmed, confirming, filho.id, today]);

  // Color scheme based on child type
  const color = filho.turma.toLowerCase().includes('teen') ? '#3B82F6' : '#22C55E';

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: confirmed ? `${color}08` : `${color}06`,
        border: `1px solid ${color}${confirmed ? '20' : '12'}`,
      }}
    >
      <div className="p-4 flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}18` }}
        >
          {confirmed ? (
            <Check size={16} style={{ color }} />
          ) : (
            <span>{filho.avatar}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white/85 truncate">
            {confirmed ? `${primeiroNome} — presença confirmada` : `${primeiroNome} tem sessão às ${horarioStr}`}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-white/30">{turmaNome}</span>
            {!confirmed && (
              <span
                className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                style={{ background: `${color}15`, color }}
              >
                {isActive ? 'Agora' : `${minutosRestantes}min`}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        {confirmed ? (
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold" style={{ color }}>✅</p>
            {confirmTime && (
              <p className="text-[9px] mt-0.5" style={{ color: `${color}80` }}>às {confirmTime}</p>
            )}
          </div>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={confirming}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-[11px] font-bold text-white transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}CC)`,
              boxShadow: `0 4px 12px ${color}30`,
            }}
            aria-label={`Confirmar presença de ${primeiroNome}`}
          >
            {confirming ? <Loader2 size={12} className="animate-spin" /> : `Confirmar`}
          </button>
        )}
      </div>
    </div>
  );
}
