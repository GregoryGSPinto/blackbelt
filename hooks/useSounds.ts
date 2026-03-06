'use client';

import { useCallback, useRef, useEffect, useState } from 'react';

type SoundType = 'checkin' | 'notification' | 'error';

const STORAGE_KEY = 'blackbelt_sounds_enabled';

const SOUND_FILES: Record<SoundType, string> = {
  checkin: '/sounds/checkin.mp3',
  notification: '/sounds/notification.mp3',
  error: '/sounds/error.mp3',
};

/**
 * useSounds — Plays subtle UI sounds with a user-controllable toggle.
 *
 * Sounds are stored in public/sounds/ and are <50KB each.
 * Respects user preference saved in localStorage.
 */
export function useSounds() {
  const [enabled, setEnabled] = useState(false);
  const audioCache = useRef<Map<string, HTMLAudioElement>>(new Map());

  // Load preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // Default to false — sounds are opt-in
      setEnabled(saved === 'true');
    } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setEnabled(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const setEnabledValue = useCallback((value: boolean) => {
    setEnabled(value);
    try { localStorage.setItem(STORAGE_KEY, String(value)); } catch { /* ignore */ }
  }, []);

  const play = useCallback((type: SoundType) => {
    if (!enabled) return;

    try {
      const src = SOUND_FILES[type];
      let audio = audioCache.current.get(src);
      if (!audio) {
        audio = new Audio(src);
        audio.volume = 0.3;
        audioCache.current.set(src, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => { /* ignore autoplay block */ });
    } catch { /* ignore */ }
  }, [enabled]);

  return { enabled, toggle, setEnabled: setEnabledValue, play };
}
