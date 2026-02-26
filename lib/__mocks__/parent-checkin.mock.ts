// ============================================================
// Parent Check-in Mock — History and calendar data
// ============================================================

import type { CheckinDay } from '@/components/parent/CheckinCalendar';

/**
 * Generate mock check-in history for a child.
 * Creates data for the current month with ~75% attendance.
 */
export function getMockCheckinHistory(filhoId: string, days = 30): CheckinDay[] {
  const result: CheckinDay[] = [];
  const now = new Date();
  const today = now.toISOString().split('T')[0];

  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split('T')[0];
    if (iso > today) continue;

    const dow = d.getDay();
    // Assume class on Mon(1), Wed(3), Fri(5) for kids
    if (dow === 1 || dow === 3 || dow === 5) {
      // ~75% attendance with some realistic variation
      const presente = Math.random() > 0.25;
      result.push({
        data: iso,
        presente,
        turma: filhoId.includes('teen') ? 'Teen' : 'Kids A',
        horario: filhoId.includes('teen') ? '18:00' : '17:00',
        confirmadoPor: presente ? (Math.random() > 0.5 ? 'responsavel' : 'instrutor') : undefined,
      });
    }
  }
  return result;
}

/**
 * Get class days (weekday numbers) for a child.
 * 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
export function getMockClassDays(_filhoId: string): number[] {
  // Default: Mon, Wed, Fri for most kids
  return [1, 3, 5];
}
