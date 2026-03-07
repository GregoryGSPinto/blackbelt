'use client';

import { useState } from 'react';
import type { InstructorPerformanceVM } from '@/lib/application/intelligence';
import { useTranslations } from 'next-intl';

// ════════════════════════════════════════════════════════════════════
// INSTRUCTOR PERFORMANCE TABLE — Tabela de performance por professor
// ════════════════════════════════════════════════════════════════════

interface InstructorPerformanceTableProps {
  instructors: InstructorPerformanceVM[];
}

type SortKey = 'name' | 'studentsRetentionRate' | 'avgStudentEngagement' | 'classCount' | 'avgClassHealth';
type SortDirection = 'asc' | 'desc';

function getScoreColor(value: number): string {
  if (value >= 70) return 'text-green-400';
  if (value >= 40) return 'text-yellow-400';
  return 'text-red-400';
}

function getScoreBg(value: number): string {
  if (value >= 70) return 'bg-green-500/10';
  if (value >= 40) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

export function InstructorPerformanceTable({ instructors }: InstructorPerformanceTableProps) {
  const t = useTranslations('admin');
  const [sortKey, setSortKey] = useState<SortKey>('avgStudentEngagement');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...instructors].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    const numA = typeof aVal === 'number' ? aVal : 0;
    const numB = typeof bVal === 'number' ? bVal : 0;
    return sortDir === 'asc' ? numA - numB : numB - numA;
  });

  const columns: { key: SortKey; label: string; hideOnMobile?: boolean }[] = [
    { key: 'name', label: t('instructorPerformance.instructor') },
    { key: 'studentsRetentionRate', label: t('instructorPerformance.retention') },
    { key: 'avgStudentEngagement', label: t('instructorPerformance.engagement') },
    { key: 'classCount', label: t('instructorPerformance.classes'), hideOnMobile: true },
    { key: 'avgClassHealth', label: t('instructorPerformance.classHealth') },
  ];

  if (instructors.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-6 text-center">
        <p className="text-sm text-zinc-500">{t('instructorPerformance.noData')}</p>
      </div>
    );
  }

  // Identify top and bottom performers
  const topId = sorted.length > 0 ? sorted[0]?.instructorId : null;
  const bottomId = sorted.length > 2 ? sorted[sorted.length - 1]?.instructorId : null;

  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">{t('instructorPerformance.title')}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-800">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`px-4 py-2.5 text-[10px] uppercase tracking-wider text-zinc-600 font-medium cursor-pointer hover:text-zinc-400 transition-colors ${
                    col.hideOnMobile ? 'hidden md:table-cell' : ''
                  }`}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && (
                      <span className="text-zinc-400">{sortDir === 'asc' ? '^' : 'v'}</span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {sorted.map((instructor) => {
              const isTop = instructor.instructorId === topId;
              const isBottom = instructor.instructorId === bottomId;

              return (
                <tr
                  key={instructor.instructorId}
                  className={`hover:bg-zinc-800/30 transition-colors ${
                    isTop ? 'bg-green-500/5' : isBottom ? 'bg-red-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-medium text-zinc-300 flex-shrink-0">
                        {instructor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm text-zinc-200">{instructor.name}</span>
                        {isTop && (
                          <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                            TOP
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getScoreColor(instructor.studentsRetentionRate)}`}>
                      {instructor.studentsRetentionRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getScoreColor(instructor.avgStudentEngagement)}`}>
                        {instructor.avgStudentEngagement}
                      </span>
                      <div className={`h-1.5 w-12 rounded-full ${getScoreBg(instructor.avgStudentEngagement)}`}>
                        <div
                          className={`h-1.5 rounded-full ${
                            instructor.avgStudentEngagement >= 70 ? 'bg-green-500' :
                            instructor.avgStudentEngagement >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, instructor.avgStudentEngagement)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-sm text-zinc-400">{instructor.classCount}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${getScoreBg(instructor.avgClassHealth)} ${getScoreColor(instructor.avgClassHealth)} font-medium`}>
                      {instructor.avgClassHealth}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
