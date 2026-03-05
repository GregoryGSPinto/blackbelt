'use client';

import type { ReactNode, ComponentType } from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  children,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      ].join(' ')}
    >
      <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4" aria-hidden="true">
        <Icon className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-xs mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
