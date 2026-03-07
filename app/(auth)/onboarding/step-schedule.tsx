/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
'use client';

import { useState, useCallback } from 'react';
import { createFirstScheduleAction } from '@/app/actions/onboarding';
import { Calendar, ArrowLeft } from 'lucide-react';

const WEEKDAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
];

interface StepScheduleProps {
  academyId: string;
  onComplete: () => void;
  onBack: () => void;
  tokens: ReturnType<typeof import('@/lib/design-tokens').getDesignTokens>;
}

export default function StepSchedule({ academyId, onComplete, onBack, tokens }: StepScheduleProps) {
  const [className, setClassName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleDay = useCallback((day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!className.trim() || selectedDays.length === 0) return;
    setSubmitting(true);
    setError(null);

    try {
      const result = await createFirstScheduleAction({
        academyId,
        name: className.trim(),
        days: selectedDays,
        startTime,
        endTime,
      });

      if (result.success) {
        onComplete();
      } else {
        setError(result.error);
      }
    } catch {
      setError('Failed to create schedule. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [academyId, className, selectedDays, startTime, endTime, onComplete]);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: tokens.text }}>
          First Class Schedule
        </h2>
        <p className="text-sm mt-1" style={{ color: tokens.textMuted }}>
          Set up your first class (you can add more later)
        </p>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
          Class Name *
        </label>
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          placeholder="e.g. Beginner Jiu-Jitsu"
          className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2" style={{ color: tokens.textMuted }}>
          Days *
        </label>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAYS.map((day) => (
            <button
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: selectedDays.includes(day.id) ? 'var(--academy-primary, #C9A227)' : 'transparent',
                color: selectedDays.includes(day.id) ? '#fff' : tokens.text,
                border: `1px solid ${selectedDays.includes(day.id) ? 'transparent' : tokens.inputBorder}`,
              }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
            Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
            style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1" style={{ color: tokens.textMuted }}>
            End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg bg-transparent text-sm"
            style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm" style={{ color: tokens.error }}>
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ border: `1px solid ${tokens.inputBorder}`, color: tokens.text }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting || !className.trim() || selectedDays.length === 0}
          className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
          style={{ background: 'var(--academy-primary, #C9A227)', color: '#fff' }}
        >
          {submitting ? 'Creating...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
