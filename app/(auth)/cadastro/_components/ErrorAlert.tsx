'use client';

import { AlertCircle } from 'lucide-react';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="flex gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  );
}
