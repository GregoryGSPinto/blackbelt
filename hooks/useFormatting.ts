'use client';

import { useFormatter, useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';

/**
 * Locale-aware formatting utilities powered by next-intl.
 * Replaces hardcoded 'pt-BR' formatters throughout the app.
 *
 * Usage:
 *   const { formatDate, formatCurrency, formatNumber, formatRelativeTime } = useFormatting();
 *   formatDate('2024-01-15')           // "15 de jan. de 2024" (pt-BR) / "Jan 15, 2024" (en-US)
 *   formatCurrency(9990)               // "R$ 99,90" (pt-BR) / "$99.90" (en-US)
 *   formatNumber(1234.56)              // "1.234,56" (pt-BR) / "1,234.56" (en-US)
 */
export function useFormatting() {
  const format = useFormatter();
  const locale = useLocale();

  const currencyCode = locale === 'pt-BR' ? 'BRL' : 'USD';

  const formatDate = useCallback(
    (dateInput: string | Date, style: 'short' | 'medium' | 'long' = 'medium') => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00') : dateInput;
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
    [format],
  );

  const formatDateTime = useCallback(
    (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch {
        return String(dateInput);
      }
    },
    [format],
  );

  const formatCurrency = useCallback(
    (cents: number) => {
      try {
        return format.number(cents / 100, {
          style: 'currency',
          currency: currencyCode,
        });
      } catch {
        return `${currencyCode === 'BRL' ? 'R$' : '$'} ${(cents / 100).toFixed(2)}`;
      }
    },
    [format, currencyCode],
  );

  const formatNumber = useCallback(
    (value: number, options?: { style?: string; currency?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return format.number(value, options as any);
      } catch {
        return String(value);
      }
    },
    [format],
  );

  const formatTime = useCallback(
    (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { hour: '2-digit', minute: '2-digit' });
      } catch {
        return String(dateInput);
      }
    },
    [format],
  );

  const formatDateFull = useCallback(
    (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00') : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      } catch {
        return String(dateInput);
      }
    },
    [format],
  );

  const formatMonthShort = useCallback(
    (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput.includes('T') ? dateInput : dateInput + 'T12:00:00') : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.dateTime(date, { month: 'short', year: 'numeric' });
      } catch {
        return String(dateInput);
      }
    },
    [format],
  );

  const formatMoney = useCallback(
    (value: number, opts?: { minimumFractionDigits?: number }) => {
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
    [format, currencyCode],
  );

  const formatRelativeTime = useCallback(
    (dateInput: string | Date) => {
      try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return String(dateInput);
        return format.relativeTime(date);
      } catch {
        return String(dateInput);
      }
    },
    [format],
  );

  return useMemo(
    () => ({
      formatDate,
      formatDateTime,
      formatTime,
      formatDateFull,
      formatMonthShort,
      formatCurrency,
      formatMoney,
      formatNumber,
      formatRelativeTime,
      locale,
      currencyCode,
    }),
    [formatDate, formatDateTime, formatTime, formatDateFull, formatMonthShort, formatCurrency, formatMoney, formatNumber, formatRelativeTime, locale, currencyCode],
  );
}
