// ============================================================
// useFormDefaults — Smart form defaults based on user context
// ============================================================
// Pre-populates form fields with known user data and
// usage patterns stored in localStorage.
// ============================================================
'use client';

import { useMemo, useCallback } from 'react';

// ── Types ──

interface FormDefaults {
  /** User's name (pre-fill name fields) */
  nome?: string;
  /** User's email */
  email?: string;
  /** Default turma based on history */
  turma?: string;
  /** Suggested time based on usage pattern */
  horario?: string;
  /** Most-used professor */
  instrutor?: string;
}

interface UseFormDefaultsOptions {
  /** Form identifier for pattern storage */
  formId: string;
}

const STORAGE_KEY = 'blackbelt_form_patterns';

// ── Helper: get usage patterns ──

function getPatterns(formId: string): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      return all[formId] || {};
    }
  } catch { /* ignore */ }
  return {};
}

function getMostUsed(patterns: Record<string, Record<string, number>>, field: string): string | undefined {
  const fieldPatterns = patterns[field];
  if (!fieldPatterns) return undefined;
  let maxKey: string | undefined;
  let maxCount = 0;
  for (const [key, count] of Object.entries(fieldPatterns)) {
    if (count > maxCount) {
      maxCount = count;
      maxKey = key;
    }
  }
  return maxKey;
}

// ── Hook ──

export function useFormDefaults({ formId }: UseFormDefaultsOptions) {
  const patterns = useMemo(() => getPatterns(formId), [formId]);

  /** Get default value for a field */
  const getDefault = useCallback((field: string, fallback?: string): string => {
    return getMostUsed(patterns, field) || fallback || '';
  }, [patterns]);

  /** Record a field value when form is submitted */
  const recordUsage = useCallback((field: string, value: string) => {
    if (!value || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      if (!all[formId]) all[formId] = {};
      if (!all[formId][field]) all[formId][field] = {};
      all[formId][field][value] = (all[formId][field][value] || 0) + 1;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  }, [formId]);

  /** Record multiple fields at once (e.g. on form submit) */
  const recordAll = useCallback((fields: Record<string, string>) => {
    Object.entries(fields).forEach(([field, value]) => {
      if (value) recordUsage(field, value);
    });
  }, [recordUsage]);

  /** Clear patterns for this form */
  const clearPatterns = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const all = raw ? JSON.parse(raw) : {};
      delete all[formId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch { /* ignore */ }
  }, [formId]);

  return {
    getDefault,
    recordUsage,
    recordAll,
    clearPatterns,
  };
}
