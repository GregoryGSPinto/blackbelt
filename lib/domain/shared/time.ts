/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TIME PROVIDER — Fonte centralizada de tempo                   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  REGRA: Todo timestamp no BlackBelt vem daqui.                   ║
 * ║  Nunca usar Date.now() ou new Date() diretamente.              ║
 * ║                                                                 ║
 * ║  Razões:                                                        ║
 * ║  • UTC sempre (timezone do servidor é irrelevante)             ║
 * ║  • Testável (mock de tempo em testes)                          ║
 * ║  • Reproduzível (replay com timestamp fixo)                    ║
 * ║  • Consistente (snapshot + evento com mesmo relógio)           ║
 * ║                                                                 ║
 * ║  TIMEZONE OFICIAL: UTC (ISO 8601 com Z)                        ║
 * ║  Formatação local é responsabilidade da UI, nunca do domínio.  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import type { ISODateTime } from './kernel';

// ════════════════════════════════════════════════════════════════════
// INTERFACE
// ════════════════════════════════════════════════════════════════════

export interface TimeProvider {
  /** Retorna UTC ISO string: "2026-02-19T21:03:11.000Z" */
  now(): ISODateTime;

  /** Retorna epoch ms */
  nowMs(): number;

  /** Retorna Date object (UTC) */
  nowDate(): Date;
}

// ════════════════════════════════════════════════════════════════════
// SYSTEM CLOCK (produção)
// ════════════════════════════════════════════════════════════════════

class SystemClock implements TimeProvider {
  now(): ISODateTime {
    return new Date().toISOString() as ISODateTime;
  }

  nowMs(): number {
    return Date.now();
  }

  nowDate(): Date {
    return new Date();
  }
}

// ════════════════════════════════════════════════════════════════════
// FIXED CLOCK (testes, replay)
// ════════════════════════════════════════════════════════════════════

export class FixedClock implements TimeProvider {
  private _now: Date;

  constructor(fixedTime: Date | string) {
    this._now = typeof fixedTime === 'string' ? new Date(fixedTime) : fixedTime;
  }

  now(): ISODateTime {
    return this._now.toISOString() as ISODateTime;
  }

  nowMs(): number {
    return this._now.getTime();
  }

  nowDate(): Date {
    return new Date(this._now);
  }

  /** Avança o relógio (para simular passagem de tempo em testes) */
  advance(ms: number): void {
    this._now = new Date(this._now.getTime() + ms);
  }

  /** Seta novo horário fixo */
  setTime(time: Date | string): void {
    this._now = typeof time === 'string' ? new Date(time) : time;
  }
}

// ════════════════════════════════════════════════════════════════════
// GLOBAL INSTANCE
// ════════════════════════════════════════════════════════════════════

let _clock: TimeProvider = new SystemClock();

/** Retorna o clock ativo */
export function getClock(): TimeProvider {
  return _clock;
}

/** Substitui o clock (para testes ou replay) */
export function setClock(clock: TimeProvider): void {
  _clock = clock;
}

/** Restaura clock do sistema */
export function resetClock(): void {
  _clock = new SystemClock();
}

// ════════════════════════════════════════════════════════════════════
// CONVENIENCE — Atalhos que usam o clock global
// ════════════════════════════════════════════════════════════════════

/** UTC ISO string via clock global */
export function utcNow(): ISODateTime {
  return _clock.now();
}

/** Epoch ms via clock global */
export function utcNowMs(): number {
  return _clock.nowMs();
}
