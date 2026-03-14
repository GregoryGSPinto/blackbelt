'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  max?: number;
  maxLength?: number;
  placeholder?: string;
}

export function TagsInput({
  tags,
  onChange,
  max = 10,
  maxLength = 30,
  placeholder = 'Digite e pressione Enter...',
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTag = useCallback(
    (raw: string) => {
      const tag = raw.trim().toLowerCase();
      if (!tag) return;
      if (tag.length > maxLength) return;
      if (tags.length >= max) return;
      if (tags.includes(tag)) return;
      onChange([...tags, tag]);
      setInputValue('');
    },
    [tags, onChange, max, maxLength],
  );

  const removeTag = useCallback(
    (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    },
    [tags, onChange],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addTag(inputValue);
      }
      if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
        removeTag(tags.length - 1);
      }
    },
    [inputValue, tags, addTag, removeTag],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // If user pastes/types a comma, split and add
      if (val.includes(',')) {
        const parts = val.split(',');
        parts.forEach((p) => addTag(p));
        return;
      }
      setInputValue(val);
    },
    [addTag],
  );

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-xl px-3 py-2 min-h-[42px]"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {tags.map((tag, i) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium text-amber-200/80"
          style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.2)',
          }}
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="hover:text-amber-100 transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}

      {tags.length < max && (
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          maxLength={maxLength}
          className="flex-1 min-w-[100px] bg-transparent text-sm text-white/70 placeholder:text-white/15 outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        />
      )}
    </div>
  );
}
