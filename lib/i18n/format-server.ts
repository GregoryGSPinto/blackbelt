import { getLocale, getFormatter } from 'next-intl/server';

/**
 * Server-side formatting utilities for date/number/currency.
 * Use in Server Components and API routes.
 */
export async function getServerFormatting() {
  const locale = await getLocale();
  const format = await getFormatter();
  const currencyCode = locale === 'pt-BR' ? 'BRL' : 'USD';

  return {
    formatDate: (dateInput: string | Date, style: 'short' | 'medium' | 'long' = 'medium') => {
      try {
        const date = typeof dateInput === 'string'
          ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00')
          : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);

        switch (style) {
          case 'short':
            return format.dateTime(date, { day: '2-digit', month: '2-digit' });
          case 'long':
            return format.dateTime(date, { day: 'numeric', month: 'long', year: 'numeric' });
          default:
            return format.dateTime(date, { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch {
        return String(dateInput);
      }
    },

    formatCurrency: (cents: number) => {
      try {
        return format.number(cents / 100, { style: 'currency', currency: currencyCode });
      } catch {
        return `${currencyCode === 'BRL' ? 'R$' : '$'} ${(cents / 100).toFixed(2)}`;
      }
    },

    formatNumber: (value: number, options?: { style?: string; currency?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return format.number(value, options as any);
      } catch {
        return String(value);
      }
    },

    formatTime: (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { hour: '2-digit', minute: '2-digit' });
      } catch {
        return String(dateInput);
      }
    },

    formatDateFull: (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00') : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      } catch {
        return String(dateInput);
      }
    },

    formatMonthShort: (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00') : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { month: 'short', year: 'numeric' });
      } catch {
        return String(dateInput);
      }
    },

    formatMoney: (value: number, opts?: { minimumFractionDigits?: number }) => {
      try {
        return format.number(value, {
          style: 'currency',
          currency: currencyCode,
          minimumFractionDigits: opts?.minimumFractionDigits ?? 2,
        });
      } catch {
        return `${currencyCode === 'BRL' ? 'R$' : '$'} ${value.toFixed(2)}`;
      }
    },

    locale,
    currencyCode,
  };
}
