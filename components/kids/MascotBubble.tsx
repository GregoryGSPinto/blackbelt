'use client';

import { memo } from 'react';

type Mood = 'happy' | 'excited' | 'encouraging' | 'proud';

interface MascotBubbleProps {
  message: string;
  mood: Mood;
}

const moodConfig: Record<Mood, { emoji: string; bg: string; border: string; text: string }> = {
  happy: {
    emoji: '😊',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
  },
  excited: {
    emoji: '🤩',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-300',
  },
  encouraging: {
    emoji: '💪',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-300',
  },
  proud: {
    emoji: '🌟',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
  },
};

/**
 * MascotBubble — Balao de fala do mascote com cauda CSS e cores por humor
 */
const MascotBubble = memo(function MascotBubble({ message, mood }: MascotBubbleProps) {
  const config = moodConfig[mood];

  return (
    <div className="flex items-end gap-3">
      {/* Mascot Emoji */}
      <div
        className={`w-12 h-12 rounded-full ${config.bg} border ${config.border} flex items-center justify-center shrink-0`}
      >
        <span className="text-2xl">{config.emoji}</span>
      </div>

      {/* Speech Bubble */}
      <div className="relative flex-1">
        {/* Tail (CSS triangle) */}
        <div
          className="absolute left-[-6px] bottom-3 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(63, 63, 70, 0.7)',
          }}
        />

        {/* Bubble */}
        <div
          className={`${config.bg} border ${config.border} rounded-xl rounded-bl-sm px-4 py-3`}
        >
          <p className={`text-sm leading-relaxed ${config.text}`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
});

export default MascotBubble;
