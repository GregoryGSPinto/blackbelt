'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, FileVideo, Image, X } from 'lucide-react';

interface VideoDropZoneProps {
  accept: string;
  label: string;
  hint: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  variant?: 'video' | 'thumbnail';
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function VideoDropZone({
  accept,
  label,
  hint,
  file,
  onFileSelect,
  variant = 'video',
}: VideoDropZoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) onFileSelect(droppedFile);
    },
    [onFileSelect],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0] || null;
      onFileSelect(selected);
    },
    [onFileSelect],
  );

  const isSmall = variant === 'thumbnail';
  const Icon = isSmall ? Image : Upload;

  if (file) {
    return (
      <div
        className="rounded-xl flex items-center gap-3 p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(251,191,36,0.2)',
        }}
      >
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          {isSmall ? (
            <Image size={18} className="text-amber-400/60" />
          ) : (
            <FileVideo size={18} className="text-amber-400/60" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/70 truncate">{file.name}</p>
          <p className="text-[10px] text-white/30">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onFileSelect(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors flex-shrink-0"
        >
          <X size={14} className="text-white/40" />
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative rounded-xl cursor-pointer transition-all duration-300 ${
        isSmall ? 'p-4' : 'p-8'
      } ${
        dragOver
          ? 'border-amber-500/40 shadow-[0_0_20px_rgba(251,191,36,0.08)]'
          : 'border-white/10 hover:border-amber-500/20'
      }`}
      style={{
        background: dragOver ? 'rgba(251,191,36,0.03)' : 'rgba(255,255,255,0.02)',
        border: `2px dashed ${dragOver ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)'}`,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      <div className={`text-center ${isSmall ? '' : 'py-4'}`}>
        <div
          className={`mx-auto rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
            isSmall ? 'w-10 h-10' : 'w-14 h-14'
          } ${dragOver ? 'bg-amber-500/15' : 'bg-white/5'}`}
        >
          <Icon
            size={isSmall ? 18 : 24}
            className={`transition-colors duration-300 ${
              dragOver ? 'text-amber-400/70' : 'text-white/30'
            }`}
          />
        </div>
        <p className={`font-medium transition-colors ${isSmall ? 'text-xs' : 'text-sm'} ${
          dragOver ? 'text-amber-200/70' : 'text-white/50'
        }`}>
          {label}
        </p>
        <p className="text-[10px] text-white/25 mt-1">{hint}</p>
      </div>
    </div>
  );
}
